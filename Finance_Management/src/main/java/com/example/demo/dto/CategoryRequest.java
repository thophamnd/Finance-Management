package com.example.demo.dto;

import com.example.demo.model.JarType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {

    @NotBlank(message = "Tên danh mục không được để trống!")
    @Size(max = 100, message = "Tên danh mục không được quá 100 ký tự!")
    private String name;

    private String icon;

    @NotNull(message = "Vui lòng chọn loại lọ (Jar Type) cho danh mục này!")
    private JarType jarType;
}