package com.budgetbuddy.project.entities;

import com.budgetbuddy.project.types.AccountTypes;
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
@Table(name = "tb_accounts")
public class Account implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String accountName;

    private AccountTypes accountType;

    private double balance;

    private String branchName;

    private String accountNumber;

    private String logo;

    @OneToMany(mappedBy = "account")
    private List<Transaction> transactionHistory = new ArrayList<>();

    public Account() {

    }

    public Account(String accountName, AccountTypes accountType, double balance, String branchName, String accountNumber, String logo) {
        this.accountName = accountName;
        this.accountType = accountType;
        this.balance = balance;
        this.branchName = branchName;
        this.accountNumber = accountNumber;
        this.logo = logo;
    }

    public Account(Long id, String accountName, AccountTypes accountType, double balance, String branchName, String accountNumber, String logo) {
        this.id = id;
        this.accountName = accountName;
        this.accountType = accountType;
        this.balance = balance;
        this.branchName = branchName;
        this.accountNumber = accountNumber;
        this.logo = logo;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Account account)) return false;
        return Objects.equals(id, account.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Account{" +
                "id=" + id +
                ", accountName='" + accountName + '\'' +
                ", accountType=" + accountType +
                ", balance=" + balance +
                ", branchName='" + branchName + '\'' +
                ", accountNumber='" + accountNumber + '\'' +
                ", logo='" + logo + '\'' +
                ", transactionHistory=" + transactionHistory +
                '}';
    }
}
