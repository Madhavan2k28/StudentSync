package com.studentsync.dto;

import com.studentsync.model.Item;
import com.studentsync.model.Skill;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Request bodies accepted by the REST API. */
public final class Requests {

    private Requests() {}

    public record Register(
            @NotBlank @Size(max = 100) String name,
            @NotBlank @Email String email,
            @Size(max = 20) String rollNo,
            @Size(max = 40) String branch,
            @NotBlank @Size(min = 6, max = 64) String password) {}

    public record Login(@NotBlank String email, @NotBlank String password) {}

    public record UpdateProfile(
            @NotBlank @Size(max = 100) String name,
            @Size(max = 20) String rollNo,
            @Size(max = 40) String branch,
            @Size(max = 500) String bio) {}

    public record ItemBody(
            @NotNull Item.Type type,
            @NotBlank @Size(max = 120) String title,
            @Size(max = 1000) String description,
            @NotBlank @Size(max = 40) String category,
            @NotBlank @Size(max = 120) String location,
            @NotNull @PastOrPresent LocalDate date) {}

    public record ClaimBody(
            @NotBlank @Size(max = 1000) String message,
            @Size(max = 120) String contact) {}

    public record SkillBody(
            @NotBlank @Size(max = 80) String name,
            @NotNull Skill.Kind kind,
            Skill.Level level,
            @Size(max = 500) String description) {}

    public record SkillRequestBody(
            @NotNull Long receiverId,
            @NotBlank @Size(max = 80) String skillName,
            @Size(max = 1000) String message) {}

    public record Schedule(
            @NotNull @Future LocalDateTime sessionTime,
            @NotBlank @Size(max = 150) String sessionPlace) {}

    public record Feedback(
            @NotNull @Min(1) @Max(5) Integer rating,
            @Size(max = 1000) String feedback) {}
}
