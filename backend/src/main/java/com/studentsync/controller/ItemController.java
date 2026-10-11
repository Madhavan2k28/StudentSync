package com.studentsync.controller;

import com.studentsync.dto.ApiException;
import com.studentsync.dto.MatchResult;
import com.studentsync.dto.Requests;
import com.studentsync.model.Item;
import com.studentsync.model.User;
import com.studentsync.repository.ClaimRepository;
import com.studentsync.repository.ItemRepository;
import com.studentsync.security.CurrentUser;
import com.studentsync.service.MatchingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemRepository items;
    private final ClaimRepository claims;
    private final MatchingService matching;

    public ItemController(ItemRepository items, ClaimRepository claims, MatchingService matching) {
        this.items = items;
        this.claims = claims;
        this.matching = matching;
    }

    /** View and search items. All filters are optional. */
    @GetMapping
    public List<Item> list(@RequestParam(required = false) Item.Type type,
                           @RequestParam(required = false) Item.Status status,
                           @RequestParam(required = false) String category,
                           @RequestParam(required = false) String q) {
        return items.search(type, status, blankToNull(category), blankToNull(q));
    }

    @GetMapping("/mine")
    public List<Item> mine(@CurrentUser User user) {
        return items.findByPostedByOrderByCreatedAtDesc(user);
    }

    @GetMapping("/{id}")
    public Item get(@PathVariable Long id) {
        return find(id);
    }

    /** Report a lost or found item. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Item create(@CurrentUser User user, @Valid @RequestBody Requests.ItemBody body) {
        Item item = new Item();
        apply(item, body);
        item.setPostedBy(user);
        return items.save(item);
    }

    @PutMapping("/{id}")
    public Item update(@CurrentUser User user, @PathVariable Long id, @Valid @RequestBody Requests.ItemBody body) {
        Item item = ownItem(user, id);
        apply(item, body);
        return items.save(item);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(@CurrentUser User user, @PathVariable Long id) {
        Item item = ownItem(user, id);
        claims.deleteAll(claims.findByItemOrderByCreatedAtDesc(item));
        items.delete(item);
    }

    /** Possible matches between this item and items of the opposite type. */
    @GetMapping("/{id}/matches")
    public List<MatchResult> matches(@PathVariable Long id) {
        return matching.findMatches(find(id));
    }

    private void apply(Item item, Requests.ItemBody body) {
        item.setType(body.type());
        item.setTitle(body.title().trim());
        item.setDescription(body.description());
        item.setCategory(body.category().trim());
        item.setLocation(body.location().trim());
        item.setDate(body.date());
    }

    private Item find(Long id) {
        return items.findById(id).orElseThrow(() -> ApiException.notFound("Item"));
    }

    private Item ownItem(User user, Long id) {
        Item item = find(id);
        if (!item.getPostedBy().getId().equals(user.getId())) {
            throw ApiException.forbidden("You can only change items you reported");
        }
        return item;
    }

    private String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
