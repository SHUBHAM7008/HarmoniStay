package com.example.HarmoniStay.Backend.controller;

import com.example.HarmoniStay.Backend.model.BillCollection;
import com.example.HarmoniStay.Backend.service.BillCollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bill-collections")
@CrossOrigin(origins = "http://localhost:3000")
public class BillCollectionController {

    @Autowired
    private BillCollectionService billCollectionService;

    @PostMapping
    public BillCollection createBillCollection(@RequestBody BillCollection billCollection) {
        return billCollectionService.createBillCollection(billCollection);
    }

    @GetMapping
    public List<BillCollection> getAllBillCollections() {
        return billCollectionService.getAllBillCollections();
    }

    @GetMapping("/{id}")
    public BillCollection getBillCollectionById(@PathVariable String id) {
        return billCollectionService.getById(id).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deleteBillCollection(@PathVariable String id) {
        billCollectionService.deleteById(id);
    }
}
