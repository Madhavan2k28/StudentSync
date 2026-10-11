package com.studentsync.controller;

import com.studentsync.dto.ApiException;
import com.studentsync.dto.AuthResponse;
import com.studentsync.dto.Requests;
import com.studentsync.model.User;
import com.studentsync.repository.UserRepository;
import com.studentsync.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.HexFormat;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository users;
    private final PasswordEncoder encoder;

    public AuthController(UserRepository users, PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody Requests.Register body) {
        if (users.existsByEmailIgnoreCase(body.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        User user = new User();
        user.setName(body.name().trim());
        user.setEmail(body.email().trim().toLowerCase());
        user.setRollNo(body.rollNo());
        user.setBranch(body.branch());
        user.setPasswordHash(encoder.encode(body.password()));
        user.setAuthToken(newToken());
        users.save(user);
        return new AuthResponse(user.getAuthToken(), user);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody Requests.Login body) {
        User user = users.findByEmailIgnoreCase(body.email().trim())
                .filter(u -> encoder.matches(body.password(), u.getPasswordHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        user.setAuthToken(newToken());
        users.save(user);
        return new AuthResponse(user.getAuthToken(), user);
    }

    @GetMapping("/me")
    public User me(@CurrentUser User user) {
        return user;
    }

    @PostMapping("/logout")
    public void logout(@CurrentUser User user) {
        user.setAuthToken(null);
        users.save(user);
    }

    private String newToken() {
        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }
}
