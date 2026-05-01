package com.example.demo.controller;

import com.example.demo.Repository.BudgetRepository;
import com.example.demo.Repository.TransactionRepository;
import com.example.demo.Repository.UserRepository;
import com.example.demo.dto.AutoBudgetRequest;
import com.example.demo.dto.BudgetResponse;
import com.example.demo.dto.ManualBudgetRequest;
import com.example.demo.model.Budget;
import com.example.demo.model.JarType;
import com.example.demo.model.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BudgetController {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    /**
     * 1. LẤY DANH SÁCH NGÂN SÁCH (GET) -> LÀM PHẲNG SANG DTO
     */
    @GetMapping
    public ResponseEntity<?> getBudgetsByMonth(@RequestParam String month, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthString(user.getId(), month);

        // CHUYỂN ĐỔI: Entity -> Response DTO
        List<BudgetResponse> responseList = budgets.stream().map(b -> BudgetResponse.builder()
                .id(b.getId())
                .name(b.getName())
                .jarType(b.getJarType())
                .limitAmount(b.getLimitAmount())
                .spentAmount(b.getSpentAmount())
                .icon(b.getIcon())
                .monthString(b.getMonthString())
                .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    /**
     * 2. TẠO HOẶC CẬP NHẬT 6 CHIẾC LỌ TỰ ĐỘNG (POST) -> HỨNG BẰNG DTO
     */
    @PostMapping("/auto-6-jars")
    public ResponseEntity<?> create6Jars(
            @Valid @RequestBody AutoBudgetRequest request, // Lá chắn kiểm duyệt
            BindingResult result,
            Principal principal) {

        // Kiểm tra lỗi từ DTO (Thu nhập âm, tháng sai định dạng...)
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(Map.of("message", result.getAllErrors().get(0).getDefaultMessage()));
        }

        try {
            User user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Chưa đăng nhập"));

            // Dữ liệu lấy thẳng từ Request cực nhàn, không cần ép kiểu
            BigDecimal income = request.getIncome();
            String month = request.getMonth();

            // CHỐT CHẶN BẢO MẬT: KHÔNG CHO PHÉP TẠO NGÂN SÁCH TRONG QUÁ KHỨ
            YearMonth requestYearMonth = YearMonth.parse(month);
            YearMonth currentYearMonth = YearMonth.now();

            if (requestYearMonth.isBefore(currentYearMonth)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Không thể tạo ngân sách cho tháng trong quá khứ! Vui lòng chọn từ tháng " + currentYearMonth + " trở đi."
                ));
            }

            LocalDateTime startDate = requestYearMonth.atDay(1).atStartOfDay();
            LocalDateTime endDate = requestYearMonth.atEndOfMonth().atTime(23, 59, 59);

            Map<JarType, Double> jarPercentages = Map.of(
                    JarType.NECESSITIES, 0.55,
                    JarType.LONG_TERM_SAVE, 0.10,
                    JarType.FINANCIAL_FREE, 0.10,
                    JarType.EDUCATION, 0.10,
                    JarType.PLAY, 0.10,
                    JarType.GIVE, 0.05
            );

            for (Map.Entry<JarType, Double> entry : jarPercentages.entrySet()) {
                JarType type = entry.getKey();
                BigDecimal limit = income.multiply(BigDecimal.valueOf(entry.getValue()));

                Budget budget = budgetRepository.findByUserIdAndMonthStringAndJarType(user.getId(), month, type)
                        .orElse(new Budget());

                BigDecimal totalSpent = transactionRepository.getTotalSpentByJarAndMonth(user.getId(), type, startDate, endDate);

                budget.setUser(user);
                budget.setMonthString(month);
                budget.setJarType(type);
                budget.setLimitAmount(limit);
                budget.setSpentAmount(totalSpent != null ? totalSpent : BigDecimal.ZERO);

                switch (type) {
                    case NECESSITIES -> { budget.setName("Thiết yếu (55%)"); budget.setIcon("home"); }
                    case LONG_TERM_SAVE -> { budget.setName("Tiết kiệm (10%)"); budget.setIcon("savings"); }
                    case FINANCIAL_FREE -> { budget.setName("Đầu tư (10%)"); budget.setIcon("trending_up"); }
                    case EDUCATION -> { budget.setName("Giáo dục (10%)"); budget.setIcon("school"); }
                    case PLAY -> { budget.setName("Hưởng thụ (10%)"); budget.setIcon("movie"); }
                    case GIVE -> { budget.setName("Cho đi (5%)"); budget.setIcon("volunteer_activism"); }
                }

                budgetRepository.save(budget);
            }

            return ResponseEntity.ok(Map.of("message", "Đã phân bổ và đồng bộ 6 lọ thành công cho tháng " + month));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi thiết lập ngân sách: " + e.getMessage()));
        }
    }

    /**
     * 3. TẠO NGÂN SÁCH THỦ CÔNG (POST)
     */
    @PostMapping("/manual")
    public ResponseEntity<?> createManualBudget(
            @Valid @RequestBody ManualBudgetRequest request,
            BindingResult result,
            Principal principal) {

        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(Map.of("message", result.getAllErrors().get(0).getDefaultMessage()));
        }

        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        String month = request.getMonth();

        YearMonth requestYearMonth = YearMonth.parse(month);
        if (requestYearMonth.isBefore(YearMonth.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không thể tạo ngân sách cho tháng trong quá khứ!"));
        }

        Budget budget = new Budget();
        budget.setUser(user);
        budget.setName(request.getName().trim());
        budget.setLimitAmount(request.getLimit());
        budget.setSpentAmount(BigDecimal.ZERO);
        budget.setIcon("category");
        budget.setMonthString(month);
        budget.setJarType(JarType.NECESSITIES); // Có thể mở rộng để chọn loại lọ từ request nếu cần

        budgetRepository.save(budget);
        return ResponseEntity.ok(Map.of("message", "Tạo ngân sách thủ công thành công!"));
    }
}