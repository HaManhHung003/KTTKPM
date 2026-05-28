package com.dionstore.service.impl;

import com.dionstore.entity.Order;
import com.dionstore.entity.OrderDetail;
import com.dionstore.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    public void sendOrderConfirmation(Order order) {
        System.out.println("Attempting to send order confirmation for Order ID: " + (order != null ? order.getId() : "null"));
        if (order == null || order.getEmail() == null) {
            System.err.println("Order or Order Email is null. Cannot send email.");
            return;
        }
        if (mailSender == null) {
            System.err.println("CRITICAL: Email sender (JavaMailSender) not configured in Spring context. Check application.properties.");
            return;
        }
        
        try {
            System.out.println("Sending email to: " + order.getEmail());
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(order.getEmail());
            helper.setSubject("Xác nhận đơn hàng #" + order.getId() + " - dionStore");

            StringBuilder content = new StringBuilder();
            content.append("<h1>Cảm ơn bạn đã mua sắm tại dionStore!</h1>");
            content.append("<p>Chào ").append(order.getCustomerName()).append(",</p>");
            content.append("<p>Đơn hàng của bạn đã được nhận và đang được xử lý.</p>");
            
            content.append("<h3>Thông tin đơn hàng:</h3>");
            content.append("<p><strong>Mã đơn hàng:</strong> #").append(order.getId()).append("</p>");
            content.append("<p><strong>Ngày đặt:</strong> ").append(order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))).append("</p>");
            content.append("<p><strong>Tổng tiền:</strong> ").append(String.format("%,.0f", order.getTotalSellingAmount())).append("₫</p>");

            content.append("<h3>Địa chỉ nhận hàng:</h3>");
            content.append("<p>").append(order.getAddress()).append("</p>");
            content.append("<p><strong>Số điện thoại:</strong> ").append(order.getPhone()).append("</p>");

            content.append("<h3>Chi tiết sản phẩm:</h3>");
            content.append("<table border='1' style='border-collapse: collapse; width: 100%;'>");
            content.append("<thead><tr><th>Sản phẩm</th><th>Số lượng</th><th>Giá</th><th>Thành tiền</th></tr></thead>");
            content.append("<tbody>");
            for (OrderDetail detail : order.getDetails()) {
                content.append("<tr>");
                content.append("<td>").append(detail.getProduct().getName()).append("</td>");
                content.append("<td style='text-align: center;'>").append(detail.getQuantity()).append("</td>");
                content.append("<td style='text-align: right;'>").append(String.format("%,.0f", detail.getSellingPrice())).append("₫</td>");
                content.append("<td style='text-align: right;'>").append(String.format("%,.0f", detail.getSellingPrice().doubleValue() * detail.getQuantity())).append("₫</td>");
                content.append("</tr>");
            }
            content.append("</tbody></table>");

            content.append("<p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email này.</p>");
            content.append("<p>Trân trọng,<br>Đội ngũ dionStore</p>");

            helper.setText(content.toString(), true);
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + order.getEmail());

        } catch (MessagingException e) {
            System.err.println("Failed to send email: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error in email service: " + e.getMessage());
        }
    }
}
