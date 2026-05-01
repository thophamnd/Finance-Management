package com.example.demo.Repository;



import com.example.demo.model.Category;
import com.example.demo.model.JarType;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    // Lấy tất cả danh mục thuộc cùng một loại lọ (ví dụ: lấy tất cả các mục thuộc lọ NEC)
    List<Category> findByJarType(JarType jarType);
    boolean existsByName(String name);
    List<Category> findByUser(User user);
}