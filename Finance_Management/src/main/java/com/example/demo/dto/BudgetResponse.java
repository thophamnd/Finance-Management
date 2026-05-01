package com.example.demo.dto;

import com.example.demo.model.JarType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class BudgetResponse {
    private Long id;
    private String name;
    private JarType jarType;
    private BigDecimal limitAmount;
    private BigDecimal spentAmount;
    private String icon;
    private String monthString;
}