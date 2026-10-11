package com.studentsync.model;

import jakarta.persistence.*;

/** A skill a student can teach, or wants to learn. */
@Entity
@Table(name = "skills")
public class Skill {

    public enum Kind { TEACH, LEARN }
    public enum Level { BEGINNER, INTERMEDIATE, ADVANCED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 8)
    private Kind kind;

    @Enumerated(EnumType.STRING)
    @Column(length = 14)
    private Level level;

    @Column(length = 500)
    private String description;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Kind getKind() { return kind; }
    public void setKind(Kind kind) { this.kind = kind; }
    public Level getLevel() { return level; }
    public void setLevel(Level level) { this.level = level; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
