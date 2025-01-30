package com.budgetbuddy.project.services;

import com.budgetbuddy.project.dto.stock.req.StockDTOReq;
import com.budgetbuddy.project.dto.stock.res.StockDTORes;
import com.budgetbuddy.project.entities.Stock;
import com.budgetbuddy.project.exceptions.EntityNotFoundException;
import com.budgetbuddy.project.repositories.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class StockService {

    @Autowired
    private StockRepository stockRepository;

    public StockDTORes create(StockDTOReq body) {
        if(body == null) throw new IllegalArgumentException("Stock cannot be null");

        Stock stock = this.stockRepository.save(body.dtoToStock());
        return  StockDTORes.stockToDTO(stock);
    }

    public StockDTORes findById(Long id) {
        if(id == null) throw new IllegalArgumentException("Id cannot be null");

        return StockDTORes.stockToDTO(this.findByIdEntity(id));
    }

    public Stock findByIdEntity(Long id) {
        if(id == null) throw new IllegalArgumentException("Id cannot be null");

        Optional<Stock> stock = this.stockRepository.findById(id);

        if(stock.isEmpty()) throw new EntityNotFoundException("Stock not found");

        return stock.get();
    }
}
