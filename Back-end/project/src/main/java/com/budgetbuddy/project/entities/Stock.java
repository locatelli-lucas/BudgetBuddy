package com.budgetbuddy.project.entities;

import com.budgetbuddy.project.types.InvestmentTypes;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;
import java.util.Objects;

@Getter
@Setter
@Entity
@Table(name = "tb_stocks")
public class Stock implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private InvestmentTypes type;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private double currentPrice;

    private double acquisitionPrice;
    private Date acquisitionDate;
    private int quantity;

    @ManyToOne
    @JoinColumn(name = "portfolio_id")
    private Portfolio portfolio;

    public Stock() {

    }

    public Stock(
            String code,
            String name,
            double currentPrice,
            double acquisitionPrice,
            Date acquisitionDate,
            int quantity,
            Portfolio portfolio) {
        this.type = InvestmentTypes.VARIABLE;
        this.code = code;
        this.name = name;
        this.currentPrice = currentPrice;
        this.acquisitionPrice = acquisitionPrice;
        this.acquisitionDate = acquisitionDate;
        this.quantity = quantity;
        this.portfolio = portfolio;
    }

    public Stock(
            Long id,
            String code,
            String name,
            double currentPrice,
            double acquisitionPrice,
            Date acquisitionDate,
            int quantity,
            Portfolio portfolio) {
        this.id = id;
        this.type = InvestmentTypes.VARIABLE;
        this.code = code;
        this.name = name;
        this.currentPrice = currentPrice;
        this.acquisitionPrice = acquisitionPrice;
        this.acquisitionDate = acquisitionDate;
        this.quantity = quantity;
        this.portfolio = portfolio;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Stock stock)) return false;
        return Objects.equals(id, stock.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Stock{" +
                "id=" + id +
                ", type=" + type +
                ", code='" + code + '\'' +
                ", name='" + name + '\'' +
                ", currentPrice=" + currentPrice +
                ", acquisitionPrice=" + acquisitionPrice +
                ", acquisitionDate=" + acquisitionDate +
                ", quantity=" + quantity +
                ", portfolio=" + portfolio +
                '}';
    }
}
