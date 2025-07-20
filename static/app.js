const form = document.getElementById("transaction-form");
const tbody = document.querySelector("tbody");
const filterInput = document.getElementById("filter");

const typeSelect = document.getElementById("type");
const categorySelect = document.getElementById("category");

const CATEGORIES = {
  income: ["Salary", "Freelance", "Investment", "Business", "Other Income"],
  expense: [
    "Groceries", "Rent", "Utilities", "Transportation", "Entertainment",
    "Healthcare", "Shopping", "Dining", "Other Expense"
  ]
};

// 🌟 Submit transaction
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
  categorySelect.innerHTML = `<option value="" disabled selected>Select type first</option>`;
  categorySelect.disabled = true;
  loadTransactions();
});

// 🌈 Update category dropdown when type changes
typeSelect.addEventListener("change", () => {
  const selectedType = typeSelect.value;
  const options = CATEGORIES[selectedType];
  categorySelect.innerHTML = `<option value="" disabled selected>Select category</option>`;
  options.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
  categorySelect.disabled = false;
});

// 🔁 Filter transaction list
filterInput.addEventListener("input", loadTransactions);

// 📥 Load all transactions + update table + charts
async function loadTransactions() {
  const res = await fetch("/api/transactions");
  const data = await res.json();
  const filter = filterInput.value.toLowerCase();

  tbody.innerHTML = "";
  data.filter(t => t.category.toLowerCase().includes(filter)).forEach(t => {
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

  renderDashboard(data);
}

// 📊 Dashboard charts
let categoryChart, trendChart;

function renderDashboard(transactions) {
  const incomeData = {};
  const expenseData = {};
  const trendMap = {};

  transactions.forEach(t => {
    const store = t.type === "income" ? incomeData : expenseData;
    store[t.category] = (store[t.category] || 0) + t.amount;

    const date = new Date(t.date).toISOString().split("T")[0];
    trendMap[date] = (trendMap[date] || 0) + (t.type === "income" ? t.amount : -t.amount);
  });

  // Doughnut chart: Category-wise spending
  const ctx1 = document.getElementById("categoryChart").getContext("2d");
  if (categoryChart) categoryChart.destroy();
  categoryChart = new Chart(ctx1, {
    type: "doughnut",
    data: {
      labels: [...Object.keys(incomeData), ...Object.keys(expenseData)],
      datasets: [{
        data: [...Object.values(incomeData), ...Object.values(expenseData)],
        backgroundColor: [
          "#8bc34a", "#f44336", "#2196f3", "#ff9800", "#9c27b0",
          "#03a9f4", "#ffeb3b", "#795548", "#e91e63"
        ]
      }]
    }
  });

  // Line chart: Net balance trend
  const ctx2 = document.getElementById("trendChart").getContext("2d");
  if (trendChart) trendChart.destroy();
  trendChart = new Chart(ctx2, {
    type: "line",
    data: {
      labels: Object.keys(trendMap).sort(),
      datasets: [{
        label: "Net Balance Trend",
        data: Object.keys(trendMap).sort().map(date => trendMap[date]),
        fill: true,
        borderColor: "#6c4db2",
        backgroundColor: "rgba(108, 77, 178, 0.2)",
        tension: 0.4
      }]
    }
  });
}

// 🔀 Tab switching logic
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    button.classList.add('active');
    document.getElementById(button.dataset.tab).classList.add('active');
  });
});

// Load everything on page load
loadTransactions();
