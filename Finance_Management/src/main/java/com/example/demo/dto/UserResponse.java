package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder // Sử dụng @Builder để khởi tạo dữ liệu nhanh trong Controller
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String username;
    private String fullName;
    private String email;

    // Lưu ý cực kỳ quan trọng:
    // KHÔNG ĐƯỢC khai báo biến "password" ở đây!
    // Bằng cách này, dù lỡ tay, em cũng không bao giờ gửi nhầm mật khẩu ra ngoài API.
}