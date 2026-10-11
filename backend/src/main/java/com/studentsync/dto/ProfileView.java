package com.studentsync.dto;

import com.studentsync.model.Skill;
import com.studentsync.model.User;

import java.util.List;

/** Public profile: the student, their skills, and their teaching rating. */
public record ProfileView(User user, List<Skill> skills, Double averageRating, long completedSessions) {}
