package com.example.HarmoniStay.Backend.controller;

import com.example.HarmoniStay.Backend.model.Visitor;
import com.example.HarmoniStay.Backend.service.VisitorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/visitors")
@CrossOrigin(origins = "*")
public class VisitorController {

    @Autowired
    private VisitorService visitorService;

    @GetMapping
    public List<Visitor> getAllVisitors() {
        return visitorService.getAllVisitors();
    }

    @GetMapping("/flat/{flatId}")
    public List<Visitor> getByFlat(@PathVariable String flatId) {
        return visitorService.getByFlat(flatId);
    }

    @PostMapping
    public Visitor logEntry(@RequestBody Visitor visitor) {
        return visitorService.logEntry(visitor);
    }

    @PutMapping("/{id}/exit")
    public Visitor logExit(@PathVariable String id) {
        return visitorService.logExit(id);
    }
}
