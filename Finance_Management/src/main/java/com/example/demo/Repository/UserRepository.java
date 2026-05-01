package com.example.demo.Repository;

import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Tìm người dùng theo username để kiểm tra đăng nhập
 Optional<User> findByUsername(String username);

    // Kiểm tra xem username đã tồn tại chưa khi đăng ký
    Boolean existsByUsername(String username);
}