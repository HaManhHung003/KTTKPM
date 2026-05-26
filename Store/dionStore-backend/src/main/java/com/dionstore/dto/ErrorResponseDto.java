package com.dionstore.dto;

public class ErrorResponseDto {
    private String error;
    private int status;

    public ErrorResponseDto(String error, int status) {
        this.error = error;
        this.status = status;
    }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
}
