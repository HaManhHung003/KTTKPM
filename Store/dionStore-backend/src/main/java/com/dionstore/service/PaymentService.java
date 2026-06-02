package com.dionstore.service;

import com.dionstore.entity.Order;

public interface PaymentService {
    void processPayment(Order order) throws Exception;
}
