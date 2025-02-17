package com.budgetbuddy.project.services;

import com.budgetbuddy.project.dto.stock.req.StockDTOPatchReq;
import com.budgetbuddy.project.dto.stock.req.StockDTOReq;
import com.budgetbuddy.project.dto.stock.res.StockDTORes;
import com.budgetbuddy.project.entities.Stock;
import com.budgetbuddy.project.exceptions.BadRequestException;
import com.budgetbuddy.project.exceptions.EntityNotFoundException;
import com.budgetbuddy.project.repositories.StockRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class StockService {

    @Autowired
    private StockRepository stockRepository;

    public StockDTORes create(StockDTOReq body) {
        if(body == null) throw new BadRequestException("Stock cannot be null");

        Stock stock = this.stockRepository.save(body.dtoToStock());
        return  StockDTORes.stockToDTO(stock);
    }

    public StockDTORes findById(Long id) {
        if(id == null) throw new BadRequestException("Id cannot be null");

        return StockDTORes.stockToDTO(this.findByIdEntity(id));
    }

    public Stock findByIdEntity(Long id) {
        if(id == null) throw new BadRequestException("Id cannot be null");

        Optional<Stock> stock = this.stockRepository.findById(id);

        if(stock.isEmpty()) throw new EntityNotFoundException("Stock not found");

        return stock.get();
    }

    public StockDTORes findByCode(String code) {
        if(code == null) throw new BadRequestException("Code cannot be null");
        if(code.isBlank()) throw new BadRequestException("Code cannot be blank");

        Optional<Stock> stock = this.stockRepository.findByCode(code);

        if(stock.isEmpty()) throw new EntityNotFoundException("Stock not found");

        return StockDTORes.stockToDTO(stock.get());
    }

    public StockDTORes update(Long id, @Valid StockDTOPatchReq body) {
        if(id == null) throw new BadRequestException("Id cannot be null");
        if(body == null) throw new BadRequestException("Stock cannot be null");

        Stock stock = findByIdEntity(id);

        if(!Objects.equals(stock.getQuantity(), body.quantity())) stock.setQuantity(body.quantity());
        if(!Objects.equals(stock.getAmountInvested(), body.amountInvested())) stock.setAmountInvested(body.amountInvested());
        if(!Objects.equals(stock.getAcquisitionPrice(), body.acquisitionPrice())) stock.setAcquisitionPrice(body.acquisitionPrice());
        if(!Objects.equals(stock.getAcquisitionDate(), body.acquisitionDate())) stock.setAcquisitionDate(body.acquisitionDate());

        this.stockRepository.save(stock);

        return StockDTORes.stockToDTO(stock);
    }

    public StockDTORes put(Long id, @Valid StockDTOReq body) {
        if(id == null) throw new BadRequestException("Id cannot be null");
        if(body == null) throw new BadRequestException("Stock cannot be null");

        if(findByIdEntity(id) == null) throw new EntityNotFoundException("Stock not found");

        Stock stock = this.stockRepository.save(body.dtoToStock(id));

        return StockDTORes.stockToDTO(stock);
    }

    public void deleteById(Long id) {
        if(id == null) throw new BadRequestException("Id cannot be null");
        if(findByIdEntity(id) == null) throw new EntityNotFoundException("Stock not found");

        this.stockRepository.deleteById(id);
    }

}
