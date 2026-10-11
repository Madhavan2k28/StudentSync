package com.studentsync.repository;

import com.studentsync.model.SkillRequest;
import com.studentsync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SkillRequestRepository extends JpaRepository<SkillRequest, Long> {
    List<SkillRequest> findBySenderOrderByCreatedAtDesc(User sender);
    List<SkillRequest> findByReceiverOrderByCreatedAtDesc(User receiver);
    List<SkillRequest> findByReceiverAndStatus(User receiver, SkillRequest.Status status);
}
