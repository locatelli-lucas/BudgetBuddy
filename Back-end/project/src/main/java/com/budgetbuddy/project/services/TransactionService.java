package com.budgetbuddy.project.services;

import com.budgetbuddy.project.dto.transaction.req.TransactionDTOPatchReq;
import com.budgetbuddy.project.dto.transaction.req.TransactionDTOReq;
import com.budgetbuddy.project.dto.transaction.res.TransactionDTORes;
import com.budgetbuddy.project.entities.Transaction;
import com.budgetbuddy.project.exceptions.BadRequestException;
import com.budgetbuddy.project.exceptions.EntityNotFoundException;
import com.budgetbuddy.project.repositories.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public TransactionDTORes create(TransactionDTOReq body) {
        if(body == null) throw new BadRequestException("Request body is required");

        Transaction transaction = this.transactionRepository.save(body.dtoToTransaction());
        return TransactionDTORes.transactionToDto(transaction);
    }

    public Page<TransactionDTORes> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return this.transactionRepository.findAll(pageable).map(TransactionDTORes::transactionToDto);
    }

    public Transaction findByIdEntity(Long id) {
        if(id == null) throw new BadRequestException("Id is required");

        Optional<Transaction> optional = this.transactionRepository.findById(id);

        if(optional.isEmpty()) throw new EntityNotFoundException("Transaction not found");

        return optional.get();
    }

    public TransactionDTORes findById(Long id) {
        Transaction transaction = this.findByIdEntity(id);
        return TransactionDTORes.transactionToDto(transaction);
    }

    public TransactionDTORes update(Long id, TransactionDTOPatchReq body) {
        if(id == null) throw new BadRequestException("Id is required");
        if(body == null) throw new BadRequestException("Request body is required");

        Transaction transaction = this.findByIdEntity(id);

        if(!Objects.equals(body.account(), transaction.getAccount())) transaction.setAccount(body.account());
        if(!Objects.equals(body.date(), transaction.getDate())) transaction.setDate(body.date());
        if(!Objects.equals(body.status(), transaction.getStatus())) transaction.setStatus(body.status());
        if(!Objects.equals(body.transactionType(), transaction.getTransactionType())) transaction.setTransactionType(body.transactionType());
        if(!Objects.equals(body.amount(), transaction.getAmount())) transaction.setAmount(body.amount());
        if(!Objects.equals(body.item(), transaction.getItem())) transaction.setItem(body.item());
        if(!Objects.equals(body.icon(), transaction.getIcon())) transaction.setIcon(body.icon());
        if(!Objects.equals(body.shopName(), transaction.getShopName())) transaction.setShopName(body.shopName());

        this.transactionRepository.save(transaction);
        return TransactionDTORes.transactionToDto(transaction);
    }

    public TransactionDTORes put(Long id, TransactionDTOReq body) {
        if(id == null) throw new BadRequestException("Id is required");
        if(body == null) throw new BadRequestException("Request body is required");

        Transaction transaction = this.transactionRepository.save(body.dtoToTransaction(id));
        return TransactionDTORes.transactionToDto(transaction);
    }

    public void delete(Long id) {
        if(id == null) throw new BadRequestException("Id is required");
        this.transactionRepository.deleteById(id);
    }
}
