package com.budgetbuddy.project.entities;

import com.budgetbuddy.project.domain.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

@NoArgsConstructor
@Getter
@Setter
@ToString(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "tb_users")
public class User implements Serializable, UserDetails {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String profilePicture;

    private double monthlyIncome;

    @OneToOne(mappedBy = "user")
    private Portfolio portfolio;

    @OneToOne(mappedBy = "user")
    private Goal savingGoals;

    @OneToOne(mappedBy = "user")
    private Goal expenseGoals;

    @OneToMany(mappedBy = "user")
    private List<Account> balances = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    private List<Bill> bills = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    private List<ExpenseCategory> expenses = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER, targetClass = Role.class)
    @Enumerated(EnumType.STRING)
    @JoinTable(name = "tb_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role_name")
    private List<Role> roles = new ArrayList<>();

    public User(
            String name,
            String email,
            String password,
            String profilePicture,
            double monthlyIncome,
            List<Role> roles) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.profilePicture = profilePicture;
        this.monthlyIncome = monthlyIncome;
        this.roles = roles;
    }

    public User(Long id,
                String name,
                String email,
                String password,
                String profilePicture,
                double monthlyIncome,
                List<Role> roles) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.profilePicture = profilePicture;
        this.monthlyIncome = monthlyIncome;
        this.roles = roles;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User user)) return false;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> grantedAuthorities = new ArrayList<>();
        for(Role role : roles) grantedAuthorities.add(new SimpleGrantedAuthority(role.name()));

        return grantedAuthorities;
    }

    @Override
    public String getUsername() {
        return "";
    }

}
