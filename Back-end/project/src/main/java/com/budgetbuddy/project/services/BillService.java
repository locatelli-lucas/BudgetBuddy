package com.budgetbuddy.project.services;

import com.budgetbuddy.project.dto.bill.req.BillDTOPatchReq;
import com.budgetbuddy.project.dto.bill.req.BillDTOReq;
import com.budgetbuddy.project.dto.bill.res.BillDTORes;
import com.budgetbuddy.project.entities.Bill;
import com.budgetbuddy.project.exceptions.BadRequestException;
import com.budgetbuddy.project.exceptions.EntityNotFoundException;
import com.budgetbuddy.project.repositories.BillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class BillService {

    @Autowired
    private BillRepository billRepository;

    public BillDTORes create(BillDTOReq body) {
        if(body == null) throw new BadRequestException("Body is required");

        Bill bill = this.billRepository.save(body.dtoToBill());
        return BillDTORes.billToDto(bill);
    }

    public Page<BillDTORes> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Bill> bills = this.billRepository.findAll(pageable);
        return bills.map(BillDTORes::billToDto);
    }

    public Bill findByIdEntity(Long id) {
        if(id == null) throw new BadRequestException("Id is required");

        Optional<Bill> optional = this.billRepository.findById(id);

        if(optional.isEmpty()) throw new EntityNotFoundException("Bill not found");

        return optional.get();
    }

    public BillDTORes findById(Long id) {
        if(id == null) throw new BadRequestException("Id is required");

        Bill bill = this.findByIdEntity(id);
        return BillDTORes.billToDto(bill);
    }

    public BillDTORes update(Long id, BillDTOPatchReq body) {
        if(id == null) throw new BadRequestException("Id is required");
        if(body == null) throw new BadRequestException("Body is required");

        Bill bill = this.findByIdEntity(id);

        if(!Objects.equals(body.dueDate(), bill.getDueDate())) bill.setDueDate(body.dueDate());
        if(!Objects.equals(body.icon(), bill.getIcon())) bill.setIcon(body.icon());
        if(!Objects.equals(body.billName(), bill.getBillName())) bill.setBillName(body.billName());
        if(!Objects.equals(body.description(), bill.getDescription())) bill.setDescription(body.description());
        if(!Objects.equals(body.lastChargeDate(), bill.getLastChargeDate())) bill.setLastChargeDate(body.lastChargeDate());
        if(!Objects.equals(body.amount(), bill.getAmount())) bill.setAmount(body.amount());

        this.billRepository.save(bill);
        return BillDTORes.billToDto(bill);
    }

    public BillDTORes put(Long id, BillDTOReq body) {
        if(id == null) throw new BadRequestException("Id is required");
        if(body == null) throw new BadRequestException("Body is required");

        Bill bill = this.billRepository.save(body.dtoToBill(id));
        return BillDTORes.billToDto(bill);
    }

    public void deleteById(Long id) {
        if(id == null) throw new BadRequestException("Id is required");
        if(this.findByIdEntity(id) == null) throw new EntityNotFoundException("Bill not found");

        this.billRepository.deleteById(id);
    }
}
