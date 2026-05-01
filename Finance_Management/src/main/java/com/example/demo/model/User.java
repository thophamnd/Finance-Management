package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1. CHẶN TÊN ĐĂNG NHẬP RỖNG VÀ ĐỘ DÀI
    @NotBlank(message = "Tên đăng nhập không được để trống!")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3 đến 50 ký tự!")
    @Column(unique = true, nullable = false, length = 50)
    private String username;

    // 2. CHỈ CHẶN RỖNG (Không chặn độ dài max vì BCrypt mã hóa ra tới 60 ký tự)
    @NotBlank(message = "Mật khẩu không được để trống!")
    @Column(nullable = false, length = 255)
    private String password;

    // 3. CHẶN HỌ TÊN RỖNG VÀ QUÁ DÀI
    @NotBlank(message = "Họ và tên không được để trống!")
    @Size(max = 100, message = "Họ và tên không được dài quá 100 ký tự!")
    @Column(name = "full_name")
    private String fullName;

    // 4. KIỂM TRA CHUẨN ĐỊNH DẠNG EMAIL TRƯỚC KHI LƯU
    @NotBlank(message = "Email không được để trống!")
    @Email(message = "Email không đúng định dạng! (Ví dụ hợp lệ: name@gmail.com)")
    @Column(unique = true)
    private String email;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Account> accounts;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Transaction> transactions;
}