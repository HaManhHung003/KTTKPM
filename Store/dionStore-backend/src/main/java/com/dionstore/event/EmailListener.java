package com.dionstore.event;

import com.dionstore.entity.Order;
import com.dionstore.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EmailListener {

    private final EmailService emailService;

    @EventListener
    @Async 
    public void handleOrderPlacedEvent(OrderPlacedEvent event) {
        Order order = event.getOrder();
        System.out.println("EmailListener: Nhận được sự kiện OrderPlacedEvent cho đơn hàng ID: " + order.getId());
        try {
            emailService.sendOrderConfirmation(order);
            System.out.println("EmailListener: Gửi email thành công tới " + order.getEmail());
        } catch (Exception e) {
            System.err.println("EmailListener Lỗi: Không thể gửi email: " + e.getMessage());
        }
    }
}
