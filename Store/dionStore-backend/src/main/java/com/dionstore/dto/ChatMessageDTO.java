package com.dionstore.dto;

import com.dionstore.entity.ChatMessage;
import java.time.LocalDateTime;

public class ChatMessageDTO {
    private Long id;
    private Integer userId;
    private String message;
    private String senderRole;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public static ChatMessageDTO from(ChatMessage entity) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        dto.setMessage(entity.getMessage());
        dto.setSenderRole(entity.getSenderRole());
        dto.setIsRead(entity.getIsRead());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
