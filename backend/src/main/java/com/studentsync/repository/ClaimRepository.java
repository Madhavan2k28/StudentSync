package com.studentsync.repository;

import com.studentsync.model.Claim;
import com.studentsync.model.Item;
import com.studentsync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByItemOrderByCreatedAtDesc(Item item);
    List<Claim> findByItemPostedByOrderByCreatedAtDesc(User owner);
    List<Claim> findByClaimantOrderByCreatedAtDesc(User claimant);
    boolean existsByItemAndClaimantAndStatus(Item item, User claimant, Claim.Status status);
}
