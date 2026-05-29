package com.dionstore.controller;

import com.dionstore.dto.request.AiChatRequest;
import com.dionstore.dto.response.AiChatResponse;
import com.dionstore.service.AiChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/ai")
@RequiredArgsConstructor
public class AiChatController {

    private final AiChatService aiChatService;

    @PostMapping("/chat")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<AiChatResponse> chat(@Valid @RequestBody AiChatRequest request) {
        AiChatResponse response = aiChatService.processAdminChat(request);
        return ResponseEntity.ok(response);
    }
}
