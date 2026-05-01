package com.example.demo.dto;

import com.example.demo.model.JarType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder // Dùng Builder để lát nữa chuyển đổi code cho nhàn
public class CategoryResponse {
    private Long id;
    private String name;
    private String icon;
    private JarType jarType;
    // Để ý: Chúng ta KHÔNG lấy List<Transaction> ra đây để tránh nặng máy và lỗi JSON
}