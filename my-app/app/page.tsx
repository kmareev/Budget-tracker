"use client"

import { useState, useMemo } from "react"
import { TransactionForm } from "@/components/transaction-form"
import { BalanceSummary } from "@/components/balance-summary"
import { TransactionList } from "@/components/transaction-list"
import { Dashboard } from "@/components/dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  date: string
}

const CATEGORIES = {
  income: ["Salary", "Freelance", "Investment", "Business", "Other Income"],
  expense: [
    "Groceries",
    "Rent",
    "Utilities",
    "Transportation",
    "Entertainment",
    "Healthcare",
    "Shopping",
    "Dining",
    "Other Expense",
  ],
}

export default function BudgetTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "income",
      amount: 5000,
      category: "Salary",
      description: "Monthly salary",
      date: "2024-01-01",
    },
    {
      id: "2",
      type: "expense",
      amount: 1200,
      category: "Rent",
      description: "Monthly rent payment",
      date: "2024-01-02",
    },
    {
      id: "3",
      type: "expense",
      amount: 300,
      category: "Groceries",
      description: "Weekly grocery shopping",
      date: "2024-01-03",
    },
    {
      id: "4",
      type: "income",
      amount: 800,
      category: "Freelance",
      description: "Web development project",
      date: "2024-01-05",
    },
    {
      id: "5",
      type: "expense",
      amount: 150,
      category: "Utilities",
      description: "Electricity bill",
      date: "2024-01-06",
    },
  ])

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    }
    setTransactions((prev) => [newTransaction, ...prev])
  }

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const expenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
    }
  }, [transactions])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Budget Tracker</h1>
          <p className="text-muted-foreground text-lg">Take control of your finances with smart budgeting</p>
        </div>

        <BalanceSummary totalIncome={totalIncome} totalExpenses={totalExpenses} balance={balance} />

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionForm onAddTransaction={addTransaction} categories={CATEGORIES} />

            <TransactionList transactions={transactions} onDeleteTransaction={deleteTransaction} />
          </TabsContent>

          <TabsContent value="dashboard">
            <Dashboard transactions={transactions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
