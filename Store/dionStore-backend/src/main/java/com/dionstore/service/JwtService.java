package com.dionstore.service;

import com.dionstore.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretString;
    
    private Key key;

    private static final long ACCESS_TOKEN_EXPIRATION = 1000 * 60 * 30; 
    private static final long REFRESH_TOKEN_EXPIRATION = 1000L * 60 * 60 * 24 * 7; 

    @PostConstruct
    public void init() {
        if (secretString == null || secretString.getBytes().length < 32) {
            throw new IllegalStateException("jwt.secret must be configured and at least 32 bytes long");
        }
        this.key = Keys.hmacShaKeyFor(secretString.getBytes());
    }

    public String generateAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        String role = user.getRole() != null ? user.getRole().name() : "CUSTOMER";
        claims.put("role", role);
        return createToken(claims, user.getEmail(), ACCESS_TOKEN_EXPIRATION);
    }

    public String generateRefreshToken(User user) {
        return createToken(new HashMap<>(), user.getEmail(), REFRESH_TOKEN_EXPIRATION);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public String extractRole(String token) {
        Object role = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("role");
        return role != null ? role.toString() : "CUSTOMER";
    }

    private String createToken(Map<String, Object> claims, String subject, long expiration) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}
