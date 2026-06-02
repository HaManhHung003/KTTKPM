package com.dionstore.service;

import com.dionstore.entity.Product;
import java.util.List;

public interface ProductService {
    List<Product> getAllProductsForAdmin();
    List<Product> getPublishedProducts();
    Product getProductById(Long id);
    List<Product> getProductsByCategory(Long categoryId);
    Product createProduct(Product product);
    Product updateProduct(Long id, Product productDetails);
    void deleteProduct(Long id);
    Product publishProduct(Long id, boolean publish);
    Product updateProductQuantity(Long id, int newQuantity);
}
