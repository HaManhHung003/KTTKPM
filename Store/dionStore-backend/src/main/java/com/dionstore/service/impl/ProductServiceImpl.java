package com.dionstore.service.impl;

import com.dionstore.entity.Product;
import com.dionstore.repository.ProductRepository;
import com.dionstore.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    @Cacheable(value = "products_all_admin")
    public List<Product> getAllProductsForAdmin() {
        System.out.println("Cache miss: Lấy tất cả sản phẩm cho admin từ DB");
        return productRepository.findAll();
    }

    @Override
    @Cacheable(value = "products_published")
    public List<Product> getPublishedProducts() {
        System.out.println("Cache miss: Lấy danh sách sản phẩm published từ DB");
        return productRepository.findByIsPublishedTrue();
    }

    @Override
    @Cacheable(value = "products_detail", key = "#id")
    public Product getProductById(Long id) {
        System.out.println("Cache miss: Lấy chi tiết sản phẩm ID " + id + " từ DB");
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    @Override
    @Cacheable(value = "products_category", key = "#categoryId")
    public List<Product> getProductsByCategory(Long categoryId) {
        System.out.println("Cache miss: Lấy sản phẩm của Category ID " + categoryId + " từ DB");
        return productRepository.findByCategoryIdAndIsPublishedTrue(categoryId);
    }

    @Override
    @CacheEvict(value = {"products_all_admin", "products_published", "products_detail", "products_category"}, allEntries = true)
    public Product createProduct(Product product) {
        System.out.println("Xóa Cache & Tạo sản phẩm mới trong DB");
        return productRepository.save(product);
    }

    @Override
    @CacheEvict(value = {"products_all_admin", "products_published", "products_detail", "products_category"}, allEntries = true)
    public Product updateProduct(Long id, Product productDetails) {
        System.out.println("Xóa Cache & Cập nhật sản phẩm ID " + id + " trong DB");
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        existingProduct.setName(productDetails.getName());
        existingProduct.setCostPrice(productDetails.getCostPrice());
        existingProduct.setSellingPrice(productDetails.getSellingPrice());
        existingProduct.setQuantity(productDetails.getQuantity());
        existingProduct.setDescription(productDetails.getDescription());
        existingProduct.setImage(productDetails.getImage());
        existingProduct.setCategory(productDetails.getCategory());
        existingProduct.setPublished(productDetails.isPublished());
        return productRepository.save(existingProduct);
    }

    @Override
    @CacheEvict(value = {"products_all_admin", "products_published", "products_detail", "products_category"}, allEntries = true)
    public void deleteProduct(Long id) {
        System.out.println("Xóa Cache & Xóa sản phẩm ID " + id + " trong DB");
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
        } else {
            throw new RuntimeException("Product not found with id: " + id);
        }
    }

    @Override
    @CacheEvict(value = {"products_all_admin", "products_published", "products_detail", "products_category"}, allEntries = true)
    public Product publishProduct(Long id, boolean publish) {
        System.out.println("Xóa Cache & Thay đổi trạng thái publish sản phẩm ID " + id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        product.setPublished(publish);
        return productRepository.save(product);
    }

    @Override
    @CacheEvict(value = {"products_all_admin", "products_published", "products_detail", "products_category"}, allEntries = true)
    public Product updateProductQuantity(Long id, int newQuantity) {
        System.out.println("Saga/Order: Xóa Cache & Cập nhật số lượng tồn kho sản phẩm ID " + id + " -> " + newQuantity);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        product.setQuantity(newQuantity);
        return productRepository.save(product);
    }
}

