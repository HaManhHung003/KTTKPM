package com.dionstore.dto.request;

import java.math.BigDecimal;
import java.util.List;

public class OrderRequestDto {
    private String customerName;
    private String email;
    private String phone;
    private String address;
    private BigDecimal total;
    private List<OrderItemRequest> items;

    public OrderRequestDto() {}

    public OrderRequestDto(String customerName, String email, String phone, String address, BigDecimal total, List<OrderItemRequest> items) {
        this.customerName = customerName;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.total = total;
        this.items = items;
    }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }

    public static class OrderItemRequest {
        private Long productId;
        private Integer quantity;
        private BigDecimal price;

        public OrderItemRequest() {}

        public OrderItemRequest(Long productId, Integer quantity, BigDecimal price) {
            this.productId = productId;
            this.quantity = quantity;
            this.price = price;
        }

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
    }
}
