# BudgetBuddy — Project Plan

# Overview

BudgetBuddy is a mobile-first personal finance management application built to help users:

- track expenses and income
- manage monthly budgets
- monitor investments
- receive AI-powered financial insights
- generate financial reports
- improve financial literacy through actionable recommendations

Target platform:

- Android (Google Play Store)

Future:

- iOS

---

# Product Goals

BudgetBuddy should help users answer:

- How much money do I currently have?
- Where is my money going?
- How much can I still spend this month?
- Am I saving enough?
- Am I investing correctly?

---

# Tech Stack

## Mobile

- React Native
- Expo
- TypeScript
- NativeWind

---

## Backend

- Java 21
- Spring Boot 3
- Spring Security
- JWT Authentication
- Hibernate / JPA

---

## Database

- PostgreSQL

---

## Cache

- Redis

---

## Database migrations

- Flyway

---

## Notifications

- Firebase Cloud Messaging

---

## AI

Provider abstraction layer:

Initial provider:

- Gemini API (Google)

Used for:

- expense categorization
- financial insights
- financial assistant chat
- spending analysis

---

# APIs

## Market data

- Yahoo Finance API wrappers

---

## Currency conversion

- AwesomeAPI

---

## Financial news

- NewsAPI

---

# Core Features

# Phase 1 — MVP

## Authentication

- Register
- Login
- Logout
- Refresh token
- Password recovery
- Local biometric authentication

---

## Dashboard

- Current balance
- Monthly income
- Monthly expenses
- Savings summary
- Net worth
- Recent transactions

---

## Expense Management

- Add expense
- Edit expense
- Delete expense
- Recurring expenses
- Category assignment
- Payment method
- Notes

---

## Income Management

- Add income
- Edit income
- Delete income

Examples:

- salary
- freelance
- dividends
- gifts
- refunds

---

## Categories

Default categories:

- Housing
- Food
- Transportation
- Health
- Education
- Entertainment
- Investments
- Subscriptions
- Other

User-defined categories supported.

---

# Phase 2 — Budgets

## Monthly budget creation

Example:

- Food → R$ 1000
- Transport → R$ 500
- Leisure → R$ 300

---

## Budget alerts

Examples:

- 80% budget reached
- budget exceeded

---

## Monthly spending forecast

Example:

"At your current spending pace, you will end the month with R$ 1.200 remaining."

---

# Phase 3 — Reports

## Financial reports

Generate:

- weekly reports
- monthly reports
- yearly reports

---

## Report charts

- spending by category
- income vs expenses
- monthly trend
- budget usage
- savings evolution

---

## PDF Export

Users can export reports as PDF.

Examples:

---

### Monthly Financial Report PDF

Contains:

- user name
- selected period
- income summary
- expense summary
- net savings
- category breakdown
- charts
- comparison with previous month
- AI-generated summary
- personalized recommendations

---

Example:

---

BudgetBuddy Report — May 2026

Income:
R$ 8.000

Expenses:
R$ 5.600

Savings:
R$ 2.400

Main expense category:
Food

AI insights:
- Spending on food increased 14%
- Subscription expenses stable
- Savings rate healthy

Recommendations:
- Reduce delivery spending by R$ 200/month
- Increase emergency reserve contribution by 5%

---

Export options:

- Save locally
- Share
- Download
- Email PDF

---

# Phase 4 — AI

## Automatic expense categorization

Example:

Input:

iFood — R$ 42.50

Output:

- Category: Food
- Subcategory: Delivery

---

## Spending analysis

Examples:

- detect unusual spending spikes
- identify recurring subscriptions
- detect overspending patterns

---

## AI recommendations

Examples:

- reduce category spending
- improve savings rate
- emergency reserve recommendations
- investment allocation suggestions

---

## AI Financial Assistant Chat

User can ask:

- How much can I spend this weekend?
- How much did I spend on food this month?
- Can I afford this purchase?
- Am I saving enough?

---

# Phase 5 — Investments

Manual investment tracking:

- Stocks
- FIIs
- Fixed income
- ETFs

---

## Investment dashboard

- Invested amount
- Current value
- Profit/Loss
- Return percentage
- Dividends

---

## Simulators

Examples:

- compound interest simulation
- monthly contribution simulation
- retirement simulation

---

# Phase 6 — Notifications

Push notifications for:

- upcoming bills
- budget alerts
- unusual spending alerts
- AI recommendations
- investment price changes

---

# Phase 7 — Future Features

## OCR Receipt Scanner

Upload:

- invoice
- receipt
- PIX proof
- screenshot

Extract:

- merchant
- amount
- date

Create expense automatically.

---

## Financial Score

Example:

BudgetBuddy Score: 82/100

Based on:

- savings rate
- debt ratio
- emergency reserve
- budget adherence
- investment diversification

---

## Goals

Examples:

- emergency fund
- travel
- car
- house
- retirement

Track:

- progress
- completion forecast

---

# Monetization

## Free

- expense tracking
- income tracking
- dashboard
- budgets
- basic reports

---

## Premium

Suggested pricing:

- R$ 9.90/month
- R$ 119/year

Includes:

- AI insights
- AI chat
- PDF export
- investment simulations
- OCR receipt scanner
- advanced notifications
- unlimited history
- goal tracking

---

# Design Guidelines

Style:

- minimal
- modern
- mobile-first

---

## Colors

Primary:

#2563EB

Success:

#22C55E

Danger:

#EF4444

Warning:

#F59E0B

Background:

#0F172A

Surface:

#1E293B

Text:

#F8FAFC

---

# Development Order

1. Monorepo setup
2. Backend auth
3. Mobile auth
4. Transactions
5. Dashboard
6. Budgets
7. Reports
8. PDF generation
9. AI insights
10. Investments
11. Notifications
12. OCR
13. Premium subscription