package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Bill;
import com.example.HarmoniStay.Backend.model.Flat;
import com.example.HarmoniStay.Backend.model.Member;
import com.example.HarmoniStay.Backend.repository.BillRepository;
import com.example.HarmoniStay.Backend.repository.FlatRepository;
import com.example.HarmoniStay.Backend.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BillService {

    @Autowired
    private BillRepository billRepository;

        @Autowired
        private MemberRepository memberRepository;

        @Autowired
        private FlatRepository flatRepository;

        public Member getMemberByEmail(String email) {
            return memberRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Member not found with email: " + email));
        }

        public Flat getFlatByNumber(String flatNumber) {
            return flatRepository.findByFlatNumber(flatNumber)
                    .orElseThrow(() -> new RuntimeException("Flat not found with number: " + flatNumber));
        }

    public Bill addBillWithEmailAndFlatNumber(Bill bill) {
        Member member = memberRepository.findByEmail(bill.getUserEmail())
                .orElseThrow(() -> new RuntimeException("Member not found with email: " + bill.getUserEmail()));

        Flat flat = flatRepository.findByFlatNumber(bill.getFlatNumber())
                .orElseThrow(() -> new RuntimeException("Flat not found with number: " + bill.getFlatNumber()));

        bill.setUserId(member.getId());
        bill.setFlatId(flat.getId()); // store

        return billRepository.save(bill);
    }
    

    // Add new bill
    public Bill addBill(Bill bill) {
        return billRepository.save(bill);
    }

    // Get all bills
    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    // Get bill by ID
    public Optional<Bill> getBillById(String id) {
        return billRepository.findById(id);
    }

    // Get bills by user
    public List<Bill> getBillsByUserId(String userId) {
        return billRepository.findByUserId(userId);
    }

    // Get bills by flat
    public List<Bill> getBillsByFlatId(String flatId) {
        return billRepository.findByFlatId(flatId);
    }

    // Update bill
    public Bill updateBill(Bill bill) {
        return billRepository.save(bill);
    }

    // Delete bill
    public void deleteBill(String id) {
        billRepository.deleteById(id);
    }
}
