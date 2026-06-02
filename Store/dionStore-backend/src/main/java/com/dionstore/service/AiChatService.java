package com.dionstore.service;

import com.dionstore.dto.request.AiChatRequest;
import com.dionstore.dto.response.AiChatResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiChatService {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    
    private final String DATABASE_SCHEMA = """
        Database schema:
        1. users(id, name, email, role, created_at)
        2. categories(id, name, description)
        3. products(id, name, cost_price, selling_price, quantity, category_id, created_at)
        4. orders(id, user_id, customer_name, total_selling_amount, status(pending, confirmed, shipping, completed, cancelled), created_at)
        5. order_details(id, order_id, product_id, quantity, selling_price)
        6. payments(id, order_id, method, status)
        """;

    public AiChatResponse processAdminChat(AiChatRequest request) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            return AiChatResponse.builder()
                    .response("Lỗi: Gemini API Key chưa được cấu hình. Vui lòng thêm vào application.properties.")
                    .build();
        }

        try {
            
            String sqlPrompt = DATABASE_SCHEMA + "\n\n" +
                    "Nhiệm vụ của bạn là chuyển đổi câu hỏi sau thành một câu lệnh SQL (MySQL/MariaDB) DUY NHẤT để truy vấn dữ liệu.\n" +
                    "CHỈ trả về câu lệnh SQL, KHÔNG kèm theo lời giải thích, KHÔNG có dấu markdown (như ```sql). " +
                    "Câu lệnh bắt buộc phải bắt đầu bằng SELECT.\n" +
                    "Câu hỏi: " + request.getMessage();

            String sqlQuery = callGeminiApi(sqlPrompt).trim();
            
            
            if (sqlQuery.startsWith("```sql")) {
                sqlQuery = sqlQuery.replace("```sql", "").replace("```", "").trim();
            }

            
            if (!isSafeSql(sqlQuery)) {
                return AiChatResponse.builder()
                        .response("Xin lỗi, tôi chỉ có thể thực hiện các truy vấn đọc dữ liệu (SELECT).")
                        .executedSql(sqlQuery)
                        .build();
            }

            
            List<Map<String, Object>> result = jdbcTemplate.queryForList(sqlQuery);
            String jsonResult = objectMapper.writeValueAsString(result);

            
            String answerPrompt = "Đây là kết quả của truy vấn SQL dưới dạng JSON: " + jsonResult + "\n\n" +
                    "Câu hỏi ban đầu của người dùng là: " + request.getMessage() + "\n" +
                    "Dựa vào kết quả JSON, hãy trả lời câu hỏi của người dùng bằng tiếng Việt, ngắn gọn, lịch sự và dễ hiểu. " +
                    "Nếu kết quả JSON rỗng, hãy trả lời là không tìm thấy thông tin.";

            String finalAnswer = callGeminiApi(answerPrompt);

            return AiChatResponse.builder()
                    .response(finalAnswer)
                    .executedSql(sqlQuery)
                    .build();

        } catch (Exception e) {
            log.error("AI Chat process failed", e);
            return AiChatResponse.builder()
                    .response("Đã có lỗi xảy ra trong quá trình xử lý: " + e.getMessage())
                    .error(e.getMessage())
                    .build();
        }
    }

    private boolean isSafeSql(String sql) {
        String upperSql = sql.toUpperCase().trim();
        
        if (!upperSql.startsWith("SELECT")) {
            return false;
        }
        
        String[] forbiddenWords = {"DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "TRUNCATE", "REPLACE", "GRANT", "REVOKE"};
        for (String word : forbiddenWords) {
            
            
            Pattern pattern = Pattern.compile("\\b" + word + "\\b");
            Matcher matcher = pattern.matcher(upperSql);
            if (matcher.find()) {
                return false;
            }
        }
        return true;
    }

    private String callGeminiApi(String prompt) throws Exception {
        String url = geminiApiUrl + "?key=" + geminiApiKey;

        
        String requestBody = """
            {
              "contents": [{
                "parts": [{"text": %s}]
              }],
              "generationConfig": {
                "temperature": 0.1
              }
            }
            """.formatted(objectMapper.writeValueAsString(prompt)); 

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
        Map<String, Object> body = response.getBody();

        if (body != null && body.containsKey("candidates")) {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
            if (!candidates.isEmpty()) {
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                if (!parts.isEmpty()) {
                    return (String) parts.get(0).get("text");
                }
            }
        }
        throw new RuntimeException("Không thể lấy phản hồi từ Gemini API");
    }
}
