package com.budgetbuddy.project.services;

import com.budgetbuddy.project.dto.direct_treasure.req.DirectTreasureDTOPatchReq;
import com.budgetbuddy.project.dto.direct_treasure.req.DirectTreasureDTOReq;
import com.budgetbuddy.project.dto.direct_treasure.res.DirectTreasureDTORes;
import com.budgetbuddy.project.entities.DirectTreasure;
import com.budgetbuddy.project.exceptions.BadRequestException;
import com.budgetbuddy.project.exceptions.EntityNotFoundException;
import com.budgetbuddy.project.repositories.DirectTreasureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class DirectTreasureService {

    @Autowired
    private DirectTreasureRepository directTreasureRepository;

    public DirectTreasureDTORes create(DirectTreasureDTOReq body) {
        if(body == null) throw new BadRequestException("Body is required");

        DirectTreasure directTreasure = this.directTreasureRepository.save(body.dtoToDirectTreasure());
        return DirectTreasureDTORes.directTreasureToDto(directTreasure);
    }

    public DirectTreasureDTORes findById(Long id) {
        if(id == null) throw new BadRequestException("Id is required");

        DirectTreasure directTreasure = findByIdEntity(id);

        return DirectTreasureDTORes.directTreasureToDto(directTreasure);
    }

    private DirectTreasure findByIdEntity(Long id) {
        if(id == null) throw new BadRequestException("Id is required");

        Optional<DirectTreasure> directTreasure = this.directTreasureRepository.findById(id);

        if(directTreasure.isEmpty()) throw new EntityNotFoundException("DirectTreasure not found");

        return directTreasure.get();
    }

    public DirectTreasureDTORes findByName(String name) {
        if(name == null) throw new BadRequestException("Name is required");

        Optional<DirectTreasure> directTreasure = this.directTreasureRepository.findByName(name);

        if(directTreasure.isEmpty()) throw new IllegalArgumentException("DirectTreasure not found");

        return DirectTreasureDTORes.directTreasureToDto(directTreasure.get());
    }

    public void deleteById(Long id) {
        if(id == null) throw new BadRequestException("Id is required");
        if(findById(id) == null) throw new IllegalArgumentException("DirectTreasure not found");

        this.directTreasureRepository.deleteById(id);
    }

    public DirectTreasureDTORes update(Long id, DirectTreasureDTOPatchReq body) {
        if(id == null) throw new BadRequestException("Id is required");
        if(body == null) throw new BadRequestException("Body is required");

        DirectTreasure directTreasure = findByIdEntity(id);

        if(!Objects.equals(body.profitability(), directTreasure.getProfitability())) directTreasure.setProfitability(body.profitability());
        if(!Objects.equals(body.minInvestment(), directTreasure.getMinInvestment())) directTreasure.setMinInvestment(body.minInvestment());
        if(!Objects.equals(body.unitPrice(), directTreasure.getUnitPrice())) directTreasure.setUnitPrice(body.unitPrice());
        if(!Objects.equals(body.amountInvested(), directTreasure.getAmountInvested())) directTreasure.setAmountInvested(body.amountInvested());

        this.directTreasureRepository.save(directTreasure);

        return DirectTreasureDTORes.directTreasureToDto(directTreasure);
    }

    public DirectTreasureDTORes put(Long id, DirectTreasureDTOReq body) {
        if(id == null) throw new BadRequestException("Id is required");
        if(body == null) throw new BadRequestException("Body is required");

        DirectTreasure directTreasure = this.directTreasureRepository.save(body.dtoToDirectTreasure(id));
        return DirectTreasureDTORes.directTreasureToDto(directTreasure);
    }
}
