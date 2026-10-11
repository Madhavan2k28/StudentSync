package com.studentsync.repository;

import com.studentsync.model.Item;
import com.studentsync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByPostedByOrderByCreatedAtDesc(User user);

    List<Item> findByTypeAndStatusAndCategoryIgnoreCase(Item.Type type, Item.Status status, String category);

    @Query("""
           SELECT i FROM Item i
           WHERE (:type IS NULL OR i.type = :type)
             AND (:status IS NULL OR i.status = :status)
             AND (:category IS NULL OR LOWER(i.category) = LOWER(:category))
             AND (:q IS NULL
                  OR LOWER(i.title) LIKE LOWER(CONCAT('%', :q, '%'))
                  OR LOWER(i.description) LIKE LOWER(CONCAT('%', :q, '%'))
                  OR LOWER(i.location) LIKE LOWER(CONCAT('%', :q, '%')))
           ORDER BY i.createdAt DESC
           """)
    List<Item> search(@Param("type") Item.Type type,
                      @Param("status") Item.Status status,
                      @Param("category") String category,
                      @Param("q") String q);
}
