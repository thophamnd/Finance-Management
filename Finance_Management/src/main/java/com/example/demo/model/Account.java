package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1. KIỂM SOÁT TÊN VÍ: Không được rỗng và giới hạn độ dài
    @NotBlank(message = "Tên tài khoản/ví không được để trống!")
    @Size(max = 50, message = "Tên tài khoản/ví không được dài quá 50 ký tự!")
    @Column(name = "account_name", nullable = false)
    private String accountName; // Ví dụ: "Ví tiền mặt", "Vietcombank"

    // 2. KIỂM SOÁT SỐ DƯ: Bắt buộc phải có giá trị (không được null)
    // Lưu ý: Anh không chặn @DecimalMin("0.0") ở đây để hệ thống cho phép xài thẻ tín dụng (số dư âm).
    @NotNull(message = "Số dư tài khoản không được để trống!")
    @Column(precision = 19, scale = 2, nullable = false)
    private BigDecimal balance;

    // 3. KIỂM SOÁT KHÓA NGOẠI: Ví này phải là của ai đó, không thể trôi nổi
    @NotNull(message = "Tài khoản bắt buộc phải gắn với một người dùng!")
    @ManyToOne
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    // Nếu sau này bạn muốn một tài khoản có nhiều giao dịch
    // @OneToMany(mappedBy = "account")
    // private List<Transaction> transactions;
}