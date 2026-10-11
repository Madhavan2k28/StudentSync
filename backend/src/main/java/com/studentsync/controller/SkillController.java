package com.studentsync.controller;

import com.studentsync.dto.ApiException;
import com.studentsync.dto.Requests;
import com.studentsync.model.Skill;
import com.studentsync.model.User;
import com.studentsync.repository.SkillRepository;
import com.studentsync.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillRepository skills;

    public SkillController(SkillRepository skills) {
        this.skills = skills;
    }

    /** Browse skills; kind=TEACH lists what students can teach. */
    @GetMapping
    public List<Skill> browse(@RequestParam(required = false) Skill.Kind kind,
                              @RequestParam(required = false) String q) {
        return skills.search(kind, q == null || q.isBlank() ? null : q.trim());
    }

    @GetMapping("/mine")
    public List<Skill> mine(@CurrentUser User user) {
        return skills.findByUserOrderByNameAsc(user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Skill add(@CurrentUser User user, @Valid @RequestBody Requests.SkillBody body) {
        Skill skill = new Skill();
        skill.setName(body.name().trim());
        skill.setKind(body.kind());
        skill.setLevel(body.level());
        skill.setDescription(body.description());
        skill.setUser(user);
        return skills.save(skill);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@CurrentUser User user, @PathVariable Long id) {
        Skill skill = skills.findById(id).orElseThrow(() -> ApiException.notFound("Skill"));
        if (!skill.getUser().getId().equals(user.getId())) {
            throw ApiException.forbidden("You can only remove your own skills");
        }
        skills.delete(skill);
    }
}
