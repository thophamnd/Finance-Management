package com.example.demo.service;

import com.example.demo.Repository.AccountRepository;
import com.example.demo.Repository.CategoryRepository;
import com.example.demo.Repository.UserRepository;
import com.example.demo.dto.UserRequest;
import com.example.demo.model.Account;
import com.example.demo.model.Category;
import com.example.demo.model.JarType;
import com.example.demo.model.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j // Kích hoạt bộ ghi Log chuyên nghiệp, thay thế hoàn toàn System.out.println
public class AuthService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    // Đã được đưa vào đúng vị trí an toàn bên trong class
    private final CategoryRepository categoryRepository;

    /**
     * XỬ LÝ ĐĂNG KÝ: Nhận thẳng DTO từ Controller để code Controller siêu gọn
     */
    @Transactional
    public User register(UserRequest request) {

        // 1. Kiểm tra trùng lặp tên đăng nhập
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }

        // 2. Chuyển đổi dữ liệu từ DTO sang Entity và Mã hóa mật khẩu
        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim());

        // LƯU USER VÀO DB (Đoạn này lúc nãy em bị thiếu)
        User savedUser = userRepository.save(user);

        // 3. Tạo ví tiền mặc định cho "người mới"
        Account account = new Account();
        account.setBalance(BigDecimal.ZERO);
        account.setAccountName("Ví cá nhân");
        account.setUser(savedUser); // Bây giờ savedUser đã có dữ liệu chuẩn chỉnh
        accountRepository.save(account);

        // 4. Tạo bộ Danh mục (Starter Pack) cho user mới
        List<Category> defaultCategories = List.of(
                createCategory("Thiết yếu", "home", JarType.NECESSITIES, savedUser),
                createCategory("Tiết kiệm", "savings", JarType.LONG_TERM_SAVE, savedUser),
                createCategory("Đầu tư", "trending_up", JarType.FINANCIAL_FREE, savedUser),
                createCategory("Giáo dục", "school", JarType.EDUCATION, savedUser),
                createCategory("Hưởng thụ", "movie", JarType.PLAY, savedUser),
                createCategory("Cho đi", "volunteer_activism", JarType.GIVE, savedUser),
                createCategory("Ăn uống", "restaurant", JarType.NECESSITIES, savedUser),
                createCategory("Di chuyển", "directions_car", JarType.NECESSITIES, savedUser)
        );
        categoryRepository.saveAll(defaultCategories);

        return savedUser;
    }

    // HÀM PHỤ TẠO DANH MỤC
    private Category createCategory(String name, String icon, JarType jarType, User user) {
        Category category = new Category();
        category.setName(name);
        category.setIcon(icon);
        category.setJarType(jarType);
        category.setUser(user);
        return category;
    }

    /**
     * XỬ LÝ ĐĂNG NHẬP: So sánh mật khẩu và Ghi Log an toàn
     */
    public User login(String username, String rawPassword) {
        // Dùng log.info để ghi nhận hệ thống
        log.info("Hệ thống đang xác thực cho user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại!"));

        boolean isMatch = passwordEncoder.matches(rawPassword, user.getPassword());

        if (!isMatch) {
            log.warn("Cảnh báo bảo mật: Sai mật khẩu cho user ({})", username);
            throw new RuntimeException("Sai mật khẩu!");
        }

        log.info("Xác thực thành công user: {}", username);
        return user;
    }
}