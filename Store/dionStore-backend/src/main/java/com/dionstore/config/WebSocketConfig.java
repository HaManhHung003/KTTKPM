package com.dionstore.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple in-memory message broker to send messages to clients on /topic
        config.enableSimpleBroker("/topic", "/queue");
        // Prefix for messages bound for methods annotated with @MessageMapping
        config.setApplicationDestinationPrefixes("/app");
        // Prefix for user-specific queues
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register the "/ws" endpoint, enabling SockJS fallback options
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:3000", "http://localhost:5173")
                .withSockJS();
    }

    private final com.dionstore.security.WebSocketAuthChannelInterceptor webSocketAuthChannelInterceptor;

    public WebSocketConfig(com.dionstore.security.WebSocketAuthChannelInterceptor webSocketAuthChannelInterceptor) {
        this.webSocketAuthChannelInterceptor = webSocketAuthChannelInterceptor;
    }

    @Override
    public void configureClientInboundChannel(org.springframework.messaging.simp.config.ChannelRegistration registration) {
        registration.interceptors(webSocketAuthChannelInterceptor);
    }
}
