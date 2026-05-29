package com.dionstore.service.impl;

import com.dionstore.dto.request.OrderRequestDto;
import com.dionstore.entity.Order;
import com.dionstore.entity.OrderDetail;
import com.dionstore.entity.Product;
import com.dionstore.entity.User;
import com.dionstore.repository.OrderRepository;
import com.dionstore.repository.ProductRepository;
import com.dionstore.service.EmailService;
import com.dionstore.service.OrderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;

    public OrderServiceImpl(OrderRepository orderRepository, ProductRepository productRepository, EmailService emailService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public Order createOrder(OrderRequestDto orderRequest, User user) {
        Order order = new Order();
        order.setUser(user);
        order.setCustomerName(orderRequest.getCustomerName());
        order.setEmail(orderRequest.getEmail());
        order.setPhone(orderRequest.getPhone());
        order.setAddress(orderRequest.getAddress());
        order.setTotalSellingAmount(orderRequest.getTotal());
        order.setStatus("pending");

        List<OrderDetail> details = new ArrayList<>();
        for (OrderRequestDto.OrderItemRequest itemRequest : orderRequest.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));

            if (product.getQuantity() < itemRequest.getQuantity()) {
                throw new RuntimeException("Không đủ số lượng trong kho cho sản phẩm: " + product.getName());
            }

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setProduct(product);
            detail.setQuantity(itemRequest.getQuantity());
            detail.setCostPrice(product.getCostPrice());
            detail.setSellingPrice(itemRequest.getPrice());
            details.add(detail);
        }

        order.setDetails(details);
        Order savedOrder = orderRepository.save(order);

        try {
            emailService.sendOrderConfirmation(savedOrder);
        } catch (Exception e) {
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
        }

        return savedOrder;
    }

    @Override
    public List<Order> getOrdersByUser(User user) {
        if (user == null) return new ArrayList<>();
        return orderRepository.findByUserId(user.getId());
    }

    @Override
    public Order getOrderById(Long id) {
        if (id == null) return null;
        return orderRepository.findById(id).orElse(null);
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        String oldStatus = order.getStatus();
        
        boolean isNewStatusActive = "confirmed".equalsIgnoreCase(status) || "shipping".equalsIgnoreCase(status) || "completed".equalsIgnoreCase(status);
        boolean isOldStatusActive = "confirmed".equalsIgnoreCase(oldStatus) || "shipping".equalsIgnoreCase(oldStatus) || "completed".equalsIgnoreCase(oldStatus);

        // Nếu chuyển từ trạng thái chưa trừ (pending) sang trạng thái được duyệt (confirmed/shipping/completed) thì tiến hành trừ kho
        if (isNewStatusActive && !isOldStatusActive) {
            for (OrderDetail detail : order.getDetails()) {
                Product product = detail.getProduct();
                if (product != null) {
                    if (product.getQuantity() < detail.getQuantity()) {
                        throw new RuntimeException("Không đủ số lượng trong kho cho sản phẩm: " + product.getName());
                    }
                    product.setQuantity(product.getQuantity() - detail.getQuantity());
                    productRepository.save(product);
                }
            }
        }

        // Nếu chuyển từ trạng thái đã duyệt (đã trừ kho) sang hủy (cancelled) thì tiến hành hoàn lại kho
        if ("cancelled".equalsIgnoreCase(status) && isOldStatusActive) {
            for (OrderDetail detail : order.getDetails()) {
                Product product = detail.getProduct();
                if (product != null) {
                    product.setQuantity(product.getQuantity() + detail.getQuantity());
                    productRepository.save(product);
                }
            }
        }
        
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
