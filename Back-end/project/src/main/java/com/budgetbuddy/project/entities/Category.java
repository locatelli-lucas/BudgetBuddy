package com.budgetbuddy.project.entities;

import com.budgetbuddy.project.types.ExpensesTypes;
import jakarta.persistence.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "tb_categories")
public class Category implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private ExpensesTypes expenseType;

    @Column(nullable = false)
    private String name;

    public Category() {

    }

    public Category(Long id, ExpensesTypes expenseType, String name) {
        this.id = id;
        this.expenseType = expenseType;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ExpensesTypes getExpenseType() {
        return expenseType;
    }

    public void setExpenseType(ExpensesTypes expenseType) {
        this.expenseType = expenseType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
                ", expenseType=" + expenseType +
                ", name='" + name + '\'' +
                '}';
    }
}
