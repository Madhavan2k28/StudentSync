package com.studentsync.service;

import com.studentsync.dto.MatchResult;
import com.studentsync.model.Item;
import com.studentsync.repository.ItemRepository;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Finds likely matches between lost and found items.
 *
 * A LOST item is compared with open FOUND items of the same category (and the reverse).
 * Each candidate is scored out of 100:
 *   - up to 60 points for shared keywords in title and description
 *   - 25 points for the same location (10 if the locations share a word)
 *   - up to 15 points for dates close together (found on or after the loss date)
 */
@Service
public class MatchingService {

    private static final int MIN_SCORE = 20;
    private static final Set<String> STOP_WORDS = Set.of(
            "a", "an", "the", "and", "or", "of", "in", "on", "at", "to", "with", "my", "is",
            "it", "for", "near", "was", "i", "lost", "found", "this", "that", "has", "have");

    private final ItemRepository items;

    public MatchingService(ItemRepository items) {
        this.items = items;
    }

    public List<MatchResult> findMatches(Item item) {
        Item.Type opposite = item.getType() == Item.Type.LOST ? Item.Type.FOUND : Item.Type.LOST;
        List<Item> candidates = items.findByTypeAndStatusAndCategoryIgnoreCase(
                opposite, Item.Status.OPEN, item.getCategory());

        Set<String> words = keywords(item.getTitle() + " " + nullSafe(item.getDescription()));

        return candidates.stream()
                .filter(c -> !c.getPostedBy().getId().equals(item.getPostedBy().getId()))
                .map(c -> score(item, c, words))
                .filter(m -> m.score() >= MIN_SCORE)
                .sorted(Comparator.comparingInt(MatchResult::score).reversed())
                .limit(10)
                .collect(Collectors.toList());
    }

    private MatchResult score(Item source, Item candidate, Set<String> sourceWords) {
        List<String> reasons = new ArrayList<>();
        reasons.add("Same category: " + candidate.getCategory());

        // Keyword overlap
        Set<String> candidateWords = keywords(candidate.getTitle() + " " + nullSafe(candidate.getDescription()));
        Set<String> shared = new TreeSet<>(sourceWords);
        shared.retainAll(candidateWords);
        int smaller = Math.max(1, Math.min(sourceWords.size(), candidateWords.size()));
        int keywordScore = (int) Math.round(60.0 * shared.size() / smaller);
        if (!shared.isEmpty()) reasons.add("Shared words: " + String.join(", ", shared));

        // Location
        int locationScore = 0;
        String a = source.getLocation().trim().toLowerCase();
        String b = candidate.getLocation().trim().toLowerCase();
        if (a.equals(b)) {
            locationScore = 25;
            reasons.add("Same location");
        } else {
            Set<String> la = keywords(a);
            la.retainAll(keywords(b));
            if (!la.isEmpty()) {
                locationScore = 10;
                reasons.add("Nearby location");
            }
        }

        // Dates: the found date should be on or after the lost date
        Item lost = source.getType() == Item.Type.LOST ? source : candidate;
        Item found = source.getType() == Item.Type.FOUND ? source : candidate;
        long gap = ChronoUnit.DAYS.between(lost.getDate(), found.getDate());
        int dateScore = 0;
        if (gap >= 0 && gap <= 2) dateScore = 15;
        else if (gap > 2 && gap <= 7) dateScore = 10;
        else if (gap > 7 && gap <= 30) dateScore = 5;
        if (dateScore > 0) reasons.add(gap == 0 ? "Same day" : "Found " + gap + " day(s) after loss");

        int total = Math.min(100, keywordScore + locationScore + dateScore);
        return new MatchResult(candidate, total, reasons);
    }

    private Set<String> keywords(String text) {
        return Arrays.stream(text.toLowerCase().split("[^a-z0-9]+"))
                .filter(w -> w.length() > 1 && !STOP_WORDS.contains(w))
                .collect(Collectors.toCollection(HashSet::new));
    }

    private String nullSafe(String s) {
        return s == null ? "" : s;
    }
}
