package com.studentsync.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * A learning request from one student to another for a skill.
 * Lifecycle: PENDING -> ACCEPTED (session scheduled) -> COMPLETED (with rating), or REJECTED.
 */
@Entity
@Table(name = "skill_requests")
public class SkillRequest {

    public enum Status { PENDING, ACCEPTED, REJECTED, COMPLETED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sender_id")
    private User sender;

    @ManyToOne(optional = false)
    @JoinColumn(name = "receiver_id")
    private User receiver;

    @Column(nullable = false, length = 80)
    private String skillName;

    @Column(length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private Status status = Status.PENDING;

    private LocalDateTime sessionTime;

    @Column(length = 150)
    private String sessionPlace;

    private Integer rating;

    @Column(length = 1000)
    private String feedback;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }
    public User getReceiver() { return receiver; }
    public void setReceiver(User receiver) { this.receiver = receiver; }
    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public LocalDateTime getSessionTime() { return sessionTime; }
    public void setSessionTime(LocalDateTime sessionTime) { this.sessionTime = sessionTime; }
    public String getSessionPlace() { return sessionPlace; }
    public void setSessionPlace(String sessionPlace) { this.sessionPlace = sessionPlace; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
