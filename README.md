# BudgetBuddy
This project is a Personal Finance Management System designed to help users organize and monitor their financial life efficiently. The application combines powerful features like tracking fixed payments, managing bank accounts, categorizing expenses, generating financial reports, and offering investment suggestions using AI. Below is an overview of its key features and technologies:

Key Features:
User Registration and Authentication:

Secure sign-up and login functionality using JWT-based authentication.
Expense and Income Management:

Add, view, and manage fixed payments such as subscriptions, rent, and more.
Record income sources, such as salaries or other earnings.
Bank Account and Card Integration:

Add and manage bank cards.
Integrate with external APIs to fetch real-time transaction data.
Expense Categorization:

Organize expenses into categories (e.g., transportation, education, groceries).
Generate detailed reports filtered by week, month, or year.
Investment Tracking and Simulation:

Monitor investments in stocks, fixed income, and other assets.
Simulate potential returns based on different investment options.
Integration with the B3 (Brazilian Stock Exchange) API to retrieve up-to-date financial data.
AI-Based Financial Suggestions:

Use artificial intelligence to analyze user profiles and financial habits.
Provide tailored investment suggestions with a checklist for user evaluation.
News Feed and Market Data:

Display a financial news feed and daily updates on the Ibovespa index.
Progressive Web App (PWA):

Fully installable and accessible offline.
Optimized performance and caching using Service Workers.
Push Notifications:

Send real-time notifications to mobile devices using Firebase Cloud Messaging (FCM).
Notify users of payment due dates, investment opportunities, and more.
Technology Stack:
Back-end: Spring Boot (Java)

RESTful API architecture.
Database: PostgreSQL/MySQL with Flyway for migrations.
Security: Spring Security with JWT.
Front-end: React.js

Responsive and modern UI using Material-UI/TailwindCSS.
PWA support with Service Workers and caching strategies.
State management with Redux/Context API.
AI Integration:

Investment analysis using TensorFlow.js or other AI libraries.
APIs and Integrations:

Bank integration for transaction data.
B3 API for stock market data.
Notifications:

Push notifications with Firebase Cloud Messaging.
Deployment:
Dockerized application for easy deployment.
Hosted on AWS, Heroku, or Azure with CI/CD pipelines.
This system is built to empower users by offering a comprehensive overview of their financial status, helping them make informed decisions, and improving financial literacy. Contributions and feedback are welcome to make this project even better! 
