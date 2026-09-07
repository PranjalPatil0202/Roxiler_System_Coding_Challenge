# Comprehensive QA Pass Report: Store Rating Platform

**Platform Scope**: Backend API (Node.js/Express + PostgreSQL/Sequelize), Frontend Application (React 18 + Vite), and Cross-Cutting Workflows  
**Verification Date**: September 7, 2026  
**Auditor**: Antigravity Autonomous QA System  
**Test Suite Status**: 27/27 Tests Passing (`npm test` against PostgreSQL)  
**Production Build Status**: Vite build completed successfully with 0 errors (1 bundle chunk warning)

---

## Executive Summary

A comprehensive quality assurance inspection was executed across the backend routes, database interactions, role-based access controls, React frontend architecture, visual design system, dark mode contrast, and responsive layout behavior.

The core architecture (PostgreSQL integration, password hashing, JWT role authorization, rate limiting, and basic CRUD) is robust and passes all automated unit/integration tests. However, several **Critical and Major functional gaps, mock operations, data discrepancies, and contrast flaws** were identified that affect real-world usability and data integrity.

---

## Issue Prioritization Breakdown

| Severity | Count | Summary |
| :--- | :---: | :--- |
| **Critical** | 1 | Browser CDP connection deadlock / thread-freeze under specific conditions |
| **Major** | 7 | Ghost bulk actions (client-only), broken global search query, unfiltered CSV export, missing Admin review chart data, fabricated rating distributions, missing mobile navigation toggle, white-on-white text in dark mode signup |
| **Minor** | 4 | Monolithic bundle size (>1,050 kB), inaccurate store validator error message, double Store.findAll query in store-owner stats, missing top-level submission debounce guard in RatingModal |
| **Suggestion** | 4 | Orphaned/dead code removal, Promise.all parallelization in dashboard stats, database-backed review audit feed for admin, new store handling in governance widget |

---

## Detailed Findings & Defect Catalog

### 1. Critical Issues

#### CRIT-01: Browser Renderer Process Hang & CDP Connection Timeout
* **What's Broken**: When attempting Chrome DevTools Protocol (CDP) session attachments or rapid navigations across certain routes (`/admin/users`), the Chromium renderer process experiences a thread hang / 30-second timeout (`failed to connect to browser via CDP even though the CDP port is responsive: http://127.0.0.1:9222: playwright: timeout: Timeout 30000ms exceeded`).
* **Where**: Client navigation & lifecycle rendering (`client/src/pages/admin/AdminUsers.jsx`, `client/src/context/AuthContext.jsx`).
* **Root Cause**: An unhandled re-render trigger or state synchronization cycle occurs when `AdminUsers.jsx` synchronizes URL `searchParams` with filter state and `fetchUsers` callback dependencies (`pagination.limit`, `filters`, `sortBy`, `sortOrder`).
* **How to Fix**:
  1. Decouple URL search param sync so that `fetchUsers` does not trigger redundant state changes while a fetch is already in flight.
  2. Implement an `AbortController` in `adminService.getUsers` to cancel stale in-flight requests on rapid filter/page changes.

---

### 2. Major Issues

#### MAJ-01: Bulk Role Change & Bulk Delete in Admin Directory are Client-State Mocks (Ghost Operations)
* **What's Broken**: In `AdminUsers.jsx`, selecting multiple users and clicking "Change Role" or "Delete" only updates the local React state (`setUsers`) and displays a success toast. **No backend API request is sent.** All changes immediately revert upon page reload.
* **Where**: `client/src/pages/admin/AdminUsers.jsx` (`handleBulkRoleChange` lines 162–168, `handleBulkDelete` lines 171–177).
* **Root Cause**: The frontend handlers manipulate `setUsers` in memory without invoking backend endpoints:
  ```javascript
  // Current implementation in AdminUsers.jsx:
  const handleBulkRoleChange = async (targetRole, affectedUsers) => {
    setUsers((prev) => prev.map((u) => ...)); // Never calls backend!
    addToast(`Successfully updated ${affectedUsers.length} user role(s)...`, 'success');
  };
  ```
* **How to Fix**:
  1. Add a bulk role update endpoint on backend: `PATCH /api/admin/users/bulk-role` accepting `{ userIds: number[], role: string }`.
  2. Add a bulk delete endpoint on backend: `POST /api/admin/users/bulk-delete` or loop `adminService.deleteUser(id)` sequentially/via `Promise.allSettled`.
  3. Re-fetch user list after confirmation to reflect database truth.

#### MAJ-02: Bulk Delete in Admin Stores Directory is Client-State Mock
* **What's Broken**: In `AdminStores.jsx`, selecting stores and clicking "Delete" performs `setStores((prev) => prev.filter(...))` without calling `adminService.deleteStore(id)` or any backend endpoint. Deleted stores reappear on refresh.
* **Where**: `client/src/pages/admin/AdminStores.jsx` (`handleBulkDelete` lines 136–142).
* **How to Fix**:
  1. Call `adminService.deleteStore(storeId)` for each selected store (or implement a backend bulk endpoint `DELETE /api/admin/stores/bulk`).
  2. Refresh store list from API upon completion.

#### MAJ-03: Admin Global Search Ignores Query Parameter (Always Returns Same First 5 Records)
* **What's Broken**: Typing any search term into the Admin Global Search bar (e.g. "Electronics" or "user1") passes `{ search: query.trim(), limit: 5 }` to `adminService.getUsers` and `adminService.getStores`. However, the backend endpoints (`GET /api/admin/users` and `GET /api/admin/stores`) **do not accept a `search` query parameter**; they only accept `name`, `email`, and `address`. As a result, the backend returns the first 5 records in the database regardless of what was searched.
* **Where**:
  - `client/src/components/admin/AdminGlobalSearch.jsx` (lines 53–55)
  - `src/controllers/admin.controller.js` (`listUsers` lines 143–161, `listStores` lines 228–243)
  - `src/validators/admin.validator.js` (`listUsersValidator`, `listStoresValidator`)
* **How to Fix**:
  1. In `src/validators/admin.validator.js`, add `query('search').optional().isString().trim()` to both validators.
  2. In `src/controllers/admin.controller.js`:
     ```javascript
     if (search) {
       where[Op.or] = [
         { name: { [likeOp]: `%${search}%` } },
         { email: { [likeOp]: `%${search}%` } },
         { address: { [likeOp]: `%${search}%` } },
       ];
     }
     ```

#### MAJ-04: CSV Exports Ignore Active Table Filters (Full Database Dump)
* **What's Broken**: When an admin filters the Users table (e.g., `role=store_owner`) or the Stores table (e.g., `name=Organic`) and clicks "Export CSV", the generated CSV file contains all database rows. Active filters are completely ignored.
* **Where**:
  - `src/controllers/admin.controller.js` (`exportUsersCSV` lines 400–429, `exportStoresCSV` lines 435–476)
  - `client/src/services/admin.service.js` (`exportUsersCSV`, `exportStoresCSV`)
  - `client/src/pages/admin/AdminUsers.jsx` (`handleExportCSV` line 153)
  - `client/src/pages/admin/AdminStores.jsx` (`handleExportCSV` line 127)
* **How to Fix**:
  1. Update `adminService.exportUsersCSV(filters)` and `exportStoresCSV(filters)` to pass active filter query parameters to `/api/admin/export/users` and `/api/admin/export/stores`.
  2. In `admin.controller.js`, apply the same `where` conditions (name, email, role, address) used in `listUsers` and `listStores` to the CSV query before streaming.

#### MAJ-05: Review Activity Volume Chart on Admin Dashboard Always Displays Zero / Empty State
* **What's Broken**: The "Review Activity Volume" chart and "Rating Trend" indicator on the Admin Dashboard always display 0 reviews / empty state, even when stores have numerous customer reviews.
* **Where**: `client/src/pages/admin/AdminDashboard.jsx` (lines 36, 48–66, 81–87).
* **Root Cause**: `AdminDashboard.jsx` initializes `const [ratings, setRatings] = useState([])`, but `fetchDashboardData` only fetches dashboard stats, users, and stores. It never fetches ratings data. Consequently, `calculateTrend(ratings)` and `groupTimelineData(users, stores, ratings)` always receive an empty array `[]`.
* **How to Fix**:
  1. Add an admin route `GET /api/admin/ratings` (or include recent ratings in `GET /api/admin/dashboard`).
  2. In `AdminDashboard.jsx`, fetch recent ratings during `fetchDashboardData` and populate `setRatings(ratingsRes.data)`.

#### MAJ-06: Store Detail Drawer Fabricates / Approximates Rating Distribution
* **What's Broken**: In the normal user's Store Detail Drawer (`StoreDetailDrawer.jsx`), the 5-star rating breakdown bars display fabricated/estimated counts rather than actual review data.
* **Where**:
  - `src/controllers/store.controller.js` (`getStoreById` lines 116–174)
  - `client/src/components/stores/StoreDetailDrawer.jsx` (lines 90–104)
* **Root Cause**: `GET /api/stores/:id` computes `average_rating` and `rating_count`, but does not calculate or return a `ratingDistribution` breakdown object. `StoreDetailDrawer.jsx` falls back to synthesizing fake numbers with math formulas:
  ```javascript
  // Fake calculation in StoreDetailDrawer.jsx:
  if (!distribution) {
    distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (count > 0 && avg > 0) {
      const primaryStar = Math.min(5, Math.max(1, Math.round(avg)));
      distribution[primaryStar] = Math.max(1, Math.floor(count * 0.6));
      ...
    }
  }
  ```
* **How to Fix**:
  1. In `src/controllers/store.controller.js` (`getStoreById`), aggregate real star rating counts (`Rating.findAll({ where: { store_id: id }, attributes: ['rating', [fn('COUNT', col('id')), 'count']], group: ['rating'] })`).
  2. Return `ratingDistribution` in the API payload so the frontend displays exact, verified data.

#### MAJ-07: Inaccessible Sidebar on Mobile Screens (< 900px) Due to Missing Hamburger Button
* **What's Broken**: On mobile devices and viewport widths <= 900px, `.dashboard-sidebar` is translated off-screen (`transform: translateX(-100%)`). However, `DashboardLayout.jsx` fails to pass the `onMobileMenuToggle` prop to `Topbar.jsx`. As a result, the hamburger menu button never renders in the topbar, making it impossible for mobile users to access navigation links.
* **Where**:
  - `client/src/components/common/DashboardLayout.jsx` (line 45)
  - `client/src/components/common/Topbar.jsx` (lines 19, 68–76)
* **How to Fix**:
  1. In `DashboardLayout.jsx`, manage mobile drawer state `const [mobileNavOpen, setMobileNavOpen] = useState(false)`.
  2. Pass `onMobileMenuToggle={() => setMobileNavOpen(!mobileNavOpen)}` to `<Topbar />`.
  3. Add a mobile slide-out drawer or overlay class when `mobileNavOpen` is true.

---

### 3. Minor Issues

#### MIN-01: Dark Mode Contrast Flaw on Signup Page (White-on-White Text)
* **What's Broken**: When dark mode is active (`data-theme="dark"`), the input fields on `/signup` have an inline `backgroundColor: '#ffffff'`, while `.form-input` inherits the dark mode text color `var(--text-primary)` (`#f8fafc`). User input text renders white on a white background, making it unreadable.
* **Where**: `client/src/pages/auth/SignupPage.jsx` (lines 131, 266–282, 360–380, etc.).
* **How to Fix**:
  Replace hardcoded `#ffffff` backgrounds and `#0F172A` text colors with CSS theme variables (`var(--bg-card)` and `var(--text-primary)`).

#### MIN-02: Monolithic Frontend Bundle Warning (> 1,050 kB)
* **What's Broken**: Running `npm run build` produces a bundle size warning: `dist/assets/index-DRHWPYYd.js 1,056.41 kB` (exceeds recommended 500 kB limit).
* **Where**: `client/vite.config.js`.
* **Root Cause**: Heavy third-party libraries (`recharts`, `xlsx`, `framer-motion`, `lucide-react`) are bundled into a single entry chunk.
* **How to Fix**:
  Configure `build.rollupOptions.output.manualChunks` in `vite.config.js` to split `vendor-charts` (`recharts`), `vendor-excel` (`xlsx`), and `vendor-motion` (`framer-motion`).

#### MIN-03: Inaccurate Store Parameter Validation Error Message
* **What's Broken**: Hitting `DELETE /api/admin/stores/:id` with an invalid ID (e.g. `abc`) returns `"User ID must be a valid positive integer"`.
* **Where**: `src/routes/admin.routes.js` (line 30) & `src/validators/admin.validator.js` (lines 97–101).
* **Root Cause**: The store delete route reuses `userIdParamValidator` instead of a store-specific validator.
* **How to Fix**: Create and mount `storeIdParamValidator` with message `"Store ID must be a valid positive integer"`.

#### MIN-04: Redundant Duplicate Database Query in Store Owner Stats
* **What's Broken**: In `src/controllers/storeOwner.controller.js` (`getStoreStats`), `Store.findAll` is called twice consecutively for the exact same `owner_id` (lines 65–68 and lines 86–102).
* **Where**: `src/controllers/storeOwner.controller.js`.
* **How to Fix**: Consolidate into a single `Store.findAll` query including aggregate attributes (`average_rating`, `rating_count`) and store metadata (`name`, `email`, `address`, `created_at`).

---

### 4. Suggestions & Architectural Improvements

#### SUG-01: Remove Orphaned Dead Code Components
* **Observations**:
  - `client/src/components/admin/AddUserModal.jsx`: Unused component superseded by `AddUserDrawer.jsx`.
  - `client/src/components/common/Navbar.jsx`: Unused component superseded by `Sidebar.jsx` and `Topbar.jsx`.
* **Recommendation**: Delete both files to eliminate developer confusion and reduce codebase surface area.

#### SUG-02: Concurrent Execution of Admin Dashboard Metrics
* **Observation**: In `src/controllers/admin.controller.js` (`getDashboardStats`), `User.count()`, `Store.count()`, and `Rating.count()` are awaited sequentially.
* **Recommendation**: Use `Promise.all([User.count(), Store.count(), Rating.count(), User.findAll(...)])` for faster response times.

#### SUG-03: Governance Widget Performance Classification for New Stores
* **Observation**: In `StoresGovernanceWidget.jsx`, brand new stores with 0 reviews are categorized under "Needs Attention" alongside critically low-rated stores (< 3.5 stars).
* **Recommendation**: Add a dedicated "Unrated / New" pill or filter out stores with `rating_count === 0` from the "Needs Attention" benchmark list.

#### SUG-04: Submit Debounce Guard in RatingModal
* **Observation**: While `RatingModal.jsx` disables the submit button during submission, `handleSubmit` lacks an immediate functional guard `if (submitting) return;` at the top of the handler.
* **Recommendation**: Add `if (submitting) return;` to prevent duplicate submissions on keyboard triggers (Enter key).

---

## Verification Matrix & Compliance Summary

| Requirement Area | Status | Notes |
| :--- | :---: | :--- |
| **Backend Test Suite** | PASS | 27/27 tests pass against PostgreSQL |
| **Database Dialect** | PASS | Active dialect confirmed as `postgres` |
| **Rate Limiting** | PASS | Active on `/api/auth/login` and `/api/auth/register` |
| **Role Authorization Isolation** | PASS | 403 Forbidden properly enforced across cross-role API calls |
| **Frontend Production Build** | PASS | 0 errors; chunk size warning noted |
| **In-Memory JWT Reload Behavior** | PASS | Clean redirect to `/login` without stuck loading states |
| **Role-Mismatched Protected Route Redirects** | PASS | Clean redirects to respective role dashboards |
| **Input Validation Rules (Client & Server)** | PASS | Name (20-60), Email, Password (8-16 with uppercase & special), Address (max 400) |
| **Database Concurrency (Rating Unique Constraint)** | PASS | Unique index `(user_id, store_id)` prevents duplicate records |
