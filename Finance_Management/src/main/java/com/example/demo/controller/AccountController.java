package com.example.demo.controller;

import com.example.demo.Repository.AccountRepository;
import com.example.demo.Repository.UserRepository;
import com.example.demo.dto.AccountRequest;
import com.example.demo.dto.AccountResponse;
import com.example.demo.model.Account;
import com.example.demo.model.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AccountController {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    // 1. API LẤY DANH SÁCH (GET) -> TRẢ VỀ DTO (Làm phẳng, giấu User)
    @GetMapping
    public ResponseEntity<?> getAccounts(Principal principal) {
        try {
            // Tìm user đang đăng nhập
            User user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

            // Lấy danh sách tài khoản của riêng user đó
            List<Account> accounts = accountRepository.findByUser(user);

            // CHUYỂN ĐỔI: Entity -> Response DTO
            List<AccountResponse> responseList = accounts.stream().map(acc ->
                    AccountResponse.builder()
                            .id(acc.getId())
                            .accountName(acc.getAccountName())
                            .balance(acc.getBalance())
                            .build()
            ).collect(Collectors.toList());

            return ResponseEntity.ok(responseList);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    // 2. API TẠO MỚI (POST) -> HỨNG BẰNG DTO
    @PostMapping
    public ResponseEntity<?> createAccount(
            @Valid @RequestBody AccountRequest request, // Lá chắn kiểm duyệt tự động
            BindingResult result,
            Principal principal) {

        // 1. Chặn lỗi cơ bản từ DTO (Tên rỗng, null...)
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(Map.of("message", result.getAllErrors().get(0).getDefaultMessage()));
        }

        try {
            // Lấy user đang đăng nhập
            User user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

            // Lấy dữ liệu an toàn từ DTO
            String accountName = request.getAccountName().trim();

            // 2. Chặn lỗi nghiệp vụ (Trùng tên ví) - Logic cũ của em rất tốt!
            if (accountRepository.findByUserAndAccountName(user, accountName).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Tên ví này đã tồn tại! Vui lòng chọn tên khác."));
            }

            // Tạo đối tượng Account mới và lưu vào DB
            Account account = new Account();
            account.setAccountName(accountName);
            account.setBalance(request.getBalance());
            account.setUser(user);

            accountRepository.save(account);

            return ResponseEntity.ok(Map.of("message", "Tạo tài khoản thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    // 3. API XÓA (DELETE) -> BẢO MẬT CHỦ SỞ HỮU
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAccount(@PathVariable Long id, Principal principal) {
        try {
            User user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Chưa đăng nhập"));

            Account account = accountRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

            // Hàng rào bảo vệ chống xóa trộm
            if (!account.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Cảnh báo: Bạn không có quyền xóa ví này!"));
            }

            accountRepository.delete(account);
            return ResponseEntity.ok(Map.of("message", "Đã xóa ví thành công!"));

        } catch (Exception e) {
            // Lỗi khóa ngoại: Nếu ví đang chứa giao dịch thì không được xóa
            return ResponseEntity.badRequest().body(Map.of("message", "Không thể xóa! Ví này đang chứa lịch sử giao dịch. Hãy xóa các giao dịch của ví này trước."));
        }
    }
}