package com.dionstore.service;

import com.dionstore.dto.ChatMessageDTO;
import java.util.List;
import java.util.Map;

public interface ChatService {
    List<ChatMessageDTO> getChatHistory(Integer userId);
    ChatMessageDTO saveMessage(Integer userId, String message, String senderRole);
    List<Map<String, Object>> getActiveChats();
}
