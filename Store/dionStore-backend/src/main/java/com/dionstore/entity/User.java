package com.dionstore.entity;

import com.dionstore.entity.Enums.UserRole;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    @Column(unique = true)
    private String email;

    @JsonIgnore
    @Column(name = "password")
    private String passwordHash;

    private String phone;
    private String address;

    @Convert(converter = UserRoleConverter.class)
    private UserRole role;

    @Column(name = "failed_login_attempts")
    private int failedLoginAttempts = 0;

    private boolean locked = false;

    @Column(name = "lock_until")
    private LocalDateTime lockUntil;

    // Convenience: expose role as string for JSON
    public String getRoleString() {
        return role != null ? role.name() : null;
    }
}
