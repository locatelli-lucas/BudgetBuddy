package com.budgetbuddy.project.entities;

import com.budgetbuddy.project.types.IncomeTypes;
import jakarta.persistence.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;
import java.util.Objects;

@Entity
@Table(name = "tb_stocks")
public class Stock implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private IncomeTypes type;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private double currentPrice;

    @Column
    private double acquisitionPrice;

    @Column
    private Date acquisitionDate;

    @Column
    private int quantity;

    @ManyToOne
    @JoinColumn(name = "portfolio_id")
    private Portfolio portfolio;

    public Stock() {

    }

    public Stock(Long id,
                 IncomeTypes type,
                 String code,
                 String name,
                 double currentPrice,
                 double acquisitionPrice,
                 Date acquisitionDate,
                 int quantity,
                 Portfolio portfolio) {
        this.id = id;
        this.type = type;
        this.code = code;
        this.name = name;
        this.currentPrice = currentPrice;
        this.acquisitionPrice = acquisitionPrice;
        this.acquisitionDate = acquisitionDate;
        this.quantity = quantity;
        this.portfolio = portfolio;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public IncomeTypes getType() {
        return type;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(double currentPrice) {
        this.currentPrice = currentPrice;
    }

    public double getAcquisitionPrice() {
        return acquisitionPrice;
    }

    public void setAcquisitionPrice(double acquisitionPrice) {
        this.acquisitionPrice = acquisitionPrice;
    }

    public Date getAcquisitionDate() {
        return acquisitionDate;
    }

    public void setAcquisitionDate(Date acquisitionDate) {
        this.acquisitionDate = acquisitionDate;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public Portfolio getPortfolio() {
        return portfolio;
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
