package com.dionstore.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordService {
    private final PasswordEncoder passwordEncoder;

    public PasswordService() {
        // Cost factor >= 10 as per requirements
        this.passwordEncoder = new BCryptPasswordEncoder(10);
    }

    public String hashPassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    public boolean checkPassword(String rawPassword, String encodedPassword) {
        // Fallback for development: allow login if password in DB is plaintext
        if (encodedPassword != null && !encodedPassword.startsWith("$2a$") && !encodedPassword.startsWith("$2b$") && !encodedPassword.startsWith("$2y$")) {
            return rawPassword.equals(encodedPassword);
        }
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}
