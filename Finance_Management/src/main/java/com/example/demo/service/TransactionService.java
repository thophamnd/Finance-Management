package com.example.demo.service;

import com.example.demo.Repository.*;
import com.example.demo.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetRepository budgetRepository;
    private final AccountRepository accountRepository; // Đã tiêm Repository để tìm Account

    @Transactional
    public void processTransaction(Long userId, Long categoryId, Long accountId, BigDecimal amount, String note, String dateStr, String type, User user) {

        // CHỈ TÌM CATEGORY NẾU CATEGORY_ID KHÁC NULL (Tức là khi Chi tiêu)
        Category category = null;
        if (categoryId != null) {
            category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));
        }

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Tài khoản nguồn không tồn tại"));

        if (!account.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền sử dụng tài khoản này!");
        }

        Transaction t = new Transaction();
        t.setAmount(amount);
        t.setNote(note);
        // Kiểm tra nếu chuỗi gửi lên có đủ giờ phút chưa, nếu chưa có (độ dài 10) thì mới nối thêm T00:00
        if (dateStr.length() == 10) {
            t.setTransactionDate(LocalDateTime.parse(dateStr + "T00:00:00"));
        } else {
            t.setTransactionDate(LocalDateTime.parse(dateStr));
        }
        t.setUser(user);
        t.setAccount(account);
        t.setCategory(category); // Ở đây có thể null nếu là thu nhập
        transactionRepository.save(t);

        BigDecimal currentBalance = account.getBalance() != null ? account.getBalance() : BigDecimal.ZERO;

        if ("INCOME".equalsIgnoreCase(type)) {
            account.setBalance(currentBalance.add(amount));
        } else {
            account.setBalance(currentBalance.subtract(amount));

            // Chỉ cập nhật Ngân sách nếu có Category
            if (category != null && category.getJarType() != null) {
                String monthString = dateStr.substring(0, 7);
                Optional<Budget> budgetOpt = budgetRepository.findByUserIdAndMonthStringAndJarType(
                        userId, monthString, category.getJarType());

                if (budgetOpt.isPresent()) {
                    Budget b = budgetOpt.get();
                    BigDecimal currentSpent = b.getSpentAmount() != null ? b.getSpentAmount() : BigDecimal.ZERO;
                    b.setSpentAmount(currentSpent.add(amount));
                    budgetRepository.save(b);
                }
            }
        }

        accountRepository.save(account);
    }}