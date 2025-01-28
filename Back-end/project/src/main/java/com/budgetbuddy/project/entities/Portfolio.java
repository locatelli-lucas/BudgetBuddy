package com.budgetbuddy.project.entities;

import com.budgetbuddy.project.types.IncomeTypes;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Getter
@Setter
@Entity
@Table(name = "tb_portfolio")
public class Portfolio implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "portfolio")
    private List<Stock> stockList = new ArrayList<>();

    @OneToMany(mappedBy = "portfolio")
    private List<DirectTreasure> directTreasure = new ArrayList<>();

    public Portfolio() {

    }

    public Portfolio(Long id, User user, List<Stock> stockList, List<DirectTreasure> directTreasure) {
        this.id = id;
        this.user = user;
        this.stockList = stockList;
        this.directTreasure = directTreasure;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Portfolio portfolio)) return false;
        return Objects.equals(id, portfolio.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Portfolio{" +
                "id=" + id +
                ", user=" + user +
                ", stockList=" + stockList +
                ", directTreasure=" + directTreasure +
                '}';
    }
}
