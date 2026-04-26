package com.example.HarmoniStay.Backend.controller;

import com.example.HarmoniStay.Backend.model.Bill;
import com.example.HarmoniStay.Backend.repository.BillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportsController {

    @Autowired
    private BillRepository billRepository;

    @GetMapping("/maintenance-summary")
    public Map<String, Object> getMaintenanceSummary(@RequestParam(required = false) String month) {
        List<Bill> bills = billRepository.findAll();
        if (month != null && !month.isEmpty()) {
            bills = bills.stream().filter(b -> month.equals(b.getBillMonth())).collect(Collectors.toList());
        }

        double totalAmount = bills.stream().mapToDouble(Bill::getAmount).sum();
        long paidCount = bills.stream().filter(b -> "PAID".equalsIgnoreCase(b.getStatus())).count();
        long unpaidCount = bills.stream().filter(b -> "UNPAID".equalsIgnoreCase(b.getStatus())).count();
        double collected = bills.stream().filter(b -> "PAID".equalsIgnoreCase(b.getStatus())).mapToDouble(Bill::getAmount).sum();
        double dues = bills.stream().filter(b -> "UNPAID".equalsIgnoreCase(b.getStatus())).mapToDouble(Bill::getAmount).sum();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalBills", bills.size());
        summary.put("totalAmount", totalAmount);
        summary.put("paidCount", paidCount);
        summary.put("unpaidCount", unpaidCount);
        summary.put("collected", collected);
        summary.put("dues", dues);
        summary.put("filterMonth", month);
        return summary;
    }

    @GetMapping("/monthly-collection")
    public Map<String, List<Map<String, Object>>> getMonthlyCollection() {
        List<Bill> bills = billRepository.findAll();
        Map<String, List<Bill>> byMonth = bills.stream().collect(Collectors.groupingBy(b -> b.getBillMonth() != null ? b.getBillMonth() : "unknown"));

        Map<String, List<Map<String, Object>>> result = new HashMap<>();
        byMonth.forEach((m, list) -> {
            List<Map<String, Object>> items = list.stream().map(b -> {
                Map<String, Object> item = new HashMap<>();
                item.put("flatNumber", b.getFlatNumber());
                item.put("amount", b.getAmount());
                item.put("status", b.getStatus());
                return item;
            }).collect(Collectors.toList());
            result.put(m, items);
        });
        return result;
    }
}
