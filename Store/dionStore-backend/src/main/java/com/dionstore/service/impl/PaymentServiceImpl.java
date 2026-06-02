package com.dionstore.service.impl;

import com.dionstore.entity.Order;
import com.dionstore.service.PaymentService;
import org.springframework.stereotype.Service;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Override
    public void processPayment(Order order) throws Exception {
        System.out.println("PaymentService: Đang xử lý thanh toán cho Đơn hàng ID " + order.getId() + " - Số tiền: " + order.getTotalSellingAmount());
        
        
        if (order.getCustomerName() != null && order.getCustomerName().toLowerCase().contains("fail")) {
            System.err.println("PaymentService Lỗi: Tài khoản khách hàng không đủ số dư!");
            throw new Exception("Insufficient funds in customer's bank account.");
        }

        
        if (order.getPhone() != null && order.getPhone().endsWith("404")) {
            System.err.println("PaymentService Lỗi: Lỗi kết nối cổng thanh toán ngân hàng!");
            throw new Exception("Payment gateway connection timeout.");
        }

        System.out.println("PaymentService: Thanh toán THÀNH CÔNG cho Đơn hàng ID " + order.getId());
    }
}
