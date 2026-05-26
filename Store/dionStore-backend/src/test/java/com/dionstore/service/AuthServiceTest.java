package com.dionstore.service;

import com.dionstore.dto.LoginDto;
import com.dionstore.dto.RegistrationDto;
import com.dionstore.entity.User;
import com.dionstore.exception.AuthException;
import com.dionstore.dto.TokenRefreshRequestDto;
import com.dionstore.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    private AuthService authService;
    private UserRepository userRepository;
    private PasswordService passwordService;
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        passwordService = new PasswordService();
        jwtService = Mockito.mock(JwtService.class);
        authService = new AuthService(userRepository, passwordService, jwtService);
    }

    @Test
    void register_Success() {
        RegistrationDto dto = new RegistrationDto("Test User", "test@example.com", "Password123", "0901234567");
        User user = authService.register(dto);

        assertNotNull(user.getId());
        assertEquals("test@example.com", user.getEmail());
        assertEquals("Test User", user.getName());
        assertEquals("0901234567", user.getPhone());
        assertTrue(passwordService.checkPassword("Password123", user.getPasswordHash()));
        assertEquals("Customer", user.getRole());
    }

    @Test
    void register_DuplicateEmail_ThrowsAuthException() {
        RegistrationDto dto = new RegistrationDto("Test", "exists@example.com", "Password123", "0901234567");
        authService.register(dto);

        AuthException exception = assertThrows(AuthException.class, () -> {
            authService.register(dto);
        });

        assertEquals("Email already registered", exception.getMessage());
    }

    @Test
    void register_InvalidEmail_ThrowsAuthException() {
        RegistrationDto dto = new RegistrationDto("Test", "invalid-email", "Password123", "0901234567");

        AuthException exception = assertThrows(AuthException.class, () -> {
            authService.register(dto);
        });

        assertEquals("Invalid email format", exception.getMessage());
    }

    @Test
    void register_WeakPassword_NoUpper_ThrowsAuthException() {
        RegistrationDto dto = new RegistrationDto("Test", "new@example.com", "password123", "0901234567");

        AuthException exception = assertThrows(AuthException.class, () -> {
            authService.register(dto);
        });

        assertTrue(exception.getMessage().contains("uppercase letter"));
    }

    @Test
    void register_WeakPassword_NoNumber_ThrowsAuthException() {
        RegistrationDto dto = new RegistrationDto("Test", "new@example.com", "PasswordOnly", "0901234567");

        AuthException exception = assertThrows(AuthException.class, () -> {
            authService.register(dto);
        });

        assertTrue(exception.getMessage().contains("number"));
    }

    @Test
    void register_InvalidPhone_ThrowsAuthException() {
        RegistrationDto dto = new RegistrationDto("Test", "test@example.com", "Password123", "12345");

        AuthException exception = assertThrows(AuthException.class, () -> {
            authService.register(dto);
        });

        assertTrue(exception.getMessage().contains("phone number format"));
    }

    @Test
    void register_NullInput_ThrowsAuthException() {
        AuthException exception = assertThrows(AuthException.class, () -> {
            authService.register(null);
        });

        assertTrue(exception.getMessage().contains("Registration data"));
    }

    @Test
    void login_Success() {
        // First register
        authService.register(new RegistrationDto("Login User", "login@example.com", "Password123", "0901234567"));

        LoginDto loginDto = new LoginDto("login@example.com", "Password123");
        User user = authService.login(loginDto);

        assertNotNull(user);
        assertEquals("login@example.com", user.getEmail());
    }

    @Test
    void login_WrongPassword_ThrowsAuthException() {
        authService
                .register(new RegistrationDto("Wrong Pass User", "wrongpass@example.com", "Password123", "0901234567"));

        LoginDto loginDto = new LoginDto("wrongpass@example.com", "WrongPassword123");
        AuthException exception = assertThrows(AuthException.class, () -> {
            authService.login(loginDto);
        });

        assertEquals("Invalid credentials", exception.getMessage());
    }

    @Test
    void login_EmailNotFound_ThrowsAuthException() {
        LoginDto loginDto = new LoginDto("notfound@example.com", "Password123");
        AuthException exception = assertThrows(AuthException.class, () -> {
            authService.login(loginDto);
        });

        assertEquals("Invalid credentials", exception.getMessage());
    }

    @Test
    void refreshToken_Success() {
        // Register and get token
        User user = authService
                .register(new RegistrationDto("Refresh User", "refresh@test.com", "Password123", "0901234567"));

        String refreshToken = "mock-refresh-token";
        String newAccessToken = "mock-access-token";

        when(jwtService.generateRefreshToken(user)).thenReturn(refreshToken);
        when(jwtService.validateToken(refreshToken)).thenReturn(true);
        when(jwtService.extractEmail(refreshToken)).thenReturn("refresh@test.com");
        when(jwtService.generateAccessToken(any(User.class))).thenReturn(newAccessToken);
        when(jwtService.extractEmail(newAccessToken)).thenReturn("refresh@test.com");

        String generatedRefreshToken = jwtService.generateRefreshToken(user);
        TokenRefreshRequestDto dto = new TokenRefreshRequestDto(generatedRefreshToken);
        String resultAccessToken = authService.refreshToken(dto);

        assertNotNull(resultAccessToken);
        assertEquals(newAccessToken, resultAccessToken);
        assertEquals("refresh@test.com", jwtService.extractEmail(resultAccessToken));
    }

    @Test
    void refreshToken_InvalidToken_ThrowsAuthException() {
        String invalidToken = "invalid.token.here";
        when(jwtService.validateToken(invalidToken)).thenReturn(false);

        TokenRefreshRequestDto dto = new TokenRefreshRequestDto(invalidToken);
        AuthException exception = assertThrows(AuthException.class, () -> {
            authService.refreshToken(dto);
        });

        assertEquals("Invalid or expired refresh token", exception.getMessage());
    }

    @Test
    void logout_Success() {
        authService.logout("test@example.com");
        // No exception means success currently
    }
}
