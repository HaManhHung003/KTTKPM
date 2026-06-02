package com.dionstore.service;

import com.dionstore.entity.Order;
import com.dionstore.entity.OrderDetail;
import com.dionstore.entity.Product;
import com.dionstore.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderSagaOrchestrator {

    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final PaymentService paymentService;

    public OrderSagaOrchestrator(OrderRepository orderRepository,
                                  @Lazy ProductService productService,
                                  PaymentService paymentService) {
        this.orderRepository = orderRepository;
        this.productService = productService;
        this.paymentService = paymentService;
    }

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
                int newQty = product.getQuantity() - detail.getQuantity();
                productService.updateProductQuantity(product.getId(), newQty);
            }
        }
    }

    private void compensateRollbackInventory(Order order) {
        System.out.println("Saga Bù Trừ: Cộng hoàn trả lại số lượng kho cho đơn hàng ID " + order.getId());
        for (OrderDetail detail : order.getDetails()) {
            Product product = detail.getProduct();
            if (product != null) {
                int restoredQty = product.getQuantity() + detail.getQuantity();
                productService.updateProductQuantity(product.getId(), restoredQty);
            }
        }
    }

    private void compensateCancelOrder(Order order, String reason) {
        System.out.println("Saga Bù Trừ: Hủy đơn hàng ID " + order.getId() + " - Lý do: " + reason);
        order.setStatus("cancelled");
        orderRepository.save(order);
    }
}
