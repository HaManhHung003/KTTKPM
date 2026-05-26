package com.dionstore.service;

import com.dionstore.dto.request.OrderRequestDto;
import com.dionstore.entity.Order;
import com.dionstore.entity.User;

import java.util.List;

public interface OrderService {
    Order createOrder(OrderRequestDto orderRequest, User user);
    List<Order> getOrdersByUser(User user);
    Order getOrderById(Long id);
    List<Order> getAllOrders();
    Order updateOrderStatus(Long id, String status);
}
