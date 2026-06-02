package com.dionstore.controller;

import com.dionstore.dto.ChatMessageDTO;
import com.dionstore.dto.SendMessageRequest;
import com.dionstore.entity.User;
import com.dionstore.service.AuthService;
import com.dionstore.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
public class ChatController {

    private final ChatService chatService;
    private final AuthService authService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatService chatService, AuthService authService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.authService = authService;
        this.messagingTemplate = messagingTemplate;
    }

    
    @GetMapping("/api/chat/history/{userId}")
    public ResponseEntity<List<ChatMessageDTO>> getHistory(@PathVariable Integer userId, Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(chatService.getChatHistory(userId));
    }

    
    @GetMapping("/api/chat/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getActiveChats() {
        return ResponseEntity.ok(chatService.getActiveChats());
    }

    
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request, Principal principal) {
        System.out.println("Received message: " + request.getMessage() + " from user: " + request.getUserId());
        if (principal == null) {
            System.out.println("Principal is null! Auth failed in WebSocket interceptor.");
            return;
        }

        User sender = authService.getUserByEmail(principal.getName());
        if (sender == null) {
            System.out.println("Sender not found in DB: " + principal.getName());
            return;
        }

        String senderRole = sender.getRoleString().toLowerCase(); 
        
        Integer targetUserId = request.getUserId(); 
        
        if ("customer".equals(senderRole)) {
            targetUserId = sender.getId();
        }

        if (targetUserId == null) return;

        ChatMessageDTO savedMessage = chatService.saveMessage(targetUserId, request.getMessage(), senderRole);

        
        
        messagingTemplate.convertAndSend("/topic/chat." + targetUserId, savedMessage);

        
        if ("customer".equals(senderRole)) {
            messagingTemplate.convertAndSend("/topic/chat.admin", savedMessage);
        }
    }
}
