package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.Bill;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillRepository extends MongoRepository<Bill, String> {
    List<Bill> findByUserId(String userId); // get bills for a member
    List<Bill> findByFlatId(String flatId); // get bills for a flat
    boolean existsByFlatNumberAndBillMonth(String flatNumber, String billMonth);

    List<Bill> findByBillMonthAndStatus(String billMonth, String status);
}
