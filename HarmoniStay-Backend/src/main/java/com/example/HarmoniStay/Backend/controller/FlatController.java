package com.example.HarmoniStay.Backend.controller;

import com.example.HarmoniStay.Backend.model.Flat;
import com.example.HarmoniStay.Backend.model.Member;
import com.example.HarmoniStay.Backend.service.FlatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/flats")
@CrossOrigin(origins = "*") // allow React frontend
public class FlatController {

    @Autowired
    private FlatService flatService;

    @GetMapping
    public List<Flat> getAllFlats() {
        return flatService.getAllFlats();
    }
    // Create new flat
    @PostMapping
    public Flat createFlat(@RequestBody Flat flat) {
        return flatService.createFlat(flat);
    }
    @GetMapping("/members")
    public List<Member> getAllMembers() {
        return flatService.getAllMembers();
    }

    @PostMapping("/assign")
    public Flat assignFlat(@RequestBody Map<String, String> payload) throws Exception {
        String memberId = payload.get("memberId");
        String flatId = payload.get("flatId");
        return flatService.assignFlatToMember(flatId, memberId);
    }

    @GetMapping("/{id}")
    public Flat getByFlatId(@PathVariable String id) {
        return flatService.getFlatbyId(id);
    }


}
