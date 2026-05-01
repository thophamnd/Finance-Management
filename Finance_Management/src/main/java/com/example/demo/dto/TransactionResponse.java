package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class TransactionResponse {
    private Long id;
    private BigDecimal amount;
    private String note;
    private LocalDateTime transactionDate;
    private String type; // Tự thêm để phân biệt INCOME / EXPENSE ở Frontend

    // Làm phẳng dữ liệu Nguồn tiền (Chỉ gửi Tên và ID)
    private Long accountId;
    private String accountName;

    // Làm phẳng dữ liệu Danh mục (Chỉ gửi Tên, Icon và ID)
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
}