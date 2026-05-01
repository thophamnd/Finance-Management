package com.example.demo.Repository;

import com.example.demo.model.Account;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    // Tìm tất cả tài khoản thuộc về một người dùng cụ thể
    List<Account> findByUser(User user);
    Optional<Account> findByUserAndAccountName(User user, String accountName);
}