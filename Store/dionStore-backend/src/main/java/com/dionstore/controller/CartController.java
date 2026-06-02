package com.dionstore.controller;

import com.dionstore.dto.request.CartItemRequest;
import com.dionstore.dto.response.CartItemResponse;
import com.dionstore.dto.response.CartSessionResponse;
import com.dionstore.entity.Product;
import com.dionstore.repository.ProductRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final ProductRepository productRepository;
    private static final String CART_SESSION_KEY = "CART_SESSION";

    @GetMapping
    public ResponseEntity<CartSessionResponse> getCart(HttpSession session) {
        return ResponseEntity.ok(getCartResponse(session));
    }

    @PostMapping("/add")
    public ResponseEntity<CartSessionResponse> addToCart(@RequestBody CartItemRequest request, HttpSession session) {
        List<CartItemResponse> cart = getCartFromSession(session);
        Optional<Product> productOpt = productRepository.findById(request.getProductId());
        
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            boolean found = false;
            
            
            for (CartItemResponse item : cart) {
                if (item.getProductId().equals(product.getId())) {
                    item.setQuantity(item.getQuantity() + request.getQuantity());
                    item.setSubtotal(product.getSellingPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                    found = true;
                    break;
                }
            }
            
            
            if (!found) {
                CartItemResponse newItem = new CartItemResponse(
                        product.getId(),
                        product.getName(),
                        product.getImage(),
                        product.getSellingPrice(),
                        request.getQuantity(),
                        product.getSellingPrice().multiply(BigDecimal.valueOf(request.getQuantity()))
                );
                cart.add(newItem);
            }
            
            saveCartToSession(session, cart);
        }
        
        return ResponseEntity.ok(getCartResponse(session));
    }

    @PutMapping("/update")
    public ResponseEntity<CartSessionResponse> updateCartItem(@RequestBody CartItemRequest request, HttpSession session) {
        List<CartItemResponse> cart = getCartFromSession(session);
        Optional<Product> productOpt = productRepository.findById(request.getProductId());
        
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            
            for (CartItemResponse item : cart) {
                if (item.getProductId().equals(product.getId())) {
                    if (request.getQuantity() <= 0) {
                        cart.remove(item);
                    } else {
                        item.setQuantity(request.getQuantity());
                        item.setSubtotal(product.getSellingPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                    }
                    break;
                }
            }
            saveCartToSession(session, cart);
        }
        
        return ResponseEntity.ok(getCartResponse(session));
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<CartSessionResponse> removeFromCart(@PathVariable Long productId, HttpSession session) {
        List<CartItemResponse> cart = getCartFromSession(session);
        cart.removeIf(item -> item.getProductId().equals(productId));
        saveCartToSession(session, cart);
        
        return ResponseEntity.ok(getCartResponse(session));
    }

    
    @SuppressWarnings("unchecked")
    private List<CartItemResponse> getCartFromSession(HttpSession session) {
        List<CartItemResponse> cart = (List<CartItemResponse>) session.getAttribute(CART_SESSION_KEY);
        if (cart == null) {
            cart = new ArrayList<>();
        }
        return cart;
    }

    private void saveCartToSession(HttpSession session, List<CartItemResponse> cart) {
        session.setAttribute(CART_SESSION_KEY, cart);
    }

    private CartSessionResponse getCartResponse(HttpSession session) {
        List<CartItemResponse> cart = getCartFromSession(session);
        BigDecimal total = cart.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartSessionResponse(cart, total);
    }
}
