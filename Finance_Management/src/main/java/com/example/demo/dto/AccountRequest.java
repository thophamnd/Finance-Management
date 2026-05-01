package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AccountRequest {

    @NotBlank(message = "Tên tài khoản/ví không được để trống!")
    @Size(max = 50, message = "Tên tài khoản/ví không được dài quá 50 ký tự!")
    private String accountName;

    // Không chặn số âm ở đây để cho phép nhập dư nợ thẻ tín dụng
    @NotNull(message = "Số dư ban đầu không được để trống!")
    private BigDecimal balance;
}