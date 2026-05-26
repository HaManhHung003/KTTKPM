package com.dionstore.controller;

import com.dionstore.dto.AuthResponseDto;
import com.dionstore.dto.ErrorResponseDto;
import com.dionstore.dto.LoginDto;
import com.dionstore.dto.RegistrationDto;
import com.dionstore.dto.TokenRefreshRequestDto;
import com.dionstore.entity.User;
import com.dionstore.exception.AuthException;
import com.dionstore.service.AuthService;
import com.dionstore.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        try {
            User user = authService.login(loginDto);

            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            AuthResponseDto response = new AuthResponseDto(accessToken, refreshToken, user);
            return ResponseEntity.ok(response);
        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponseDto(e.getMessage(), HttpStatus.UNAUTHORIZED.value()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody TokenRefreshRequestDto dto) {
        try {
            String newAccessToken = authService.refreshToken(dto);
            Map<String, String> response = new HashMap<>();
            response.put("accessToken", newAccessToken);
            return ResponseEntity.ok(response);
        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponseDto(e.getMessage(), HttpStatus.UNAUTHORIZED.value()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(Authentication authentication) {
        if (authentication != null) {
            authService.logout(authentication.getName());
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = authentication.getName();
        User user = authService.getUserByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Map<String, Object> details = new HashMap<>();
        details.put("id", user.getId());
        details.put("name", user.getName());
        details.put("email", user.getEmail());
        details.put("phone", user.getPhone());
        details.put("address", user.getAddress());
        details.put("role", user.getRole() != null ? user.getRole().name().toLowerCase() : "customer");
        details.put("authorities", authentication.getAuthorities());
        return ResponseEntity.ok(details);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegistrationDto registrationDto) {
        try {
            User user = authService.register(registrationDto);

            // Generate tokens for Story 1.2
            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            AuthResponseDto response = new AuthResponseDto(accessToken, refreshToken, user);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponseDto(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }
}
