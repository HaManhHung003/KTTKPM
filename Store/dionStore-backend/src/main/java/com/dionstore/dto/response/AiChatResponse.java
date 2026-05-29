package com.dionstore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatResponse {

    private String response;
    
    // Thêm các thông tin debug nếu cần (ví dụ câu SQL đã chạy, lỗi nếu có)
    private String executedSql;
    private String error;
}
