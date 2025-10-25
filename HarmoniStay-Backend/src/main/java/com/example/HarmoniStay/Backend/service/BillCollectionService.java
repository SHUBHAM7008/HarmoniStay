package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.BillCollection;
import com.example.HarmoniStay.Backend.repository.BillCollectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Date;

@Service
public class BillCollectionService {

    @Autowired
    private BillCollectionRepository billCollectionRepository;

    public BillCollection createBillCollection(BillCollection billCollection) {
        billCollection.setReceiptNumber("RCPT-" + UUID.randomUUID().toString().substring(0, 8));
        billCollection.setPaymentDate(new Date());
        billCollection.setCreatedAt(new Date());
        billCollection.setUpdatedAt(new Date());
        return billCollectionRepository.save(billCollection);
    }

    public List<BillCollection> getAllBillCollections() {
        return billCollectionRepository.findAll();
    }

    public Optional<BillCollection> getById(String id) {
        return billCollectionRepository.findById(id);
    }

    public void deleteById(String id) {
        billCollectionRepository.deleteById(id);
    }
}
