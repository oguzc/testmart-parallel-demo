# Test Extension Proposals for TestMart Parallel Demo

## Current Coverage (21 tests)
- ✅ User Management: 6 tests
- ✅ Shopping Cart: 7 tests  
- ✅ Checkout Flow: 8 tests

## Proposed Extensions

### 🎯 HIGH VALUE - Parallel Testing Focus

#### 1. **Stock Concurrency Tests** (NEW FILE: `stock-management.spec.ts`)
These tests demonstrate REAL parallel execution challenges:

```typescript
✨ test('should handle last-item race condition')
   - Multiple workers try to buy the last item
   - Only one should succeed
   - Others should see "out of stock"
   - Demonstrates: Database transaction handling

✨ test('should prevent overselling with concurrent orders')
   - Product with stock=2, but 4 workers try to buy
   - Only first 2 orders succeed
   - Demonstrates: Stock reservation logic

✨ test('should update stock correctly after order')
   - Worker places order
   - Stock should decrease
   - Other workers see updated stock
   - Demonstrates: Data consistency

✨ test('should show out-of-stock products correctly')
   - Navigate to product with stock=0
   - Add-to-cart button should be disabled
   - Demonstrates: UI state management
```

**WHY:** This showcases the CORE challenge of parallel testing with shared resources

---

#### 2. **Product Discovery Tests** (NEW FILE: `product-browsing.spec.ts`)

```typescript
✨ test('should display all products on products page')
   - Navigate to /products
   - Verify all 15 products displayed
   - Check product cards have name, price, image

✨ test('should navigate to product detail page')
   - Click on a product card
   - Verify URL is /products/:id
   - Verify product details displayed

✨ test('should show correct stock status on detail page')
   - Navigate to product with stock
   - Verify stock message
   - Navigate to out-of-stock product
   - Verify "Out of Stock" message

✨ test('should filter products by search query')
   - IF search is implemented
   - Type search term
   - Verify filtered results
```

**WHY:** Covers major UI flows not yet tested

---

#### 3. **Order History Tests** (NEW FILE: `order-history.spec.ts`)

```typescript
✨ test('should display order history for user')
   - User places multiple orders
   - Navigate to orders page
   - Verify all orders shown with correct details

✨ test('should show empty state when no orders')
   - New user navigates to orders
   - Verify empty state message

✨ test('should persist orders across sessions')
   - Place order, logout, login
   - Verify order still in history

✨ test('should isolate orders between workers')
   - Worker A places order
   - Worker B should NOT see Worker A's orders
   - Demonstrates: User data isolation
```

**WHY:** Tests data persistence and user isolation

---

### 💡 MEDIUM VALUE - Error Handling & Edge Cases

#### 4. **Error Handling Tests** (NEW FILE: `error-handling.spec.ts`)

```typescript
✨ test('should handle adding invalid product to cart')
   - Try to add product with non-existent ID
   - Verify error message shown

✨ test('should handle checkout with deleted product')
   - Add product to cart
   - Admin deletes product from DB
   - Try to checkout
   - Verify graceful error handling

✨ test('should handle concurrent cart modifications')
   - Same user in 2 browser contexts
   - Both add items simultaneously
   - Verify cart syncs correctly

✨ test('should handle session expiry during checkout')
   - Start checkout
   - Expire session/logout
   - Verify redirect to login
```

**WHY:** Real-world scenarios that can break parallel tests

---

#### 5. **Cart Edge Cases** (EXTEND: `shopping-cart.spec.ts`)

```typescript
✨ test('should prevent adding more than stock quantity')
   - Product with stock=3
   - Try to add quantity=5
   - Verify capped at stock amount

✨ test('should update cart when stock becomes unavailable')
   - Add product with stock=5
   - Admin reduces stock to 2
   - Reload cart page
   - Verify quantity adjusted or removed

✨ test('should handle cart with mixed in-stock and out-of-stock items')
   - Add multiple products
   - Some go out of stock
   - Verify checkout handles it correctly
```

**WHY:** Real inventory management scenarios

---

### 🔧 LOWER VALUE - UI/UX Polish

#### 6. **Navigation & UX Tests** (NEW FILE: `navigation.spec.ts`)

```typescript
✨ test('should navigate through all main pages')
   - Home → Products → Product Detail → Cart → Checkout
   - Verify all pages load correctly

✨ test('should show loading spinners during async operations')
   - Verify spinner on login
   - Verify spinner on checkout

✨ test('should show toast notifications')
   - Add to cart → toast shown
   - Order success → toast shown

✨ test('should handle browser back button correctly')
   - Navigate through flow
   - Click back
   - Verify state preserved
```

**WHY:** User experience validation

---

## Recommended Implementation Priority

### 🥇 Phase 1: High-Impact Parallel Testing (MUST HAVE)
1. **Stock Concurrency Tests** - This is GOLD for demonstrating parallel testing challenges
2. **Order History Tests** - Shows data isolation between workers

### 🥈 Phase 2: Complete Core Flows (SHOULD HAVE)  
3. **Product Browsing Tests** - Covers untested major features
4. **Cart Edge Cases** - Real-world scenarios

### 🥉 Phase 3: Polish & Edge Cases (NICE TO HAVE)
5. **Error Handling Tests** - Production readiness
6. **Navigation Tests** - UX validation

---

## Test Architecture Considerations

### All new tests MUST follow these patterns:

✅ **Worker Isolation**
```typescript
const user = TestDataFactory.createWorkerSpecificUser(testInfo.workerIndex);
```

✅ **Unique Data Per Test**
```typescript
const productId = `PROD-00${testInfo.workerIndex + 1}`;
```

✅ **Use getByTestId()**
```typescript
await page.getByTestId('product-card').first().click();
```

✅ **No test.afterAll() in spec files**
```typescript
// Only use global teardown in playwright.config.ts
```

✅ **Assertions with timeout**
```typescript
await expect(page.getByTestId('stock-message')).toContainText('In Stock', { timeout: 5000 });
```

---

## Metrics

**Current:** 21 tests, ~40s with 4 workers  
**After Phase 1:** ~30 tests, ~50s with 4 workers  
**After Phase 2:** ~40 tests, ~60s with 4 workers  
**After Phase 3:** ~50 tests, ~75s with 4 workers  

**Coverage:**
- Current: ~60% of user flows
- After all phases: ~95% of user flows

---

## Most Valuable Single Addition

**If you only add ONE thing, add Stock Concurrency Tests.**

This perfectly demonstrates:
- ✅ Why parallel testing is hard
- ✅ Real database race conditions  
- ✅ How proper isolation solves it
- ✅ Practical business logic (inventory management)

It's the **killer demo** for parallel testing with shared databases!
