package com.budgetbuddy.project.entities;

import com.budgetbuddy.project.types.CategoryTypes;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@Entity
@Table(name = "tb_categories")
public class Category implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private CategoryTypes type;

    @Column(nullable = false, unique = true)
    private String name;

    private String icon;

    public Category() {

    }

    public Category(CategoryTypes type, String name) {
        this.type = type;
        this.name = name;
    }

    public Category(CategoryTypes type, String name, String icon) {
        this.type = type;
        this.name = name;
        this.icon = icon;
    }

    public Category(Long id, CategoryTypes type, String name, String icon) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.icon = icon;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Category category)) return false;
        return Objects.equals(id, category.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Category{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }
}
