package com.studentsync.controller;

import com.studentsync.dto.ApiException;
import com.studentsync.dto.Requests;
import com.studentsync.model.SkillRequest;
import com.studentsync.model.User;
import com.studentsync.repository.SkillRequestRepository;
import com.studentsync.repository.UserRepository;
import com.studentsync.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Skill exchange flow: send request -> accept / reject -> schedule session
 * -> learner gives feedback and rating -> exchange completed.
 */
@RestController
@RequestMapping("/api/requests")
public class SkillRequestController {

    private final SkillRequestRepository requests;
    private final UserRepository users;

    public SkillRequestController(SkillRequestRepository requests, UserRepository users) {
        this.requests = requests;
        this.users = users;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SkillRequest send(@CurrentUser User user, @Valid @RequestBody Requests.SkillRequestBody body) {
        if (body.receiverId().equals(user.getId())) {
            throw ApiException.badRequest("You cannot send a request to yourself");
        }
        User receiver = users.findById(body.receiverId()).orElseThrow(() -> ApiException.notFound("Student"));
        SkillRequest req = new SkillRequest();
        req.setSender(user);
        req.setReceiver(receiver);
        req.setSkillName(body.skillName().trim());
        req.setMessage(body.message());
        return requests.save(req);
    }

    @GetMapping("/sent")
    public List<SkillRequest> sent(@CurrentUser User user) {
        return requests.findBySenderOrderByCreatedAtDesc(user);
    }

    @GetMapping("/received")
    public List<SkillRequest> received(@CurrentUser User user) {
        return requests.findByReceiverOrderByCreatedAtDesc(user);
    }

    @PostMapping("/{id}/accept")
    public SkillRequest accept(@CurrentUser User user, @PathVariable Long id) {
        SkillRequest req = asReceiver(user, id);
        requireStatus(req, SkillRequest.Status.PENDING);
        req.setStatus(SkillRequest.Status.ACCEPTED);
        return requests.save(req);
    }

    @PostMapping("/{id}/reject")
    public SkillRequest reject(@CurrentUser User user, @PathVariable Long id) {
        SkillRequest req = asReceiver(user, id);
        requireStatus(req, SkillRequest.Status.PENDING);
        req.setStatus(SkillRequest.Status.REJECTED);
        return requests.save(req);
    }

    /** Either student can set or change the session time and place once accepted. */
    @PutMapping("/{id}/schedule")
    public SkillRequest schedule(@CurrentUser User user, @PathVariable Long id,
                                 @Valid @RequestBody Requests.Schedule body) {
        SkillRequest req = find(id);
        if (!isParticipant(req, user)) throw ApiException.forbidden("Not your request");
        requireStatus(req, SkillRequest.Status.ACCEPTED);
        req.setSessionTime(body.sessionTime());
        req.setSessionPlace(body.sessionPlace().trim());
        return requests.save(req);
    }

    /** The learner (sender) rates the session, which completes the exchange. */
    @PostMapping("/{id}/feedback")
    public SkillRequest feedback(@CurrentUser User user, @PathVariable Long id,
                                 @Valid @RequestBody Requests.Feedback body) {
        SkillRequest req = find(id);
        if (!req.getSender().getId().equals(user.getId())) {
            throw ApiException.forbidden("Only the learner can give feedback");
        }
        requireStatus(req, SkillRequest.Status.ACCEPTED);
        req.setRating(body.rating());
        req.setFeedback(body.feedback());
        req.setStatus(SkillRequest.Status.COMPLETED);
        return requests.save(req);
    }

    private SkillRequest find(Long id) {
        return requests.findById(id).orElseThrow(() -> ApiException.notFound("Request"));
    }

    private SkillRequest asReceiver(User user, Long id) {
        SkillRequest req = find(id);
        if (!req.getReceiver().getId().equals(user.getId())) {
            throw ApiException.forbidden("Only the student who received this request can respond");
        }
        return req;
    }

    private boolean isParticipant(SkillRequest req, User user) {
        return req.getSender().getId().equals(user.getId()) || req.getReceiver().getId().equals(user.getId());
    }

    private void requireStatus(SkillRequest req, SkillRequest.Status expected) {
        if (req.getStatus() != expected) {
            throw ApiException.badRequest("Request is " + req.getStatus().name().toLowerCase()
                    + ", expected " + expected.name().toLowerCase());
        }
    }
}
