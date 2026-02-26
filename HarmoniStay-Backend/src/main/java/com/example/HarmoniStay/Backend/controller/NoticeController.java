package com.example.HarmoniStay.Backend.controller;

import com.example.HarmoniStay.Backend.model.Notice;
import com.example.HarmoniStay.Backend.service.NoticeService;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notices")
@CrossOrigin(origins = "*")
public class NoticeController {

    @Value("${twilio.account.sid}")
    private String ACCOUNT_SID;

    @Value("${twilio.auth.token}")
    private String AUTH_TOKEN;

    @Value("${twilio.phone.number}")
    private String FROM_PHONE;

    @Autowired
    private NoticeService noticeService;

    @GetMapping
    public List<Notice> getAllNotices() {
        return noticeService.getAllNotices();
    }

    @PostMapping
    public Notice addNotice(@RequestBody Notice notice) {
        return noticeService.addNotice(notice);
    }

    @DeleteMapping("/{id}")
    public void deleteNotice(@PathVariable String id) {
        noticeService.deleteNotice(id);
    }

    @PutMapping("/{id}")
    public Notice updateNotice(@PathVariable String id, @RequestBody Notice notice) {
        return noticeService.updateNotice(id, notice);
    }

    @PostMapping("/notify")
    public ResponseEntity<String> notifyUser(@RequestBody Map<String, String> payload) {
        String phone = payload.get("phone");
        String message = payload.get("message");

        try {
            Twilio.init(ACCOUNT_SID, AUTH_TOKEN);
            Message.creator(
                    new PhoneNumber("+91"+phone),
                    new PhoneNumber(FROM_PHONE),
                    message
            ).create();
            return ResponseEntity.ok("SMS sent successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send SMS");
        }
    }

}
