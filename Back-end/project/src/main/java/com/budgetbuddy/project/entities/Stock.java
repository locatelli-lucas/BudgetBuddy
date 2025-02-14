package com.budgetbuddy.project.entities;

import com.budgetbuddy.project.types.InvestmentTypes;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;
import java.util.Objects;

@Getter
@Setter
@Entity
@Table(name = "tb_stocks")
@NoArgsConstructor
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

    private double currentPrice;
    private double priceToEarnings;
    private double priceToBook;
    private double psr;
    private double dividendYield;
    private double priceToAssets;
    private double priceToWorkingCapital;
    private double priceToEBIT;
    private double priceToACL;
    private double evToEBIT;
    private double ebitMargin;
    private double currentLiquidity;
    private double roe;
    private double cagrEarnings5Years;
    private double cagrRevenues5Years;
    private double roa;
    private double pIToAssets;
    private double assetTurnover;
    private double grossMargin;
    private double liabilitiesToAssets;
    private double avgDailyLiquidity;

    @ManyToOne
    @JoinColumn(name = "portfolio_id")
    private Portfolio portfolio;

    public Stock(InvestmentTypes type, String code, String name, double currentPrice, double priceToEarnings, double priceToBook, double psr, double dividendYield, double priceToAssets, double priceToWorkingCapital, double priceToEBIT, double priceToACL, double evToEBIT, double ebitMargin, double currentLiquidity, double roe, double cagrEarnings5Years, double cagrRevenues5Years, double roa, double pIToAssets, double assetTurnover, double grossMargin, double liabilitiesToAssets, double avgDailyLiquidity) {
        this.type = type;
        this.code = code;
        this.name = name;
        this.currentPrice = currentPrice;
        this.priceToEarnings = priceToEarnings;
        this.priceToBook = priceToBook;
        this.psr = psr;
        this.dividendYield = dividendYield;
        this.priceToAssets = priceToAssets;
        this.priceToWorkingCapital = priceToWorkingCapital;
        this.priceToEBIT = priceToEBIT;
        this.priceToACL = priceToACL;
        this.evToEBIT = evToEBIT;
        this.ebitMargin = ebitMargin;
        this.currentLiquidity = currentLiquidity;
        this.roe = roe;
        this.cagrEarnings5Years = cagrEarnings5Years;
        this.cagrRevenues5Years = cagrRevenues5Years;
        this.roa = roa;
        this.pIToAssets = pIToAssets;
        this.assetTurnover = assetTurnover;
        this.grossMargin = grossMargin;
        this.liabilitiesToAssets = liabilitiesToAssets;
        this.avgDailyLiquidity = avgDailyLiquidity;
    }

    public Stock(Long id, InvestmentTypes type, String code, String name, double currentPrice, double priceToEarnings, double priceToBook, double psr,
                  double dividendYield, double priceToAssets, double priceToWorkingCapital, double priceToEBIT, double priceToACL, double evToEBIT, double ebitMargin, double currentLiquidity, double roe, double cagrEarnings5Years, double cagrRevenues5Years, double roa, double pIToAssets, double assetTurnover, double grossMargin, double liabilitiesToAssets, double avgDailyLiquidity) {
        this.id = id;
        this.type = type;
        this.code = code;
        this.name = name;
        this.currentPrice = currentPrice;
        this.priceToEarnings = priceToEarnings;
        this.priceToBook = priceToBook;
        this.psr = psr;
        this.dividendYield = dividendYield;
        this.priceToAssets = priceToAssets;
        this.priceToWorkingCapital = priceToWorkingCapital;
        this.priceToEBIT = priceToEBIT;
        this.priceToACL = priceToACL;
        this.evToEBIT = evToEBIT;
        this.ebitMargin = ebitMargin;
        this.currentLiquidity = currentLiquidity;
        this.roe = roe;
        this.cagrEarnings5Years = cagrEarnings5Years;
        this.cagrRevenues5Years = cagrRevenues5Years;
        this.roa = roa;
        this.pIToAssets = pIToAssets;
        this.assetTurnover = assetTurnover;
        this.grossMargin = grossMargin;
        this.liabilitiesToAssets = liabilitiesToAssets;
        this.avgDailyLiquidity = avgDailyLiquidity;
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
                ", priceToEarnings=" + priceToEarnings +
                ", priceToBook=" + priceToBook +
                ", psr=" + psr +
                ", dividendYield=" + dividendYield +
                ", priceToAssets=" + priceToAssets +
                ", priceToWorkingCapital=" + priceToWorkingCapital +
                ", priceToEBIT=" + priceToEBIT +
                ", priceToACL=" + priceToACL +
                ", evToEBIT=" + evToEBIT +
                ", ebitMargin=" + ebitMargin +
                ", currentLiquidity=" + currentLiquidity +
                ", roe=" + roe +
                ", cagrEarnings5Years=" + cagrEarnings5Years +
                ", cagrRevenues5Years=" + cagrRevenues5Years +
                ", roa=" + roa +
                ", pIToAssets=" + pIToAssets +
                ", assetTurnover=" + assetTurnover +
                ", grossMargin=" + grossMargin +
                ", liabilitiesToAssets=" + liabilitiesToAssets +
                ", avgDailyLiquidity=" + avgDailyLiquidity +
                ", portfolio=" + portfolio +
                '}';
    }
}
