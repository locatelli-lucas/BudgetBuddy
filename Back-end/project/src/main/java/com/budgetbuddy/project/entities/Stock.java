package com.budgetbuddy.project.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;
import java.util.Objects;

@NoArgsConstructor
@Getter
@Setter
@ToString(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "tb_stocks")
public class Stock implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private double amountInvested;

    private double acquisitionPrice;

    private Date acquisitionDate;

    @ManyToOne
    @JoinColumn(name = "portfolio_id")
    private Portfolio portfolio;

    public Stock(String code, String name, int quantity, double amountInvested, double acquisitionPrice, Date acquisitionDate) {
        this.code = code;
        this.name = name;
        this.quantity = quantity;
        this.amountInvested = amountInvested;
        this.acquisitionPrice = acquisitionPrice;
        this.acquisitionDate = acquisitionDate;
    }

    public Stock(Long id, String code, String name, int quantity, double amountInvested, double acquisitionPrice, Date acquisitionDate) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.quantity = quantity;
        this.amountInvested = amountInvested;
        this.acquisitionPrice = acquisitionPrice;
        this.acquisitionDate = acquisitionDate;
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
}
