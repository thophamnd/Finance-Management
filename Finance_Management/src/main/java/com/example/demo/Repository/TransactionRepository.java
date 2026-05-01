package com.example.demo.Repository;

import com.example.demo.model.JarType;
import com.example.demo.model.Transaction;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // Chỉ giữ lại các hàm tìm kiếm tuỳ chỉnh, XÓA HẲN hàm findAll() đi
    List<Transaction> findByUserOrderByTransactionDateDesc(User user);
    List<Transaction> findByCategoryId(Long categoryId);
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.category.jarType = :jarType AND t.transactionDate >= :startDate AND t.transactionDate <= :endDate")
    BigDecimal getTotalSpentByJarAndMonth(
            @Param("userId") Long userId,
            @Param("jarType") JarType jarType,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}