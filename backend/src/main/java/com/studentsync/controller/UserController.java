package com.studentsync.controller;

import com.studentsync.dto.ApiException;
import com.studentsync.dto.ProfileView;
import com.studentsync.dto.Requests;
import com.studentsync.model.SkillRequest;
import com.studentsync.model.User;
import com.studentsync.repository.SkillRepository;
import com.studentsync.repository.SkillRequestRepository;
import com.studentsync.repository.UserRepository;
import com.studentsync.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.OptionalDouble;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository users;
    private final SkillRepository skills;
    private final SkillRequestRepository requests;

    public UserController(UserRepository users, SkillRepository skills, SkillRequestRepository requests) {
        this.users = users;
        this.skills = skills;
        this.requests = requests;
    }

    /** View a student's profile with their skills and teaching rating. */
    @GetMapping("/{id}")
    public ProfileView profile(@PathVariable Long id) {
        User user = users.findById(id).orElseThrow(() -> ApiException.notFound("Student"));
        List<SkillRequest> done = requests.findByReceiverAndStatus(user, SkillRequest.Status.COMPLETED);
        OptionalDouble avg = done.stream()
                .filter(r -> r.getRating() != null)
                .mapToInt(SkillRequest::getRating)
                .average();
        Double rating = avg.isPresent() ? Math.round(avg.getAsDouble() * 10) / 10.0 : null;
        return new ProfileView(user, skills.findByUserOrderByNameAsc(user), rating, done.size());
    }

    @PutMapping("/me")
    public User updateMe(@CurrentUser User user, @Valid @RequestBody Requests.UpdateProfile body) {
        user.setName(body.name().trim());
        user.setRollNo(body.rollNo());
        user.setBranch(body.branch());
        user.setBio(body.bio());
        return users.save(user);
    }
}
