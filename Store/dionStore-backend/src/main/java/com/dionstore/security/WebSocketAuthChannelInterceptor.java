package com.dionstore.security;

import com.dionstore.service.JwtService;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;

    public WebSocketAuthChannelInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            System.out.println("Intercepted STOMP CONNECT. Headers: " + accessor.getMessageHeaders());
            List<String> authHeaders = accessor.getNativeHeader("Authorization");
            if (authHeaders != null && !authHeaders.isEmpty()) {
                String bearerToken = authHeaders.get(0);
                if (bearerToken.startsWith("Bearer ")) {
                    String token = bearerToken.substring(7);
                    if (jwtService.validateToken(token)) {
                        String email = jwtService.extractEmail(token);
                        String role = jwtService.extractRole(token);
                        String authority = "ROLE_" + role.toUpperCase();
                        
                        UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(email, null, Collections.singletonList(new SimpleGrantedAuthority(authority)));
                        accessor.setUser(authentication);
                        System.out.println("STOMP Auth Success for user: " + email);
                    } else {
                        System.out.println("STOMP Auth Failed: Invalid JWT Token");
                    }
                }
            } else {
                System.out.println("STOMP Auth Failed: No Authorization header in CONNECT frame");
            }
        }
        return message;
    }
}
