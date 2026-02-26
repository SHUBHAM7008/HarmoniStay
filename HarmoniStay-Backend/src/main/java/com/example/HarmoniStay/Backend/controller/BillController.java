package com.example.HarmoniStay.Backend.controller;

import com.example.HarmoniStay.Backend.model.Bill;
import com.example.HarmoniStay.Backend.service.BillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = "*")
public class BillController {

    @Autowired
    private BillService billService;

    @PostMapping
    public Bill addBill(@RequestBody Bill bill) {
        // Instead of sending nested user/flat objects, resolve them here
        return billService.addBillWithEmailAndFlatNumber(bill);
    }

    @GetMapping
    public List<Bill> getAllBills() {
        return billService.getAllBills();
    }

    @GetMapping("/{id}")
    public Optional<Bill> getBillById(@PathVariable String id) {
        return billService.getBillById(id);
    }

    @GetMapping("/user/{userId}")
    public List<Bill> getBillsByUser(@PathVariable String userId) {
        return billService.getBillsByUserId(userId);
    }

    @GetMapping("/flat/{flatId}")
    public List<Bill> getBillsByFlat(@PathVariable String flatId) {
        return billService.getBillsByFlatId(flatId);
    }

    @PutMapping("/{id}")
    public Bill updateBill(@PathVariable String id, @RequestParam String transactionId) {
        return billService.updateBill(id,transactionId);
    }

    @DeleteMapping("/{id}")
    public void deleteBill(@PathVariable String id) {
        billService.deleteBill(id);
    }

}
