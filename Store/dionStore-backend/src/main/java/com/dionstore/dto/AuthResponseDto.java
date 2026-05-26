package com.dionstore.dto;

import com.dionstore.entity.User;

public class AuthResponseDto {
    private String accessToken;
    private String refreshToken;
    private UserInfo user;

    public AuthResponseDto(String accessToken, String refreshToken, User user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = new UserInfo(user);
    }

    // Getters and Setters
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public UserInfo getUser() { return user; }
    public void setUser(UserInfo user) { this.user = user; }

    // Safe user info DTO (không lộ passwordHash)
    public static class UserInfo {
        private Integer id;
        private String name;
        private String email;
        private String phone;
        private String address;
        private String role;

        public UserInfo(User user) {
            this.id = user.getId();
            this.name = user.getName();
            this.email = user.getEmail();
            this.phone = user.getPhone();
            this.address = user.getAddress();
            // role là enum ADMIN / CUSTOMER → trả về lowercase cho frontend
            this.role = user.getRole() != null ? user.getRole().name().toLowerCase() : "customer";
        }

        public Integer getId() { return id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getPhone() { return phone; }
        public String getAddress() { return address; }
        public String getRole() { return role; }
    }
}
