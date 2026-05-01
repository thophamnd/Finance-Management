package com.example.demo.controller;

import com.example.demo.Repository.TransactionRepository;
import com.example.demo.Repository.UserRepository;
import com.example.demo.dto.TransactionRequest;
import com.example.demo.dto.TransactionResponse;
import com.example.demo.model.Transaction;
import com.example.demo.model.User;
import com.example.demo.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    /**
     * 1. TẠO GIAO DỊCH (POST) -> SỬ DỤNG LÁ CHẮN DTO
     */
    @PostMapping
    public ResponseEntity<?> createTransaction(
            @Valid @RequestBody TransactionRequest request, // Spring Boot tự bóc tách và kiểm duyệt
            BindingResult result,
            Principal principal) {

        // BẢO MẬT: Bật ngược lại ngay nếu React gửi thiếu dữ liệu hoặc số tiền âm
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(Map.of("message", result.getAllErrors().get(0).getDefaultMessage()));
        }

        try {
            // 1. Tìm user đang đăng nhập
            User user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            // 2. Gọi hàm Service (Truyền thẳng dữ liệu cực nhàn từ DTO)
            transactionService.processTransaction(
                    user.getId(),
                    request.getCategoryId(),
                    request.getAccountId(),
                    request.getAmount(),
                    request.getNote(),
                    request.getTransactionDate(),
                    request.getType(),
                    user
            );

            return ResponseEntity.ok(Map.of("message", "Lưu giao dịch thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    /**
     * 2. LẤY DANH SÁCH (GET) -> LÀM PHẲNG DỮ LIỆU ĐỂ REACT DỄ DÙNG
     */
    @GetMapping
    public ResponseEntity<?> getAllTransactions(Principal principal) {
        try {
            // 1. Lấy user đang đăng nhập
            User user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Chưa đăng nhập"));

            // 2. Lấy giao dịch của RIÊNG user này, sắp xếp cái mới nhất lên đầu
            List<Transaction> transactions = transactionRepository.findByUserOrderByTransactionDateDesc(user);

            // 3. CHUYỂN ĐỔI VÀ LÀM PHẲNG DỮ LIỆU (Entity -> Response DTO)
            List<TransactionResponse> responseList = transactions.stream().map(t -> {

                // Xử lý an toàn: Nếu category bị null (tức là Khoản Thu nhập)
                Long catId = t.getCategory() != null ? t.getCategory().getId() : null;
                String catName = t.getCategory() != null ? t.getCategory().getName() : "Thu nhập";
                String catIcon = t.getCategory() != null ? t.getCategory().getIcon() : "payments";

                // Tự động phân loại INCOME / EXPENSE để React dễ tô màu (Xanh/Đỏ)
                String type = t.getCategory() == null ? "INCOME" : "EXPENSE";

                return TransactionResponse.builder()
                        .id(t.getId())
                        .amount(t.getAmount())
                        .note(t.getNote())
                        .transactionDate(t.getTransactionDate())
                        .type(type)
                        .accountId(t.getAccount().getId())
                        .accountName(t.getAccount().getAccountName()) // Kéo Tên Ví ra ngoài luôn
                        .categoryId(catId)
                        .categoryName(catName)                        // Kéo Tên Danh mục ra ngoài luôn
                        .categoryIcon(catIcon)
                        .build();
            }).collect(Collectors.toList());

            // Trả list JSON siêu mượt về cho React
            return ResponseEntity.ok(responseList);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi khi tải giao dịch: " + e.getMessage()));
        }
    }
}