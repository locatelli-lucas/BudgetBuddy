package com.budgetbuddy.project.services;

import com.budgetbuddy.project.dto.account.req.AccountDTOReq;
import com.budgetbuddy.project.dto.account.res.AccountDTORes;
import com.budgetbuddy.project.entities.Account;
import com.budgetbuddy.project.exceptions.BadRequestException;
import com.budgetbuddy.project.exceptions.EntityNotFoundException;
import com.budgetbuddy.project.repositories.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    public AccountDTORes create(AccountDTOReq body) {
        if(body == null) throw new BadRequestException("Invalid request body");

        Account account = this.accountRepository.save(body.dtoToAccount());
        return AccountDTORes.accountToDto(account);
    }

    public Page<AccountDTORes> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return this.accountRepository.findAll(pageable).map(AccountDTORes::accountToDto);
    }

    public Account findByIdEntity(Long id) {
        if(id == null) throw new BadRequestException("Id is required");

        Optional<Account> optional = this.accountRepository.findById(id);

        if(optional.isEmpty()) throw new EntityNotFoundException("Account not found");

        return optional.get();
    }

    public AccountDTORes findById(Long id) {
        Account account = this.findByIdEntity(id);
        return AccountDTORes.accountToDto(account);
    }

    public AccountDTORes update(Long id, AccountDTOReq body) {
        if(id == null) throw new BadRequestException("Id is required");
        if(body == null) throw new BadRequestException("Invalid request body");

        Account account = this.findByIdEntity(id);

        if(!Objects.equals(body.accountName(), account.getAccountName())) account.setAccountName(body.accountName());
        if(!Objects.equals(body.accountType(), account.getAccountType())) account.setAccountType(body.accountType());
        if(!Objects.equals(body.balance(), account.getBalance())) account.setBalance(body.balance());
        if(!Objects.equals(body.branchName(), account.getBranchName())) account.setBranchName(body.branchName());
        if(!Objects.equals(body.accountNumber(), account.getAccountNumber())) account.setAccountNumber(body.accountNumber());
        if(!Objects.equals(body.icon(), account.getIcon())) account.setIcon(body.icon());

        this.accountRepository.save(account);
        return AccountDTORes.accountToDto(account);
    }

    public AccountDTORes replace(Long id, AccountDTOReq body) {
        if(id == null) throw new BadRequestException("Id is required");
        if(body == null) throw new BadRequestException("Invalid request body");
        if(this.findByIdEntity(id) == null) throw new EntityNotFoundException("Account not found");

        Account account = this.accountRepository.save(body.dtoToAccount());
        return AccountDTORes.accountToDto(account);
    }

    public void deleteById(Long id) {
        if(id == null) throw new BadRequestException("Id is required");
        if(this.findByIdEntity(id) == null) throw new EntityNotFoundException("Account not found");

        this.accountRepository.deleteById(id);
    }
}
