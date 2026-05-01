package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1. KIỂM SOÁT SỐ TIỀN: Không được rỗng và phải lớn hơn 0
    @NotNull(message = "Số tiền giao dịch không được để trống!")
    @DecimalMin(value = "0.01", message = "Số tiền giao dịch phải lớn hơn 0!")
    @Column(precision = 19, scale = 2, nullable = false)
    private BigDecimal amount;

    // 2. KIỂM SOÁT GHI CHÚ: Dù là kiểu TEXT nhưng cũng nên giới hạn để tránh bị spam dữ liệu
    @Size(max = 1000, message = "Ghi chú không được dài quá 1000 ký tự!")
    @Column(columnDefinition = "TEXT")
    private String note;

    // 3. KIỂM SOÁT THỜI GIAN: Bắt buộc phải có
    @NotNull(message = "Ngày giờ giao dịch không được để trống!")
    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    // 4. KIỂM SOÁT KHÓA NGOẠI (Người dùng & Ví tiền): Bắt buộc phải tồn tại
    @NotNull(message = "Giao dịch bắt buộc phải thuộc về một người dùng!")
    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @NotNull(message = "Giao dịch bắt buộc phải trừ/cộng vào một Ví (Nguồn tiền)!")
    @ManyToOne
    @JoinColumn(name = "account_id", referencedColumnName = "id")
    private Account account;

    // 5. DANH MỤC (Lọ): ĐỂ TRỐNG (KHÔNG GẮN @NotNull)
    // Lý do: Các giao dịch "Thu nhập" (INCOME) sẽ không có danh mục, nên chỗ này có thể nhận giá trị null.
    @ManyToOne
    @JoinColumn(name = "category_id", referencedColumnName = "id")
    private Category category;
}