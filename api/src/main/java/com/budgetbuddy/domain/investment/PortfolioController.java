package com.budgetbuddy.domain.investment;

import com.budgetbuddy.domain.investment.dto.InvestmentDashboardResponse;
import com.budgetbuddy.domain.investment.dto.PortfolioPerformancePoint;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserService;
import com.budgetbuddy.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final InvestmentService investmentService;
    private final PortfolioSnapshotService snapshotService;
    private final UserService userService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<InvestmentDashboardResponse>> getSummary(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                ApiResponse.success(investmentService.getDashboard(userDetails.getUsername())));
    }

    @GetMapping("/performance")
    public ResponseEntity<ApiResponse<List<PortfolioPerformancePoint>>> getPerformance(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "1M") String period) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        
        // Ensure we have a snapshot for today to show the latest data
        snapshotService.generateSnapshotForUser(user);

        List<PortfolioSnapshot> snapshots = snapshotService.getPerformance(user.getId(), period);
        List<PortfolioPerformancePoint> points = snapshots.stream()
                .map(s -> new PortfolioPerformancePoint(
                        s.getSnapshotDate(),
                        s.getPortfolioValue()))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(points));
    }
}
