package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class AccountResponse {
    private Long id;
    private String accountName;
    private BigDecimal balance;
    // Không trả về User ở đây để bảo mật
}