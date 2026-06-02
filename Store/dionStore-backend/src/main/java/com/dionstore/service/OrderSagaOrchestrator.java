package com.dionstore.service;

import com.dionstore.entity.Order;
import com.dionstore.entity.OrderDetail;
import com.dionstore.entity.Product;
import com.dionstore.repository.OrderRepository;
import com.dionstore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderSagaOrchestrator {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final PaymentService paymentService;

    @Transactional
    public void confirmOrderSaga(Order order) {
        System.out.println("Saga Orchestrator: Bắt đầu xác nhận đơn hàng ID " + order.getId());

        
        try {
            deductInventory(order);
            System.out.println("Saga Orchestrator: Bước 1 - Trừ kho thành công");
        } catch (Exception e) {
            System.err.println("Saga Orchestrator Lỗi Bước 1: Trừ kho thất bại -> Hủy đơn hàng");
            compensateCancelOrder(order, "Cancelled due to out of stock: " + e.getMessage());
            throw new RuntimeException("Saga inventory reservation failed: " + e.getMessage());
        }

        
        try {
            paymentService.processPayment(order);
            System.out.println("Saga Orchestrator: Bước 2 - Thanh toán thành công");
            
            
            order.setStatus("confirmed");
            orderRepository.save(order);
            System.out.println("Saga Orchestrator: Hoàn thành giao dịch Saga thành công!");
        } catch (Exception e) {
            System.err.println("Saga Orchestrator Lỗi Bước 2: Thanh toán thất bại -> Thực hiện giao dịch bù trừ (Rollback kho)");
            
            
            compensateRollbackInventory(order);
            compensateCancelOrder(order, "Cancelled due to payment failure: " + e.getMessage());
            
            throw new RuntimeException("Saga payment processing failed: " + e.getMessage());
        }
    }

    private void deductInventory(Order order) {
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

    

    private void compensateRollbackInventory(Order order) {
        System.out.println("Saga Bù Trừ: Cộng hoàn trả lại số lượng kho cho đơn hàng ID " + order.getId());
        for (OrderDetail detail : order.getDetails()) {
            Product product = detail.getProduct();
            if (product != null) {
                product.setQuantity(product.getQuantity() + detail.getQuantity());
                productRepository.save(product);
            }
        }
    }

    private void compensateCancelOrder(Order order, String reason) {
        System.out.println("Saga Bù Trừ: Hủy đơn hàng ID " + order.getId() + " - Lý do: " + reason);
        order.setStatus("cancelled");
        orderRepository.save(order);
    }
}
