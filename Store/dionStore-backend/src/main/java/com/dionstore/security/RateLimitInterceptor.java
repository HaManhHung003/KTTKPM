package com.dionstore.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RateLimit rateLimit = handlerMethod.getMethodAnnotation(RateLimit.class);

        if (rateLimit == null) {
            return true;
        }

        String clientIp = getClientIp(request);
        String uri = request.getRequestURI();
        String method = request.getMethod();
        
        
        String redisKey = String.format("rate:limit:%s:%s:%s", clientIp, method, uri);

        Long currentCount = redisTemplate.opsForValue().increment(redisKey);

        if (currentCount != null && currentCount == 1L) {
            
            redisTemplate.expire(redisKey, Duration.ofSeconds(rateLimit.timeWindow()));
        }

        if (currentCount != null && currentCount > rateLimit.limit()) {
            Long ttl = redisTemplate.getExpire(redisKey, TimeUnit.SECONDS);
            long waitTime = (ttl != null && ttl > 0) ? ttl : rateLimit.timeWindow();
            
            sendErrorResponse(response, waitTime);
            return false;
        }

        return true;
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isEmpty() && !"unknown".equalsIgnoreCase(xff)) {
            
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void sendErrorResponse(HttpServletResponse response, long waitTimeSeconds) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        errorDetails.put("status", HttpStatus.TOO_MANY_REQUESTS.value());
        errorDetails.put("error", "Too Many Requests");
        errorDetails.put("message", String.format("Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau %d giây.", waitTimeSeconds));
        errorDetails.put("retryAfterSeconds", waitTimeSeconds);

        response.getWriter().write(objectMapper.writeValueAsString(errorDetails));
    }
}
