package com.budgetbuddy.project.entities;

import com.budgetbuddy.project.types.StatusTypes;
import com.budgetbuddy.project.types.TransactionTypes;
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
@Table(name = "tb_transactions")
public class Transaction implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;

    private Date date;

    private StatusTypes status;

    private TransactionTypes transactionType;

    private String receipt;

    private double amount;

    private String item;

    private String icon;

    private String shopName;

    public Transaction(Account account,
                       Date date,
                       StatusTypes status,
                       TransactionTypes transactionType,
                       String receipt,
                       double amount,
                       String item,
                       String icon,
                       String shopName) {
        this.account = account;
        this.date = date;
        this.status = status;
        this.transactionType = transactionType;
        this.receipt = receipt;
        this.amount = amount;
        this.item = item;
        this.icon = icon;
        this.shopName = shopName;
    }

    public Transaction(Long id,
                       Account account,
                       Date date,
                       StatusTypes status,
                       TransactionTypes transactionType,
                       String receipt,
                       double amount,
                       String item,
                       String icon,
                       String shopName) {
        this.id = id;
        this.account = account;
        this.date = date;
        this.status = status;
        this.transactionType = transactionType;
        this.receipt = receipt;
        this.amount = amount;
        this.item = item;
        this.icon = icon;
        this.shopName = shopName;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Transaction that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
