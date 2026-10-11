package com.studentsync.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * A student's claim on an item ("this is mine" on a found item,
 * or "I found it" on a lost item). The item's owner verifies or rejects it.
 */
@Entity
@Table(name = "claims")
public class Claim {

    public enum Status { PENDING, VERIFIED, REJECTED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "item_id")
    private Item item;

    @ManyToOne(optional = false)
    @JoinColumn(name = "claimant_id")
    private User claimant;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(length = 120)
    private String contact;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private Status status = Status.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Item getItem() { return item; }
    public void setItem(Item item) { this.item = item; }
    public User getClaimant() { return claimant; }
    public void setClaimant(User claimant) { this.claimant = claimant; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
