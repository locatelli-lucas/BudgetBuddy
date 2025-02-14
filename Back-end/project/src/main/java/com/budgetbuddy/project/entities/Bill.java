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
@Table(name = "tb_bills")
public class Bill implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private Date dueDate;

    private String icon;

    private String billName;

    private String description;

    private Date lastChargeDate;

    private double amount;

    public Bill() {

    }

    public Bill(User user, Date dueDate, String icon, String billName, String description, Date lastChargeDate, double amount) {
        this.user = user;
        this.dueDate = dueDate;
        this.icon = icon;
        this.billName = billName;
        this.description = description;
        this.lastChargeDate = lastChargeDate;
        this.amount = amount;
    }

    public Bill(Long id, User user, Date dueDate, String icon, String billName, String description, Date lastChargeDate, double amount) {
        this.id = id;
        this.user = user;
        this.dueDate = dueDate;
        this.icon = icon;
        this.billName = billName;
        this.description = description;
        this.lastChargeDate = lastChargeDate;
        this.amount = amount;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Bill bill)) return false;
        return Objects.equals(id, bill.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Bill{" +
                "id=" + id +
                ", user=" + user +
                ", dueDate=" + dueDate +
                ", icon='" + icon + '\'' +
                ", billName='" + billName + '\'' +
                ", description='" + description + '\'' +
                ", lastChargeDate=" + lastChargeDate +
                ", amount=" + amount +
                '}';
    }
}