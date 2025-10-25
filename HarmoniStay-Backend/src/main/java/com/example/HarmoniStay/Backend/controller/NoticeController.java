package com.example.HarmoniStay.Backend.controller;

import com.example.HarmoniStay.Backend.model.Notice;
import com.example.HarmoniStay.Backend.service.NoticeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notices")
@CrossOrigin(origins = "*")
public class NoticeController {

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
}
