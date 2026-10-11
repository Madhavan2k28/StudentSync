package com.studentsync.dto;

import com.studentsync.model.User;

public record AuthResponse(String token, User user) {}
