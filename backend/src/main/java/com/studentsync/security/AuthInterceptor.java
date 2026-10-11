package com.studentsync.security;

import com.studentsync.model.User;
import com.studentsync.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Checks the "Authorization: Bearer <token>" header on every protected API call
 * and stores the logged-in user on the request.
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String CURRENT_USER = "currentUser";
    private final UserRepository users;

    public AuthInterceptor(UserRepository users) {
        this.users = users;
    }

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) throws Exception {
        if (HttpMethod.OPTIONS.matches(req.getMethod())) return true;

        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            User user = users.findByAuthToken(header.substring(7)).orElse(null);
            if (user != null) {
                req.setAttribute(CURRENT_USER, user);
                return true;
            }
        }
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        res.setContentType("application/json");
        res.getWriter().write("{\"error\":\"Please log in again.\"}");
        return false;
    }
}
