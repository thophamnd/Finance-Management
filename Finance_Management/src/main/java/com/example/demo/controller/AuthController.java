package com.example.demo.controller;

import com.example.demo.Repository.AccountRepository;
import com.example.demo.Repository.UserRepository;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.UserRequest; // (Chính là DTO Đăng ký em đã tạo)
import com.example.demo.dto.UserResponse;
import com.example.demo.model.User;
import com.example.demo.service.AuthService;
import com.example.demo.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;

    /**
     * 1. API ĐĂNG KÝ (Sử dụng DTO hứng dữ liệu và chặn lỗi)
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRequest request, BindingResult result) {

        // 1. Chặn lỗi từ DTO
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(Map.of("message", result.getAllErrors().get(0).getDefaultMessage()));
        }

        try {
            // 2. Truyền ĐÚNG biến 'request' (kiểu UserRequest) vào hàm authService
            User registeredUser = authService.register(request);

            // 3. Đóng gói lại thành Response để giấu Password
            UserResponse response = UserResponse.builder()
                    .id(registeredUser.getId())
                    .username(registeredUser.getUsername())
                    .fullName(registeredUser.getFullName())
                    .email(registeredUser.getEmail())
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Đăng ký thành công!",
                    "user", response
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    /**
     * 2. API ĐĂNG NHẬP (Sử dụng LoginRequest DTO)
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request,
            BindingResult result) {

        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(Map.of("message", result.getAllErrors().get(0).getDefaultMessage()));
        }

        log.info("Yêu cầu đăng nhập cho username: {}", request.getUsername());

        try {
            User user = authService.login(request.getUsername(), request.getPassword());
            String token = jwtTokenProvider.generateToken(user.getUsername());

            // Trả về Token và thông tin cơ bản
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("username", user.getUsername());
            response.put("fullName", user.getFullName());
            response.put("email", user.getEmail());
            response.put("message", "Đăng nhập thành công");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Xác thực thất bại: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Tên đăng nhập hoặc mật khẩu không chính xác!"));
        }
    }

    /**
     * 3. API LẤY THÔNG TIN CÁ NHÂN (Trả về Response DTO)
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Chưa đăng nhập"));
        }

        try {
            User user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            // Đóng gói an toàn, loại bỏ Password, Accounts, Transactions để JSON gọn nhẹ
            UserResponse response = UserResponse.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}