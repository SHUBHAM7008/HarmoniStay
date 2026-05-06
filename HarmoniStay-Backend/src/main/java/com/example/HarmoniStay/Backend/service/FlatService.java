package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Flat;
import com.example.HarmoniStay.Backend.model.FlatOwnershipHistory;
import com.example.HarmoniStay.Backend.model.Member;
import com.example.HarmoniStay.Backend.repository.BillCollectionRepository;
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

    @Autowired
    private BillCollectionRepository billCollectionRepository;

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
    public Flat updateFlat(String id, Flat input) {
        Flat existing = flatRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Flat not found"));

        existing.setFlatNumber(input.getFlatNumber());
        existing.setWing(input.getWing());
        existing.setFloor(input.getFloor());
        existing.setArea(input.getArea());
        existing.setAmount(input.getAmount());
        existing.setType(input.getType());
        existing.setStatus(input.getStatus());
        existing.setUpdatedAt(new Date());

        if (input.getOwner() != null && input.getOwner().getId() != null && !input.getOwner().getId().isBlank()) {
            Member newOwner = memberRepository.findById(input.getOwner().getId().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Owner member not found"));
            transferOwnership(existing, newOwner, LocalDate.now());
        }

        return flatRepository.save(existing);
    }

    @Transactional
    public void deleteFlat(String id) {
        Flat flat = resolveFlatByIdOrNumber(id)
                .orElseThrow(() -> new IllegalArgumentException("Flat not found"));

        if (flat.getOwner() != null) {
            flat.getOwner().setFlatId(null);
            memberRepository.save(flat.getOwner());
        }
        if (flat.getTenant() != null) {
            flat.getTenant().setFlatId(null);
            memberRepository.save(flat.getTenant());
        }
        for (Member member : memberRepository.findAllByFlatId(flat.getFlatNumber())) {
            member.setFlatId(null);
            memberRepository.save(member);
        }

        billCollectionRepository.clearFlatReferences(flat.getId());
        flatOwnershipHistoryRepository.deleteByFlatId(flat.getId());
        flatRepository.delete(flat);
    }

    @Transactional
    public Flat assignFlatToMember(String flatId, String memberId) throws Exception {
        Flat flat = resolveFlatByIdOrNumber(flatId)
                .orElseThrow(() -> new Exception("Flat not found"));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new Exception("Member not found"));

        transferOwnership(flat, member, LocalDate.now());

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

    private void transferOwnership(Flat flat, Member newOwner, LocalDate transferDate) {
        // If the new owner already owns another flat, free that flat before assigning this one.
        Optional<Flat> previouslyOwnedFlat = flatRepository.findByOwnerId(newOwner.getId());
        if (previouslyOwnedFlat.isPresent() && !previouslyOwnedFlat.get().getId().equals(flat.getId())) {
            Flat oldFlat = previouslyOwnedFlat.get();
            closeActiveOwnershipHistory(oldFlat.getId(), transferDate);
            oldFlat.setOwner(null);
            oldFlat.setStatus(Flat.Status.VACANT);
            oldFlat.setUpdatedAt(new Date());
            flatRepository.save(oldFlat);
        }

        Member previousOwner = flat.getOwner();
        boolean ownerChanged = previousOwner == null || !previousOwner.getId().equals(newOwner.getId());

        if (ownerChanged) {
            closeActiveOwnershipHistory(flat.getId(), transferDate);

            if (previousOwner != null) {
                previousOwner.setFlatId(null);
                memberRepository.save(previousOwner);
            }

            FlatOwnershipHistory newHistory = new FlatOwnershipHistory();
            newHistory.setFlat(flat);
            newHistory.setMember(newOwner);
            newHistory.setFirstDay(transferDate);
            newHistory.setLastDay(null);
            newHistory.setPreviousOwnerId(previousOwner != null ? previousOwner.getId() : null);
            newHistory.setNewOwnerId(newOwner.getId());
            newHistory.setTransferDate(transferDate);
            flatOwnershipHistoryRepository.save(newHistory);
        }

        flat.setOwner(newOwner);
        flat.setStatus(Flat.Status.OCCUPIED);
        flat.setUpdatedAt(new Date());
        newOwner.setFlatId(flat.getFlatNumber());
        memberRepository.save(newOwner);
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
