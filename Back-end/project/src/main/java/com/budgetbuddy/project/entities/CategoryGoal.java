package com.budgetbuddy.project.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@Entity
@Table(name = "tb_category_goals")
public class CategoryGoal implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "goal_id")
    private Goal goal;

    @OneToOne(mappedBy = "category_goal")
    private Category category;

    private double amount;

    public CategoryGoal() {

    }

    public CategoryGoal(Goal goal, Category category, double amount) {
        this.goal = goal;
        this.category = category;
        this.amount = amount;
    }

    public CategoryGoal(Long id, Goal goal, Category category, double amount) {
        this.id = id;
        this.goal = goal;
        this.category = category;
        this.amount = amount;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CategoryGoal that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "CategoryGoal{" +
                "id=" + id +
                ", category=" + category +
                ", amount=" + amount +
                '}';
    }
}
