package com.budgetbuddy.project.services;

import com.budgetbuddy.project.dto.transaction.req.TransactionDTOReq;
import com.budgetbuddy.project.dto.transaction.res.TransactionDTORes;
import com.budgetbuddy.project.entities.Transaction;
import com.budgetbuddy.project.exceptions.BadRequestException;
import com.budgetbuddy.project.repositories.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public TransactionDTORes create(TransactionDTOReq body) {
        if(body == null) throw new BadRequestException("Request body is required");

        Transaction transaction = this.transactionRepository.save(body.dtoToTransaction());
        return TransactionDTORes.transactionToDto(transaction);
    }
}
