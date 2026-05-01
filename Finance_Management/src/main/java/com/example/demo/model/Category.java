package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1. KIỂM SOÁT TÊN DANH MỤC: Bắt buộc nhập và không quá dài
    @NotBlank(message = "Tên danh mục không được để trống!")
    @Size(max = 100, message = "Tên danh mục không được dài quá 100 ký tự!")
    @Column(nullable = false, length = 100)
    private String name;

    // 2. KIỂM SOÁT ICON: Có thể để trống nhưng không được quá dài
    @Size(max = 255, message = "Tên icon không được dài quá 255 ký tự!")
    @Column(length = 255)
    private String icon;

    // 3. KIỂM SOÁT LOẠI LỌ: Bắt buộc phải chọn nó thuộc về quỹ nào
    @NotNull(message = "Vui lòng chọn loại lọ (Jar Type) cho danh mục này!")
    @Enumerated(EnumType.STRING)
    @Column(name = "jar_type", nullable = false, length = 50)
    private JarType jarType;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    @JsonIgnore // Cực kỳ quan trọng: Ngăn vòng lặp JSON
    private List<Transaction> transactions;

    // Constructor tùy chỉnh để tạo dữ liệu mẫu nhanh (Seeding)
    public Category(String name, String icon, JarType jarType) {
        this.name = name;
        this.icon = icon;
        this.jarType = jarType;
    }

    public void setIconCode(String iconCode) {
    }
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;
}