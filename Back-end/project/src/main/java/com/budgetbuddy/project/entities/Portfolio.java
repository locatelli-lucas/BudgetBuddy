package com.budgetbuddy.project.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@NoArgsConstructor
@Getter
@Setter
@ToString(doNotUseGetters = true)
@Entity
@Table(name = "tb_portfolio")
public class Portfolio implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @PrimaryKeyJoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "portfolio")
    private List<Stock> stockList = new ArrayList<>();

    @OneToMany(mappedBy = "portfolio")
    private List<DirectTreasure> directTreasure = new ArrayList<>();

    public Portfolio(User user, List<Stock> stockList, List<DirectTreasure> directTreasure) {
        this.user = user;
        this.stockList = stockList;
        this.directTreasure = directTreasure;
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
}
