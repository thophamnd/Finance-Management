package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "budgets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1. KIỂM SOÁT TÊN: Không rỗng và giới hạn độ dài
    @NotBlank(message = "Tên ngân sách không được để trống!")
    @Size(max = 100, message = "Tên ngân sách không được dài quá 100 ký tự!")
    @Column(nullable = false)
    private String name;

    // 2. KIỂM SOÁT LOẠI LỌ: Bắt buộc phải có
    @NotNull(message = "Loại lọ (Jar Type) không được để trống!")
    @Enumerated(EnumType.STRING)
    @Column(name = "jar_type", nullable = false)
    private JarType jarType;

    // 3. KIỂM SOÁT HẠN MỨC: Bắt buộc và không được là số âm
    @NotNull(message = "Hạn mức không được để trống!")
    @DecimalMin(value = "0.0", message = "Hạn mức ngân sách không được là số âm!")
    @Column(name = "limit_amount", precision = 19, scale = 2, nullable = false)
    private BigDecimal limitAmount;

    // 4. KIỂM SOÁT TIỀN ĐÃ TIÊU: Không được là số âm
    @DecimalMin(value = "0.0", message = "Số tiền đã tiêu không được là số âm!")
    @Column(name = "spent_amount", precision = 19, scale = 2)
    private BigDecimal spentAmount = BigDecimal.ZERO;

    @Size(max = 50, message = "Tên icon không được quá dài!")
    private String icon;

    // 5. KIỂM SOÁT ĐỊNH DẠNG THÁNG: Dùng Regex ép buộc nhập đúng kiểu 2026-04
    @NotBlank(message = "Tháng áp dụng không được để trống!")
    @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "Tháng phải tuân thủ đúng định dạng YYYY-MM (Ví dụ: 2026-04)!")
    @Column(name = "month_string", nullable = false, length = 7)
    private String monthString;

    // 6. KIỂM SOÁT KHÓA NGOẠI: Bắt buộc phải thuộc về 1 User
    @NotNull(message = "Ngân sách bắt buộc phải gắn với một người dùng!")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;
}