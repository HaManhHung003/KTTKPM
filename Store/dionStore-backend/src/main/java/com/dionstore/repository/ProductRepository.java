package com.dionstore.repository;

import com.dionstore.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByIsPublishedTrue(); // New method to find published products
    List<Product> findByCategoryIdAndIsPublishedTrue(Long categoryId);
}
