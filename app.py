from flask import Flask, request, jsonify, render_template
app = Flask(__name__)

transactions = []

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/transactions", methods=["GET", "POST"])
def handle_transactions():
    if request.method == "POST":
        data = request.json
        transactions.append(data)
        return jsonify({"message": "Transaction added"}), 201
    return jsonify(transactions)

@app.route("/api/summary")
def get_summary():
    income = sum(t["amount"] for t in transactions if t["type"] == "income")
    expenses = sum(t["amount"] for t in transactions if t["type"] == "expense")
    return jsonify({
        "total_income": income,
        "total_expenses": expenses,
        "balance": income - expenses
    })

if __name__ == "__main__":
    app.run(debug=True)
