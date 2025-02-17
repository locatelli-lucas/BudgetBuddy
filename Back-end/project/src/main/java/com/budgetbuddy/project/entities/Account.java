package com.budgetbuddy.project.entities;

import com.budgetbuddy.project.types.AccountTypes;
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
@ToString(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "tb_accounts")
public class Account implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String accountName;

    private AccountTypes accountType;

    private double balance;

    private String branchName;

    private String accountNumber;

    private String icon;

    @OneToMany(mappedBy = "account")
    private List<Transaction> transactionHistory = new ArrayList<>();

    public Account(User user, String accountName, AccountTypes accountType, double balance, String branchName, String accountNumber, String icon) {
        this.user = user;
        this.accountName = accountName;
        this.accountType = accountType;
        this.balance = balance;
        this.branchName = branchName;
        this.accountNumber = accountNumber;
        this.icon = icon;
    }

    public Account(Long id, User user, String accountName, AccountTypes accountType, double balance, String branchName, String accountNumber,
                   String icon) {
        this.id = id;
        this.user = user;
        this.accountName = accountName;
        this.accountType = accountType;
        this.balance = balance;
        this.branchName = branchName;
        this.accountNumber = accountNumber;
        this.icon = icon;
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
}
