package com.example.demo.Repository;

import com.example.demo.model.Budget;
import com.example.demo.model.JarType; // Đảm bảo import Enum này
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    // 1. Dùng để hiển thị danh sách 6 lọ trên giao diện React (Trang Budgets)
    List<Budget> findByUserIdAndMonthString(Long userId, String monthString);

    // 2. Dùng trong TransactionService để tìm ĐÚNG chiếc lọ cần cập nhật tiền
    // Trả về Optional để tránh lỗi NullPointerException nếu tháng đó chưa thiết lập ngân sách
    Optional<Budget> findByUserIdAndMonthStringAndJarType(Long userId, String monthString, JarType jarType);
}