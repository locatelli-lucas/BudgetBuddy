package com.budgetbuddy.project.services;

import com.budgetbuddy.project.dto.portfolio.req.PortfolioDTOReq;
import com.budgetbuddy.project.dto.portfolio.res.PortfolioDTORes;
import com.budgetbuddy.project.entities.Portfolio;
import com.budgetbuddy.project.exceptions.BadRequestException;
import com.budgetbuddy.project.exceptions.EntityNotFoundException;
import com.budgetbuddy.project.repositories.PortfolioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class PortfolioService {

    @Autowired
    private PortfolioRepository portfolioRepository;

    public PortfolioDTORes createPortfolio(PortfolioDTOReq body) {
        if(body == null) throw new BadRequestException("Portfolio cannot be null");

        Portfolio portfolio = this.portfolioRepository.save(body.dtoToPortfolio());
        return PortfolioDTORes.portfolioToDto(portfolio);
    }

    public PortfolioDTORes findById(Long id) {
        if(id == null) throw new BadRequestException("Id cannot be null");

        Portfolio portfolio = findByIdEntity(id);
        return PortfolioDTORes.portfolioToDto(portfolio);
    }

    public Portfolio findByIdEntity(Long id) {
        if(id == null) throw new BadRequestException("Id cannot be null");

        Optional<Portfolio> portfolio = this.portfolioRepository.findById(id);

        if(portfolio.isEmpty()) throw new EntityNotFoundException("Portfolio not found");

        return portfolio.get();
    }

    public void deleteById(Long id) {
        if(id == null) throw new BadRequestException("Id cannot be null");
        if(findByIdEntity(id) == null) throw new EntityNotFoundException("Portfolio not found");

        this.portfolioRepository.deleteById(id);
    }

    public PortfolioDTORes update(Long id, PortfolioDTOReq body) {
        if(id == null) throw new BadRequestException("Id cannot be null");
        if(body == null) throw new BadRequestException("Portfolio cannot be null");

        Portfolio portfolio = findByIdEntity(id);

        if(portfolio == null) throw new EntityNotFoundException("Portfolio not found");

        if(!Objects.equals(portfolio.getStockList(), body.stockList())) portfolio.setStockList(body.stockList());
        if(!Objects.equals(portfolio.getDirectTreasure(), body.directTreasure())) portfolio.setDirectTreasure(body.directTreasure());

        this.portfolioRepository.save(portfolio);

        return PortfolioDTORes.portfolioToDto(portfolio);
    }

    public PortfolioDTORes put(Long id, PortfolioDTOReq body) {
        if(id == null) throw new BadRequestException("Id cannot be null");
        if(body == null) throw new BadRequestException("Portfolio cannot be null");

        if(findByIdEntity(id) == null) throw new EntityNotFoundException("Portfolio not found");

        Portfolio portfolio = this.portfolioRepository.save(body.dtoToPortfolio(id));

        return PortfolioDTORes.portfolioToDto(portfolio);
    }
}
