# **App Name**: KhaataBook Lite

## Core Features:

- Customer Management: Create, read, update, and delete customer profiles including customer ID, name, phone, address, credit limit, and default credit days.
- Transaction Recording: Record sales and payments for each customer, including date, amount, description, and credit days. Calculates due dates and running balances.
- Dashboard Overview: Display total outstanding balance, a list of customers with outstanding balances, and overdue transaction alerts.
- Transaction History: View a detailed ledger of transactions for each customer, including date, description, debit/credit, balance after, and due date. Support date range and status filters.
- Search & Filtering: Enable fast local search for customers and transactions using FTS. Allow filtering customers by status (All, Overdue, Limit Exceeded) and transactions by date range.
- CSV/JSON Export: Allow exporting customer and transaction data in CSV or JSON format.
- Smart Description: Use an AI tool to provide suggested descriptions for transactions based on entered information.

## Style Guidelines:

- Primary color: Soft blue (#A0C4FF) to evoke a sense of calm and trust in financial tracking.
- Background color: Very light blue (#F0F8FF). It offers a gentle, unobtrusive backdrop that enhances readability and minimizes eye strain.
- Accent color: Muted orange (#FFB347) to draw attention to key actions like 'Add Transaction' or overdue notices.
- Font: 'PT Sans', a humanist sans-serif suitable for both headlines and body text, ensuring readability and a modern aesthetic.
- Use minimalist icons to represent transaction types (sale, payment) and customer status (overdue, limit exceeded).
- Mobile-first design with clear content hierarchy, adequate touch targets, and bottom navigation for key screens.
- Subtle animations for balance updates, transaction additions/deletions, and loading states to provide a smooth user experience.