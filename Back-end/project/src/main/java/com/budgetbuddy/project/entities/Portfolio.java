package com.budgetbuddy.project.entities;

import com.budgetbuddy.project.types.IncomeTypes;
import jakarta.persistence.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tb_portfolio")
public class Portfolio implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "portfolio")
    private List<Stock> stockList = new ArrayList<>();

    private List<DirectTreasure> directTreasure = new ArrayList<>();
}
