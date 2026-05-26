package com.dionstore.controller;

import com.dionstore.entity.Product;
import com.dionstore.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional; // Import Optional

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    // Modified to only return published products for general users
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productRepository.findByIsPublishedTrue());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Optional<Product> product = productRepository.findById(id);
        if (product.isPresent() && product.get().isPublished()) {
            return ResponseEntity.ok(product.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productRepository.findByCategoryIdAndIsPublishedTrue(categoryId));
    }
    
    // Removed createProduct and publishProduct as they are now handled by AdminProductController
    // @PostMapping
    // public ResponseEntity<Product> createProduct(@RequestBody Product product) {
    //     return ResponseEntity.ok(productRepository.save(product));
    // }

    // @PutMapping("/{id}/publish")
    // public ResponseEntity<Product> publishProduct(@PathVariable Long id, @RequestParam boolean publish) {
    //     Optional<Product> productOptional = productRepository.findById(id);
    //     if (productOptional.isPresent()) {
    //         Product product = productOptional.get();
    //         product.setPublished(publish);
    //         return ResponseEntity.ok(productRepository.save(product));
    //     } else {
    //         return ResponseEntity.notFound().build();
    //     }
    // }
}
