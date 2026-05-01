package com.example.demo; // Đổi lại package cho đúng

import com.example.demo.Repository.CategoryRepository;
import com.example.demo.model.Category;
import com.example.demo.model.JarType;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    public DataSeeder(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Nếu bảng danh mục đang trống trơn (Do bị xóa)
        if (categoryRepository.count() == 0) {
            List<Category> defaultCategories = Arrays.asList(
                    createCategory("Ăn uống", "restaurant", JarType.NECESSITIES),
                    createCategory("Tiền nhà", "home", JarType.NECESSITIES),
                    createCategory("Học phí", "school", JarType.EDUCATION),
                    createCategory("Sách vở", "menu_book", JarType.EDUCATION),
                    createCategory("Xem phim", "movie", JarType.PLAY),
                    createCategory("Mua sắm", "shopping_bag", JarType.PLAY),
                    createCategory("Đầu tư CK", "trending_up", JarType.FINANCIAL_FREE),
                    createCategory("Từ thiện", "volunteer_activism", JarType.GIVE)
            );

            categoryRepository.saveAll(defaultCategories);
            System.out.println(">>> Đã tự động tạo 8 danh mục mặc định an toàn!");
        }
    }

    // Hàm phụ giúp tạo Category an toàn không lo lỗi Constructor
    private Category createCategory(String name, String icon, JarType jarType) {
        Category category = new Category();
        category.setName(name);
        category.setIcon(icon);
        category.setJarType(jarType);
        return category;
    }
}