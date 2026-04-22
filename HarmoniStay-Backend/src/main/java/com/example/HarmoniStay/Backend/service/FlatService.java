package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Flat;
import com.example.HarmoniStay.Backend.model.FlatOwnershipHistory;
import com.example.HarmoniStay.Backend.model.Member;
import com.example.HarmoniStay.Backend.repository.FlatRepository;
import com.example.HarmoniStay.Backend.repository.FlatOwnershipHistoryRepository;
import com.example.HarmoniStay.Backend.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.time.LocalDate;
import java.util.Optional;

@Service
public class FlatService {

    @Autowired
    private FlatRepository flatRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private FlatOwnershipHistoryRepository flatOwnershipHistoryRepository;

    public List<Flat> getAllFlats() {
        return flatRepository.findAll();
    }

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public Flat createFlat(Flat flat) {
        flat.setCreatedAt(new Date());
        flat.setUpdatedAt(new Date());
        return flatRepository.save(flat);
    }

    @Transactional
    public Flat assignFlatToMember(String flatId, String memberId) throws Exception {
        Flat flat = resolveFlatByIdOrNumber(flatId)
                .orElseThrow(() -> new Exception("Flat not found"));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new Exception("Member not found"));

        // If member already owns another flat, close that ownership first.
        Optional<Flat> previouslyOwnedFlat = flatRepository.findByOwnerId(member.getId());
        if (previouslyOwnedFlat.isPresent() && !previouslyOwnedFlat.get().getId().equals(flat.getId())) {
            Flat oldFlat = previouslyOwnedFlat.get();
            closeActiveOwnershipHistory(oldFlat.getId(), LocalDate.now());
            oldFlat.setOwner(null);
            oldFlat.setStatus(Flat.Status.VACANT);
            oldFlat.setUpdatedAt(new Date());
            flatRepository.save(oldFlat);
        }

        Member previousOwner = flat.getOwner();
        boolean ownerChanged = previousOwner == null || !previousOwner.getId().equals(member.getId());

        if (ownerChanged) {
            closeActiveOwnershipHistory(flat.getId(), LocalDate.now());

            FlatOwnershipHistory newHistory = new FlatOwnershipHistory();
            newHistory.setFlat(flat);
            newHistory.setMember(member);
            newHistory.setFirstDay(LocalDate.now());
            newHistory.setLastDay(null);
            flatOwnershipHistoryRepository.save(newHistory);
        }

        // Assign owner
        flat.setOwner(member);
        flat.setStatus(Flat.Status.OCCUPIED);
        flat.setUpdatedAt(new Date());
        member.setFlatId(flat.getFlatNumber());
        memberRepository.save(member);

        return flatRepository.save(flat);
    }

    public Flat getFlatbyId(String flatId){
        return flatRepository.findByFlatNumber(flatId).orElse(null);
    }

    public void updateFlatStatus(String flatId, Flat.Status status) {
        Optional<Flat> optionalFlat = flatRepository.findByFlatNumber(flatId);
        if (optionalFlat.isPresent()) {
            Flat flat = optionalFlat.get();
            flat.setStatus(status);
            flatRepository.save(flat);
        }
    }

    public List<FlatOwnershipHistory> getOwnershipHistoryByFlat(String flatId) {
        return flatOwnershipHistoryRepository.findByFlatIdOrderByFirstDayDesc(flatId);
    }

    public List<FlatOwnershipHistory> getOwnershipHistoryByMember(String memberId) {
        return flatOwnershipHistoryRepository.findByMemberIdOrderByFirstDayDesc(memberId);
    }

    @Transactional
    public void clearOwnershipForMember(String memberId) {
        if (memberId == null || memberId.isBlank()) {
            return;
        }
        Optional<Flat> ownedFlat = flatRepository.findByOwnerId(memberId.trim());
        if (ownedFlat.isPresent()) {
            Flat flat = ownedFlat.get();
            closeActiveOwnershipHistory(flat.getId(), LocalDate.now());
            flat.setOwner(null);
            flat.setStatus(Flat.Status.VACANT);
            flat.setUpdatedAt(new Date());
            flatRepository.save(flat);
        }
    }

    private Optional<Flat> resolveFlatByIdOrNumber(String flatIdentifier) {
        if (flatIdentifier == null || flatIdentifier.isBlank()) {
            return Optional.empty();
        }
        String normalized = flatIdentifier.trim();
        Optional<Flat> byId = flatRepository.findById(normalized);
        return byId.isPresent() ? byId : flatRepository.findByFlatNumber(normalized);
    }

    private void closeActiveOwnershipHistory(String flatId, LocalDate lastDay) {
        Optional<FlatOwnershipHistory> activeHistory =
                flatOwnershipHistoryRepository.findFirstByFlatIdAndLastDayIsNullOrderByFirstDayDesc(flatId);
        if (activeHistory.isPresent()) {
            FlatOwnershipHistory current = activeHistory.get();
            current.setLastDay(lastDay);
            flatOwnershipHistoryRepository.save(current);
        }
    }
}
