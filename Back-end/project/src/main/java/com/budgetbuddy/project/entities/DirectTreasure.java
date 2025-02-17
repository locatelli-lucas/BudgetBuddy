package com.budgetbuddy.project.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
@Table(name = "tb_direct_treasure")
public class DirectTreasure implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @NotBlank
    @Column(unique = true ,nullable = false)
    private String name;

    private double profitability;
    private double minInvestment;
    private double unitPrice;
    private Date dueDate;
    private double amountInvested;

    @ManyToOne
    @JoinColumn(name = "porfolio_id")
    private Portfolio portfolio;

    public DirectTreasure(String name,
                          double profitability,
                          double minInvestment,
                          double unitPrice,
                          Date dueDate,
                          double amountInvested,
                          Portfolio portfolio
    ) {
        this.name = name;
        this.profitability = profitability;
        this.minInvestment = minInvestment;
        this.unitPrice = unitPrice;
        this.dueDate = dueDate;
        this.amountInvested = amountInvested;
        this.portfolio = portfolio;
    }

    public DirectTreasure(Long id,
                          String name,
                          double profitability,
                          double minInvestment,
                          double unitPrice,
                          Date dueDate,
                          double amountInvested,
                          Portfolio portfolio) {
        this.id = id;
        this.name = name;
        this.profitability = profitability;
        this.minInvestment = minInvestment;
        this.unitPrice = unitPrice;
        this.dueDate = dueDate;
        this.amountInvested = amountInvested;
        this.portfolio = portfolio;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DirectTreasure that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
