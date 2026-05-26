package com.dionstore.service;

import com.dionstore.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.security.Key;

import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private static final String SECRET_STRING = "dionStoreSecretKeyForJWTAuthentication2026LuxuryBoarding";
    private final Key key = Keys.hmacShaKeyFor(SECRET_STRING.getBytes());

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretString", SECRET_STRING);
        jwtService.init();
    }

    @Test
    void generateAccessToken_IncludedClaims() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setRole(com.dionstore.entity.Enums.UserRole.ADMIN);

        String token = jwtService.generateAccessToken(user);
        assertNotNull(token);

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        assertEquals("test@example.com", claims.getSubject());
        assertEquals("ADMIN", claims.get("role"));
    }

    @Test
    void generateRefreshToken_IncludedSubject() {
        User user = new User();
        user.setEmail("refresh@example.com");

        String token = jwtService.generateRefreshToken(user);
        assertNotNull(token);

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        assertEquals("refresh@example.com", claims.getSubject());
        assertNull(claims.get("role"));
    }
}
