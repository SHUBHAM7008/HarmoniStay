package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Notice;
import com.example.HarmoniStay.Backend.repository.NoticeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NoticeService {

    @Autowired
    private NoticeRepository noticeRepository;

    public List<Notice> getAllNotices() {
        return noticeRepository.findAll();
    }

    public Notice addNotice(Notice notice) {
        return noticeRepository.save(notice);
    }

    public void deleteNotice(String id) {
        noticeRepository.deleteById(id);
    }

    public Optional<Notice> getNoticeById(String id) {
        return noticeRepository.findById(id);
    }

    public Notice updateNotice(String id, Notice updatedNotice) {
        Optional<Notice> optional = noticeRepository.findById(id);
        if (optional.isPresent()) {
            Notice notice = optional.get();
            notice.setTitle(updatedNotice.getTitle());
            notice.setDescription(updatedNotice.getDescription());
            notice.setDate(updatedNotice.getDate());
            return noticeRepository.save(notice);
        }
        return null;
    }
}
