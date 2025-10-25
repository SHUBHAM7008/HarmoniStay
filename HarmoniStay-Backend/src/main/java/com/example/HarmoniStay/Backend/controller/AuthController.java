package com.example.HarmoniStay.Backend.controller;

import com.example.HarmoniStay.Backend.model.Admin;
import com.example.HarmoniStay.Backend.model.Flat;
import com.example.HarmoniStay.Backend.model.Member;
import com.example.HarmoniStay.Backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    // ✅ Admin Login
    @PostMapping("/admin/login")
    public Map<String, Object> adminLogin(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String password = data.get("password");

        Admin admin = authService.loginAdmin(email, password); // Now returns Admin object or null

        Map<String, Object> response = new HashMap<>();
        if (admin != null) {
            response.put("status", "success");
            response.put("admin", admin);
        } else {
            response.put("status", "error");
            response.put("message", "Invalid email or password");
        }
        return response;
    }

    // ✅ Member Login
    @PostMapping("/member/login")
    public Map<String, Object> memberLogin(@RequestBody Map<String, String> data) {
        //Map<String, String> flatMap = (Map<String, String>) data.get("Flat");
        String flatNo = data.get("flatId");
        String password = (String) data.get("password");
        System.out.print(flatNo+password);
        Member member = authService.loginMember(flatNo, password);

        Map<String, Object> response = new HashMap<>();
        if (member != null) {
            response.put("status", "success");
            response.put("user", member);
        } else {
            response.put("status", "error");
            response.put("message", "Invalid credentials");
        }
        return response;
    }

}
