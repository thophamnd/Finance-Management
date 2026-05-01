package com.example.demo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransactionRequest {

    @NotNull(message = "Số tiền không được để trống!")
    @DecimalMin(value = "0.01", message = "Số tiền giao dịch phải lớn hơn 0!")
    private BigDecimal amount;

    @NotNull(message = "Vui lòng chọn nguồn tiền (Ví/Tài khoản)!")
    private Long accountId;

    // Có thể null đối với giao dịch Thu nhập
    private Long categoryId;

    @NotBlank(message = "Ngày giờ giao dịch không được để trống!")
    private String transactionDate;

    @Size(max = 1000, message = "Ghi chú không được dài quá 1000 ký tự!")
    private String note;

    @NotBlank(message = "Loại giao dịch không được để trống!")
    @Pattern(regexp = "^(INCOME|EXPENSE)$", message = "Loại giao dịch chỉ được là INCOME hoặc EXPENSE!")
    private String type;
}