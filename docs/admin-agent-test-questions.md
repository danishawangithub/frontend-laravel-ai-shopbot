# AI Admin Agent Test Questions

This checklist is used to test the AI Admin Agent after changes. Each question should correctly route through Groq NLP, call the expected Laravel API tool, and return a useful admin answer.

**How to read the tables:** Ask the question in the admin chatbot, verify the terminal debug output (`originalMessage`, `nlp`, `endpoint`), then mark **Status** when the intent, endpoint/flow, and reply all look correct.

---

## 1. Orders

| # | Question | Expected intent | Expected endpoint or flow | Status |
|---|----------|-----------------|---------------------------|--------|
| 1 | How many orders today? | `orders_count_period` | `/agent/orders/count?period=today` | [ ] |
| 2 | How many orders last month? | `orders_count_period` | `/agent/orders/count?period=last_month` | [ ] |
| 3 | Show pending orders | `pending_orders` | `/agent/orders/pending` | [ ] |
| 4 | Show order 1 | `order_detail` | `/agent/orders/1` | [ ] |

---

## 2. Sales

| # | Question | Expected intent | Expected endpoint or flow | Status |
|---|----------|-----------------|---------------------------|--------|
| 5 | Show today sales | `today_sales` | `/agent/sales/today` | [ ] |
| 6 | Show last month sales | `sales_period` | `/agent/sales/period?period=last_month` | [ ] |
| 7 | Last month kitni sale hui? | `sales_period` | `/agent/sales/period?period=last_month` | [ ] |

---

## 3. Customers

| # | Question | Expected intent | Expected endpoint or flow | Status |
|---|----------|-----------------|---------------------------|--------|
| 8 | Find customer Noor | `customer_search` | `/agent/customers/search?query=Noor` | [ ] |
| 9 | Noor how many orders? | `customer_order_lookup` | 1. `/agent/customers/search?query=Noor`<br>2. If one customer found: `/agent/customers/{id}/orders`<br>3. If multiple customers found: show list and ask admin to choose ID | [ ] |
| 10 | Show customer 1 orders | `customer_orders` | `/agent/customers/1/orders` | [ ] |

---

## 4. Customer Analytics

| # | Question | Expected intent | Expected endpoint or flow | Status |
|---|----------|-----------------|---------------------------|--------|
| 11 | Top customer | `top_spending_customers` | `/agent/customers/top-spending` | [ ] |
| 12 | Sabse zyada paisay kis customer ne kharch kiye? | `top_spending_customers` | `/agent/customers/top-spending` | [ ] |
| 13 | Show repeated customers | `repeated_customers` | `/agent/customers/repeated` | [ ] |
| 14 | Show sale count of each customer | `customer_sales_count` | `/agent/customers/sales-count` | [ ] |

---

## 5. Stock

| # | Question | Expected intent | Expected endpoint or flow | Status |
|---|----------|-----------------|---------------------------|--------|
| 15 | Show low stock products | `low_stock_products` | `/agent/products/low-stock` | [ ] |
| 16 | Stock khatam hone wali products dikhao | `low_stock_products` | `/agent/products/low-stock` | [ ] |

---

## 6. Product Intelligence

| # | Question | Expected intent | Expected endpoint or flow | Status |
|---|----------|-----------------|---------------------------|--------|
| 21 | Product search by Festive 3-Piece Lawn | `product_search` | `/agent/products/search?query=Festive%203-Piece%20Lawn` | [ ] |
| 22 | Find product Festive 3-Piece Lawn | `product_search` | `/agent/products/search?query=Festive%203-Piece%20Lawn` | [ ] |
| 23 | Search product lawn | `product_search` | `/agent/products/search?query=lawn` | [ ] |
| 24 | Show product 1 | `product_detail` | `/agent/products/1` | [ ] |
| 25 | Show best selling products this month | `product_sales_report` | `/agent/products/sales?period=month` | [ ] |
| 26 | Which products sold most last month? | `product_sales_report` | `/agent/products/sales?period=last_month` | [ ] |

**Regression guard (must not misroute):**

| # | Question | Expected intent | Must NOT be | Status |
|---|----------|-----------------|-------------|--------|
| 27 | Top customer | `top_spending_customers` | `product_sales_report` | [ ] |
| 28 | Find customer Noor | `customer_search` | `product_search` | [ ] |

---

## 7. Business Intelligence Reports

| # | Question | Expected intent | Expected endpoint or flow | Status |
|---|----------|-----------------|---------------------------|--------|
| 29 | Which city has most orders this month? | `orders_by_city_report` | `/agent/reports/orders-by-city?period=month` | [ ] |
| 30 | Show order status summary this month | `order_status_summary` | `/agent/reports/order-status-summary?period=month` | [ ] |
| 31 | Show payment method summary this month | `payment_method_summary` | `/agent/reports/payment-method-summary?period=month` | [ ] |
| 32 | What is average order value this month? | `average_order_value` | `/agent/reports/average-order-value?period=month` | [ ] |
| 33 | Compare this week and last week sales | `sales_comparison` | `/agent/reports/sales-comparison?current=week&previous=last_week` | [ ] |
| 34 | Which products are not selling this month? | `products_not_selling` | `/agent/reports/products-not-selling?period=month` | [ ] |
| 35 | Which products need restock urgently? | `low_stock_high_sales` | `/agent/reports/low-stock-high-sales?period=month` | [ ] |
| 36 | kaun se products nahi bik rahe? | `products_not_selling` | `/agent/reports/products-not-selling?period=month` | [ ] |
| 37 | kis city se zyada orders hain? | `orders_by_city_report` | `/agent/reports/orders-by-city?period=month` | [ ] |

**Regression guard (must not misroute):**

| # | Question | Expected intent | Must NOT be | Status |
|---|----------|-----------------|-------------|--------|
| 38 | Top customer | `top_spending_customers` | `orders_by_city_report` | [ ] |
| 39 | Top product | `product_sales_report` | `products_not_selling` | [ ] |
| 40 | Show low stock products | `low_stock_products` | `low_stock_high_sales` | [ ] |
| 41 | Which products need restock urgently? | `low_stock_high_sales` | `low_stock_products` | [ ] |

---

## 8. Store Summary

| # | Question | Expected intent | Expected endpoint or flow | Status |
|---|----------|-----------------|---------------------------|--------|
| 17 | Give me today store summary | `today_summary` | Parallel calls:<br>• `/agent/sales/today`<br>• `/agent/orders/today`<br>• `/agent/orders/pending`<br>• `/agent/products/low-stock`<br>• `/agent/customers/latest` | [ ] |

---

## 9. Roman Urdu / Typo Tests

| # | Question | Expected intent | Expected endpoint or flow | Status |
|---|----------|-----------------|---------------------------|--------|
| 18 | noor how meny oders | `customer_order_lookup` | 1. `/agent/customers/search?query=noor`<br>2. Then `/agent/customers/{id}/orders` if one customer found | [ ] |
| 19 | salse last month | `sales_period` | `/agent/sales/period?period=last_month` | [ ] |
| 20 | stok near end products | `low_stock_products` | `/agent/products/low-stock` | [ ] |

---

## 10. Debug Checklist

Run this while testing each question (development mode, terminal where `npm run dev` is running):

- [ ] Check terminal running `npm run dev`
- [ ] Confirm `originalMessage` is correct
- [ ] Confirm Groq NLP `intent` is correct
- [ ] Confirm `entities` are correct
- [ ] Confirm Laravel `endpoint` is correct
- [ ] Confirm Laravel API returns success
- [ ] Confirm final chatbot answer uses real API data
- [ ] Confirm no secret keys are logged

**Expected debug shape (development only):**

```json
{
  "originalMessage": "...",
  "nlp": {
    "intent": "...",
    "confidence": 0.9,
    "entities": { ... }
  },
  "endpoint": "..."
}
```

---

## 11. Environment Checklist

Complete before starting a regression run:

- [ ] `LARAVEL_API_URL` is set
- [ ] `LARAVEL_API_TOKEN` or admin bearer token is available
- [ ] `AI_PROVIDER=groq`
- [ ] `GROQ_API_KEY` is set
- [ ] `GROQ_MODEL` is set
- [ ] `USE_MOCK_AI` is set according to test mode
- [ ] Next.js server restarted after env changes
- [ ] Laravel server is running
- [ ] Admin Sanctum token is valid

**Example `.env.local` (server-only keys):**

```env
LARAVEL_API_URL=http://localhost:8000/api
LARAVEL_API_TOKEN=

AI_PROVIDER=groq
USE_MOCK_AI=false
GROQ_API_KEY=your_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

---

## How to use this file

1. Open the AI Admin Agent page (`/admin/ai-agent`).
2. Complete the **Environment Checklist** above.
3. Ask each question one by one (sections 1–9).
4. Check terminal debug output for each question.
5. Mark the **Status** checkbox when passed.
6. If any question fails, record:

   | Field | What to write |
   |-------|----------------|
   | Question | The exact text you typed |
   | Expected intent | From this doc |
   | Actual intent | From terminal `nlp.intent` |
   | Expected endpoint | From this doc |
   | Actual endpoint | From terminal `endpoint` |
   | Actual answer | Copy from chatbot |
   | Error message | From chat or terminal, if any |

**Pass criteria:** Groq intent matches, Laravel endpoint/flow matches, and the reply reflects real API data (not invented numbers).

---

## Quick reference: intent → Laravel tool

| Intent | Laravel tool |
|--------|----------------|
| `order_detail` | `GET /agent/orders/{orderId}` |
| `customer_search` | `GET /agent/customers/search?query=` |
| `customer_order_lookup` | Search → then `GET /agent/customers/{id}/orders` |
| `customer_orders` | `GET /agent/customers/{customerId}/orders` |
| `orders_count_period` | `GET /agent/orders/count?period=` |
| `sales_period` | `GET /agent/sales/period?period=` |
| `today_sales` | `GET /agent/sales/today` |
| `pending_orders` | `GET /agent/orders/pending` |
| `low_stock_products` | `GET /agent/products/low-stock` |
| `product_search` | `GET /agent/products/search?query=` |
| `product_detail` | `GET /agent/products/{productId}` |
| `product_sales_report` | `GET /agent/products/sales?period=` |
| `orders_by_city_report` | `GET /agent/reports/orders-by-city?period=` |
| `order_status_summary` | `GET /agent/reports/order-status-summary?period=` |
| `payment_method_summary` | `GET /agent/reports/payment-method-summary?period=` |
| `average_order_value` | `GET /agent/reports/average-order-value?period=` |
| `sales_comparison` | `GET /agent/reports/sales-comparison?current=&previous=` |
| `products_not_selling` | `GET /agent/reports/products-not-selling?period=` |
| `low_stock_high_sales` | `GET /agent/reports/low-stock-high-sales?period=` |
| `top_spending_customers` | `GET /agent/customers/top-spending` |
| `repeated_customers` | `GET /agent/customers/repeated` |
| `customer_sales_count` | `GET /agent/customers/sales-count` |
| `today_summary` | 5 parallel GETs (see test #17) |
