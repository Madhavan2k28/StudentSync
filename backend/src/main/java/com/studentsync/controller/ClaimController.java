package com.studentsync.controller;

import com.studentsync.dto.ApiException;
import com.studentsync.dto.Requests;
import com.studentsync.model.Claim;
import com.studentsync.model.Item;
import com.studentsync.model.User;
import com.studentsync.repository.ClaimRepository;
import com.studentsync.repository.ItemRepository;
import com.studentsync.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Claim / contact flow: a student submits a claim on an item,
 * the student who reported it verifies it, and the item is marked recovered.
 */
@RestController
@RequestMapping("/api")
public class ClaimController {

    private final ClaimRepository claims;
    private final ItemRepository items;

    public ClaimController(ClaimRepository claims, ItemRepository items) {
        this.claims = claims;
        this.items = items;
    }

    @PostMapping("/items/{itemId}/claims")
    @ResponseStatus(HttpStatus.CREATED)
    public Claim submit(@CurrentUser User user, @PathVariable Long itemId,
                        @Valid @RequestBody Requests.ClaimBody body) {
        Item item = items.findById(itemId).orElseThrow(() -> ApiException.notFound("Item"));
        if (item.getPostedBy().getId().equals(user.getId())) {
            throw ApiException.badRequest("You cannot claim an item you reported");
        }
        if (item.getStatus() == Item.Status.RECOVERED) {
            throw ApiException.badRequest("This item has already been recovered");
        }
        if (claims.existsByItemAndClaimantAndStatus(item, user, Claim.Status.PENDING)) {
            throw ApiException.badRequest("You already have a pending claim on this item");
        }
        Claim claim = new Claim();
        claim.setItem(item);
        claim.setClaimant(user);
        claim.setMessage(body.message().trim());
        claim.setContact(body.contact());
        return claims.save(claim);
    }

    /** Claims on a single item (visible to the student who reported it). */
    @GetMapping("/items/{itemId}/claims")
    public List<Claim> forItem(@CurrentUser User user, @PathVariable Long itemId) {
        Item item = items.findById(itemId).orElseThrow(() -> ApiException.notFound("Item"));
        if (!item.getPostedBy().getId().equals(user.getId())) {
            throw ApiException.forbidden("Only the student who reported this item can see its claims");
        }
        return claims.findByItemOrderByCreatedAtDesc(item);
    }

    @GetMapping("/claims/received")
    public List<Claim> received(@CurrentUser User user) {
        return claims.findByItemPostedByOrderByCreatedAtDesc(user);
    }

    @GetMapping("/claims/sent")
    public List<Claim> sent(@CurrentUser User user) {
        return claims.findByClaimantOrderByCreatedAtDesc(user);
    }

    /** Verify and confirm a claim: the item is marked recovered and other pending claims are closed. */
    @PostMapping("/claims/{id}/verify")
    @Transactional
    public Claim verify(@CurrentUser User user, @PathVariable Long id) {
        Claim claim = ownedClaim(user, id);
        Item item = claim.getItem();
        claim.setStatus(Claim.Status.VERIFIED);
        item.setStatus(Item.Status.RECOVERED);
        items.save(item);
        for (Claim other : claims.findByItemOrderByCreatedAtDesc(item)) {
            if (!other.getId().equals(claim.getId()) && other.getStatus() == Claim.Status.PENDING) {
                other.setStatus(Claim.Status.REJECTED);
                claims.save(other);
            }
        }
        return claims.save(claim);
    }

    @PostMapping("/claims/{id}/reject")
    public Claim reject(@CurrentUser User user, @PathVariable Long id) {
        Claim claim = ownedClaim(user, id);
        claim.setStatus(Claim.Status.REJECTED);
        return claims.save(claim);
    }

    private Claim ownedClaim(User user, Long id) {
        Claim claim = claims.findById(id).orElseThrow(() -> ApiException.notFound("Claim"));
        if (!claim.getItem().getPostedBy().getId().equals(user.getId())) {
            throw ApiException.forbidden("Only the student who reported the item can review claims");
        }
        if (claim.getStatus() != Claim.Status.PENDING) {
            throw ApiException.badRequest("This claim has already been reviewed");
        }
        return claim;
    }
}
