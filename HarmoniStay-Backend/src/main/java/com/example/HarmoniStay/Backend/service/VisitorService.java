package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Visitor;
import com.example.HarmoniStay.Backend.repository.VisitorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class VisitorService {

    @Autowired
    private VisitorRepository visitorRepository;

    public Visitor logEntry(Visitor visitor) {
        visitor.setEntryTime(visitor.getEntryTime() != null ? visitor.getEntryTime() : new Date());
        return visitorRepository.save(visitor);
    }

    public Visitor logExit(String id) {
        Visitor v = visitorRepository.findById(id).orElseThrow();
        v.setExitTime(new Date());
        return visitorRepository.save(v);
    }

    public List<Visitor> getAllVisitors() {
        return visitorRepository.findAll();
    }

    public List<Visitor> getByFlat(String flatId) {
        return visitorRepository.findByFlatId(flatId);
    }

    public Optional<Visitor> getById(String id) {
        return visitorRepository.findById(id);
    }
}
