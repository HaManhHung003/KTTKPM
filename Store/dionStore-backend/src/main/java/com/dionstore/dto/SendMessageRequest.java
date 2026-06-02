package com.dionstore.dto;

public class SendMessageRequest {
    private Integer userId; 
    private String message;

    public SendMessageRequest() {}

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
