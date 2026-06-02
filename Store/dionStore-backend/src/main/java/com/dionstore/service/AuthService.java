package com.dionstore.service;

import com.dionstore.dto.LoginDto;
import com.dionstore.dto.RegistrationDto;
import com.dionstore.dto.TokenRefreshRequestDto;
import com.dionstore.entity.User;
import com.dionstore.entity.Enums.UserRole;
import com.dionstore.exception.AuthException;
import com.dionstore.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final PasswordService passwordService;
    private final JwtService jwtService;

    
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[0-9])(?=.*[A-Z]).{8,}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^(0|\\+84)[3|5|7|8|9][0-9]{8}$");

    public AuthService(UserRepository userRepository, PasswordService passwordService, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
        this.jwtService = jwtService;
    }

    public User register(RegistrationDto dto) {
        
        if (dto == null || dto.getEmail() == null || dto.getPassword() == null || dto.getName() == null
                || dto.getPhone() == null) {
            throw new AuthException("All fields (name, email, password, phone) are required");
        }

        String name = dto.getName().trim();
        String email = dto.getEmail().trim().toLowerCase();
        String password = dto.getPassword();
        String phone = dto.getPhone().trim();

        if (name.isEmpty()) {
            throw new AuthException("Name must not be empty");
        }

        
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new AuthException("Invalid email format");
        }

        
        if (!PHONE_PATTERN.matcher(phone).matches()) {
            throw new AuthException("Invalid Vietnamese phone number format");
        }

        
        if (userRepository.findByEmail(email).isPresent()) {
            throw new AuthException("Email already registered");
        }

        
        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw new AuthException(
                    "Password must be at least 8 characters, contain at least one uppercase letter and one number");
        }

        
        String passwordHash = passwordService.hashPassword(password);

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordHash);
        user.setPhone(phone);
        user.setRole(UserRole.CUSTOMER); 

        logger.info("Saving user: name={}, email={}, phone={}", name, email, phone);

        
        return userRepository.save(user);
    }

    public User login(LoginDto dto) {
        if (dto == null || dto.getEmail() == null || dto.getPassword() == null) {
            throw new AuthException("Email và mật khẩu không được để trống");
        }

        String email = dto.getEmail().trim().toLowerCase();
        if (email.isEmpty()) {
            throw new AuthException("Email không được để trống");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("Email không tồn tại trong hệ thống"));

        boolean passwordMatches = passwordService.checkPassword(dto.getPassword(), user.getPasswordHash());

        if (!passwordMatches) {
            throw new AuthException("Mật khẩu không chính xác.");
        }

        
        
        if (user.isLocked() || user.getFailedLoginAttempts() > 0) {
            user.setLocked(false);
            user.setFailedLoginAttempts(0);
            user.setLockUntil(null);
            userRepository.save(user);
        }

        return user;
    }

    public String refreshToken(TokenRefreshRequestDto dto) {
        if (dto == null || dto.getRefreshToken() == null) {
            throw new AuthException("Refresh token is required");
        }

        if (!jwtService.validateToken(dto.getRefreshToken())) {
            throw new AuthException("Invalid or expired refresh token");
        }

        String email = jwtService.extractEmail(dto.getRefreshToken());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("User not found"));

        return jwtService.generateAccessToken(user);
    }

    public void logout(String email) {
        
        
        
        
        System.out.println("User logged out: " + email);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
}
