package com.dionstore.repository;

import com.dionstore.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByUserIdOrderByCreatedAtAsc(Integer userId);
    
    @Query("SELECT DISTINCT c.user.id FROM ChatMessage c WHERE c.user IS NOT NULL")
    List<Integer> findActiveChatUserIds();

    ChatMessage findFirstByUserIdOrderByCreatedAtDesc(Integer userId);

    @Query("SELECT COUNT(c) FROM ChatMessage c WHERE c.user.id = :userId AND c.senderRole = 'customer' AND c.isRead = false")
    long countUnreadByUserId(Integer userId);
}
