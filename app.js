const form = document.getElementById("transaction-form");
const tbody = document.querySelector("tbody");
const filterInput = document.getElementById("filter");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    description: form.description.value,
    amount: parseFloat(form.amount.value),
    type: form.type.value,
    date: form.date.value,
    category: form.category.value
  };
  await fetch("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  form.reset();
  loadTransactions();
});

filterInput.addEventListener("input", loadTransactions);

async function loadTransactions() {
  const res = await fetch("/api/transactions");
  const data = await res.json();
  const filter = filterInput.value.toLowerCase();
  tbody.innerHTML = "";
  data.filter(t => t.category.toLowerCase().includes(filter))
      .forEach(t => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.date}</td>
      <td>${t.description}</td>
      <td>$${t.amount.toFixed(2)}</td>
      <td>${t.type}</td>
      <td>${t.category}</td>
    `;
    tbody.appendChild(row);
  });

  const summaryRes = await fetch("/api/summary");
  const summary = await summaryRes.json();
  document.getElementById("income").innerText = summary.total_income.toFixed(2);
  document.getElementById("expenses").innerText = summary.total_expenses.toFixed(2);
  document.getElementById("balance").innerText = summary.balance.toFixed(2);

  renderChart(data);
}

function renderChart(transactions) {
  const incomeData = {}, expenseData = {};
  transactions.forEach(t => {
    const store = t.type === "income" ? incomeData : expenseData;
    store[t.category] = (store[t.category] || 0) + t.amount;
  });

  const ctx = document.getElementById("chart").getContext("2d");
  if (window.myChart) window.myChart.destroy();
  window.myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [...Object.keys(incomeData), ...Object.keys(expenseData)],
      datasets: [
        {
          label: "Income",
          data: Object.values(incomeData),
          backgroundColor: "green"
        },
        {
          label: "Expense",
          data: Object.values(expenseData),
          backgroundColor: "red"
        }
      ]
    }
  });
}

loadTransactions();
