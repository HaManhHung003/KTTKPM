package com.dionstore.controller; // Keep it in the existing controller package for now

import com.dionstore.entity.Product;
import com.dionstore.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/products") // Admin-specific base path
public class AdminProductController {

    @Autowired
    private ProductRepository productRepository;

    // Get all products (for admin, including unpublished)
    @GetMapping
    public ResponseEntity<List<Product>> getAllProductsForAdmin() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    // Get product by ID (for admin, regardless of publish status)
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductByIdForAdmin(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create a new product
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        // When creating, isPublished defaults to false in the Product entity
        return ResponseEntity.ok(productRepository.save(product));
    }

    // Update an existing product
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        Optional<Product> productOptional = productRepository.findById(id);
        if (productOptional.isPresent()) {
            Product existingProduct = productOptional.get();
            existingProduct.setName(productDetails.getName());
            existingProduct.setCostPrice(productDetails.getCostPrice());
            existingProduct.setSellingPrice(productDetails.getSellingPrice());
            existingProduct.setQuantity(productDetails.getQuantity());
            existingProduct.setDescription(productDetails.getDescription());
            existingProduct.setImage(productDetails.getImage());
            existingProduct.setCategory(productDetails.getCategory());
            // Keep the existing isPublished status unless explicitly changed in productDetails
            // For admin, we might want to allow updating isPublished directly here as well
            existingProduct.setPublished(productDetails.isPublished());

            return ResponseEntity.ok(productRepository.save(existingProduct));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a product
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Endpoint for admin to publish/unpublish a product (moved from ProductController)
    @PutMapping("/{id}/publish")
    public ResponseEntity<Product> publishProduct(@PathVariable Long id, @RequestParam boolean publish) {
        Optional<Product> productOptional = productRepository.findById(id);
        if (productOptional.isPresent()) {
            Product product = productOptional.get();
            product.setPublished(publish);
            return ResponseEntity.ok(productRepository.save(product));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
