package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống!")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3 đến 50 ký tự!")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới!")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống!")
    @Size(min = 6, max = 20, message = "Mật khẩu phải từ 6 đến 20 ký tự!")
    // Có thể mở khóa dòng dưới nếu em muốn ép người dùng phải đặt mật khẩu khó:
    // @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$", message = "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số!")
    private String password;

    @NotBlank(message = "Họ và tên không được để trống!")
    @Size(max = 100, message = "Họ và tên không được dài quá 100 ký tự!")
    private String fullName;

    @NotBlank(message = "Email không được để trống!")
    @Email(message = "Email không đúng định dạng! (Ví dụ: name@gmail.com)")
    private String email;
}