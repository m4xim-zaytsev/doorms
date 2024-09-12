package com.example.task_service_jwt.repository;

import com.example.task_service_jwt.entity.Product;
import com.example.task_service_jwt.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product,Long> {
}
