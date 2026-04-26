package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.FlatOwnershipHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlatOwnershipHistoryRepository extends JpaRepository<FlatOwnershipHistory, String> {
    List<FlatOwnershipHistory> findByFlatIdOrderByFirstDayDesc(String flatId);
    List<FlatOwnershipHistory> findByMemberIdOrderByFirstDayDesc(String memberId);
    Optional<FlatOwnershipHistory> findFirstByFlatIdAndLastDayIsNullOrderByFirstDayDesc(String flatId);
}
