# Database Folder

This folder contains the **shared database** used by the bad-architecture tests to demonstrate **real parallel execution conflicts**.

## 📁 Files

### `shared-db.json` (initial state committed)
- **Created by:** `tests/fixtures/shared-db.ts` during test execution
- **Purpose:** Simulates a shared database that all test workers access simultaneously
- **Contents:** JSON data with users, products, orders, and counters
- **Lifecycle:** Reset at test start, modified during test execution
- **In Git:** ✅ Committed (shows initial structure and sample data)

## 🎯 Purpose

This folder demonstrates what happens when parallel tests share a database:

```
Worker 1 ──┐
Worker 2 ──┼──→ database/shared-db.json (SHARED!)
Worker 3 ──┤
Worker 4 ──┘
```

### Real Conflicts Demonstrated:

1. **Unique Constraint Violations** - Multiple workers try to insert same email
2. **Race Conditions** - Lost updates on shared counters
3. **File Corruption** - Simultaneous writes corrupt JSON
4. **Inventory Conflicts** - Multiple workers reserve same stock

## 🔧 Usage

The shared database is automatically initialized when running bad-architecture tests:

```bash
# Run tests that demonstrate database conflicts
npx playwright test tests/examples/bad-architecture/real-db-conflicts.spec.ts --workers=4
```

**Expected Results:**
- ❌ Some tests fail with "already exists" errors
- ❌ Race conditions detected on counters
- ❌ File corruption from parallel writes
- 🎯 This proves why isolated test data is essential!

## 📊 Example Database Structure

```json
{
  "users": [
    { "email": "user@example.com", "name": "User", "createdAt": 1234567890 }
  ],
  "products": [
    { "sku": "PROD-001", "name": "Product 1", "stock": 10 }
  ],
  "orders": [
    { "orderId": "ORDER-001", "userId": "user@example.com", "total": 99.99 }
  ],
  "counters": {
    "userCount": 0,
    "orderCount": 1000,
    "cartCount": 0
  }
}
```

## ⚠️ Why This Folder Exists

In a real application, you might have:
- `database/migrations/` - Database migration scripts
- `database/seeds/` - Initial data for development
- `database/backups/` - Database backup files

For this **demo project**, we only need:
- `database/shared-db.json` - To demonstrate parallel test conflicts

## ✅ Comparison

| Approach | Storage | Conflicts? | Demo Value |
|----------|---------|------------|------------|
| **Isolated** (localStorage per worker) | Browser | ❌ No | Shows good patterns |
| **Shared** (this folder) | File system | ✅ Yes | Shows bad patterns |

See `tests/examples/bad-architecture/real-db-conflicts.spec.ts` for implementation!
