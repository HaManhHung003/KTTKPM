package com.dionstore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItemResponse {
    private Long productId;
    private String name;
    private String image;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal subtotal;
}
