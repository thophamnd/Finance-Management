package com.example.demo.controller;

import com.example.demo.Repository.CategoryRepository;
import com.example.demo.Repository.UserRepository;
import com.example.demo.dto.CategoryRequest;
import com.example.demo.dto.CategoryResponse;
import com.example.demo.model.Category;
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
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository; // Bắt buộc phải có để lấy thông tin người đăng nhập

    /**
     * 1. LẤY DANH SÁCH (GET) -> CHỈ LẤY CỦA USER ĐANG ĐĂNG NHẬP
     */
    @GetMapping
    public ResponseEntity<?> getAllCategories(Principal principal) {
        // Tìm xem ai đang đăng nhập
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();

        // Chỉ lấy danh mục do chính người này tạo ra
        List<Category> categories = categoryRepository.findByUser(user);

        // LÀM PHẲNG DỮ LIỆU: Entity -> DTO
        List<CategoryResponse> responseList = categories.stream()
                .map(cat -> CategoryResponse.builder()
                        .id(cat.getId())
                        .name(cat.getName())
                        .icon(cat.getIcon())
                        .jarType(cat.getJarType())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    /**
     * 2. TẠO MỚI (POST) -> GÁN CHỦ SỞ HỮU LÀ NGƯỜI ĐANG ĐĂNG NHẬP
     */
    @PostMapping
    public ResponseEntity<?> createCategory(
            @Valid @RequestBody CategoryRequest request,
            BindingResult result,
            Principal principal) { // Lấy Principal ở đây

        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(Map.of("message", result.getAllErrors().get(0).getDefaultMessage()));
        }

        try {
            User user = userRepository.findByUsername(principal.getName()).orElseThrow();

            Category category = new Category();
            category.setName(request.getName().trim());
            category.setIcon(request.getIcon());
            category.setJarType(request.getJarType());
            category.setUser(user); // Đánh dấu bản quyền: Danh mục này thuộc về User này!

            Category savedCategory = categoryRepository.save(category);

            CategoryResponse response = CategoryResponse.builder()
                    .id(savedCategory.getId())
                    .name(savedCategory.getName())
                    .icon(savedCategory.getIcon())
                    .jarType(savedCategory.getJarType())
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi tạo danh mục: " + e.getMessage()));
        }
    }

    /**
     * 3. XÓA (DELETE) -> BẢO MẬT CẤP CAO: CHỈ CHO XÓA CỦA MÌNH
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id, Principal principal) {
        try {
            User user = userRepository.findByUsername(principal.getName()).orElseThrow();

            Category category = categoryRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

            // Hàng rào bảo mật: Nếu ID người tạo không trùng khớp với ID người đang đăng nhập -> Báo lỗi chặn ngay
            if (!category.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Cảnh báo: Bạn không có quyền xóa danh mục của người khác!"));
            }

            categoryRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa danh mục thành công!"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không thể xóa! Có thể danh mục này đang chứa giao dịch."));
        }
    }
}