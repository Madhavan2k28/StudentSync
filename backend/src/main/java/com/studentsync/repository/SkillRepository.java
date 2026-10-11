package com.studentsync.repository;

import com.studentsync.model.Skill;
import com.studentsync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    List<Skill> findByUserOrderByNameAsc(User user);

    @Query("""
           SELECT s FROM Skill s
           WHERE (:kind IS NULL OR s.kind = :kind)
             AND (:q IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :q, '%'))
                  OR LOWER(s.description) LIKE LOWER(CONCAT('%', :q, '%')))
           ORDER BY s.name ASC
           """)
    List<Skill> search(@Param("kind") Skill.Kind kind, @Param("q") String q);
}
