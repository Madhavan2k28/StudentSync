package com.studentsync.controller;

import com.studentsync.model.Item;
import com.studentsync.repository.ItemRepository;
import com.studentsync.repository.SkillRepository;
import com.studentsync.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** Public numbers shown on the landing page. */
@RestController
public class StatsController {

    private final UserRepository users;
    private final ItemRepository items;
    private final SkillRepository skills;

    public StatsController(UserRepository users, ItemRepository items, SkillRepository skills) {
        this.users = users;
        this.items = items;
        this.skills = skills;
    }

    @GetMapping("/api/stats")
    public Map<String, Long> stats() {
        long recovered = items.search(null, Item.Status.RECOVERED, null, null).size();
        return Map.of(
                "students", users.count(),
                "items", items.count(),
                "recovered", recovered,
                "skills", skills.count());
    }
}
