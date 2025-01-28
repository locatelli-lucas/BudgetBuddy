package com.budgetbuddy.project.entities;

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
@Table(name = "tb_direct_treasure")
public class DirectTreasure implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column
    private double profitability;

    @Column
    private double minInvestment;

    @Column
    private double unitPrice;

    @Column
    private Date dueDate;

    @Column
    private double amountInvested;

    @ManyToOne
    @JoinColumn(name = "porfolio_id")
    private Portfolio portfolio;

    public DirectTreasure() {

    }

    public DirectTreasure(Long id, String name, double profitability, double minInvestment, double unitPrice, Date dueDate, double amountInvested) {
        this.id = id;
        this.name = name;
        this.profitability = profitability;
        this.minInvestment = minInvestment;
        this.unitPrice = unitPrice;
        this.dueDate = dueDate;
        this.amountInvested = amountInvested;
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

    @Override
    public String toString() {
        return "DirectTreasure{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", profitability=" + profitability +
                ", minInvestment=" + minInvestment +
                ", unitPrice=" + unitPrice +
                ", dueDate=" + dueDate +
                ", amountInvested=" + amountInvested +
                '}';
    }
}
