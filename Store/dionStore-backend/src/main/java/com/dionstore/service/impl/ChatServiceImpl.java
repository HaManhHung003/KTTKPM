package com.dionstore.service.impl;

import com.dionstore.dto.ChatMessageDTO;
import com.dionstore.entity.ChatMessage;
import com.dionstore.entity.User;
import com.dionstore.repository.ChatRepository;
import com.dionstore.repository.UserRepository;
import com.dionstore.service.ChatService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatServiceImpl implements ChatService {

    private final ChatRepository chatRepository;
    private final UserRepository userRepository;

    public ChatServiceImpl(ChatRepository chatRepository, UserRepository userRepository) {
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public List<ChatMessageDTO> getChatHistory(Integer userId) {
        List<ChatMessage> messages = chatRepository.findByUserIdOrderByCreatedAtAsc(userId);
        
        // Mark unread customer messages as read when history is fetched (assuming admin fetches it)
        boolean updated = false;
        for (ChatMessage msg : messages) {
            if ("customer".equals(msg.getSenderRole()) && !Boolean.TRUE.equals(msg.getIsRead())) {
                msg.setIsRead(true);
                updated = true;
            }
        }
        if (updated) {
            chatRepository.saveAll(messages);
        }

        return messages.stream()
                .map(ChatMessageDTO::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ChatMessageDTO saveMessage(Integer userId, String message, String senderRole) {
        User user = userRepository.findById(userId.longValue())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setUser(user);
        chatMessage.setMessage(message);
        chatMessage.setSenderRole(senderRole);
        chatMessage.setIsRead(false);

        ChatMessage saved = chatRepository.save(chatMessage);
        return ChatMessageDTO.from(saved);
    }

    @Override
    public List<Map<String, Object>> getActiveChats() {
        List<Integer> activeUserIds = chatRepository.findActiveChatUserIds();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Integer uid : activeUserIds) {
            userRepository.findById(uid.longValue()).ifPresent(user -> {
                Map<String, Object> map = new HashMap<>();
                map.put("userId", user.getId());
                map.put("userName", user.getName());
                map.put("userEmail", user.getEmail());
                map.put("unreadCount", chatRepository.countUnreadByUserId(uid));
                ChatMessage lastMsg = chatRepository.findFirstByUserIdOrderByCreatedAtDesc(uid);
                if (lastMsg != null) {
                    map.put("lastMessage", lastMsg.getMessage());
                    map.put("lastMessageTime", lastMsg.getCreatedAt());
                    map.put("lastMessageSender", lastMsg.getSenderRole());
                }
                result.add(map);
            });
        }
        return result;
    }
}
