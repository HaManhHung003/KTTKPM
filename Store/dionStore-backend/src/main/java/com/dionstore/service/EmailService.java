package com.dionstore.service;

import com.dionstore.entity.Order;

public interface EmailService {
    void sendOrderConfirmation(Order order);
}
