package com.example.task_service_jwt.repository;

import com.example.task_service_jwt.entity.CartItem;
import com.example.task_service_jwt.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem,Long> {
}
