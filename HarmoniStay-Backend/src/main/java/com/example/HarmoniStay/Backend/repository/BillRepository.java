package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDate;

@Repository
public interface BillRepository extends JpaRepository<Bill, String> {
    List<Bill> findByUserId(String userId);
    List<Bill> findByFlatId(String flatId);
    boolean existsByFlatNumberAndBillMonth(String flatNumber, String billMonth);
    List<Bill> findByBillMonthAndStatus(String billMonth, String status);
    @Query("SELECT b FROM Bill b WHERE b.status = :status AND b.dueDate < :date AND (b.overdueSmsSent = false OR b.overdueSmsSent IS NULL)")
    List<Bill> findPendingOverdueBillsForSms(String status, LocalDate date);
}
