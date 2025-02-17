package com.budgetbuddy.project.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;

@NoArgsConstructor
@Getter
@Setter
@ToString(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "tb_goals")
public class Goal implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Date month;

    private double targetAchieved;

    private double thisMonthTarget;

    @OneToMany(mappedBy = "goal")
    private List<CategoryGoal> goalsByCategory = new ArrayList<>();

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Goal(Date month, double targetAchieved, double thisMonthTarget, User user) {
        this.month = month;
        this.targetAchieved = targetAchieved;
        this.thisMonthTarget = thisMonthTarget;
        this.user = user;
    }

    public Goal(Long id, Date month, double targetAchieved, double thisMonthTarget, User user) {
        this.id = id;
        this.month = month;
        this.targetAchieved = targetAchieved;
        this.thisMonthTarget = thisMonthTarget;
        this.user = user;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Goal goal)) return false;
        return Objects.equals(id, goal.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
