# Software Design Document
## HUcMS - Cafeteria Management System

**Document Status:** Final rewritten submission draft  
**Technology Stack:** Laravel 11, PHP 8.3, MySQL 8.0, Blade, Tailwind CSS  
**Architecture Style:** Monolithic MVC web application  
**Purpose:** Professional software design specification for a university submission

---

## Table of Contents

1. Introduction  
2. Project Scope and Objectives  
3. Overall System Description  
4. Architectural Design  
5. UML Design Specifications  
6. Database Design  
7. Module Design  
8. Security and Validation Design  
9. Deployment Design  
10. Testing Strategy  
11. Conclusion  
12. Appendix: Data Dictionary and DDL Rules  

---

## 1. Introduction

The HUcMS Cafeteria Management System is a web-based information system designed to support day-to-day cafeteria operations in a university environment. The system manages users, meal sessions, menu publishing, food ordering, payment recording, audit logging, and operational reporting. It replaces manual or spreadsheet-based processes with a controlled application that is easier to maintain, more secure, and more consistent.

The purpose of this document is to present a complete software design for the system. It describes the functional structure of the application, the architectural decisions, the principal classes, the database schema, the UML models in textual form, and the deployment approach. The document is written as a design specification rather than a user manual.

### 1.1 Problem Statement

University cafeterias typically need to manage daily menus, service periods, order placement, payment confirmation, and staff accountability. When these tasks are handled manually, the organization may experience duplicate records, inconsistent pricing, weak auditability, and slow reporting. A structured software solution is therefore required.

### 1.2 Design Goals

The system is designed to:

- simplify cafeteria operations through a single web application,
- keep the architecture realistic for a university project,
- use one backend stack only, namely Laravel,
- store business data in a normalized relational database,
- support clear role-based access control,
- maintain a searchable audit trail,
- remain easy to extend without introducing unnecessary enterprise complexity.

### 1.3 Assumptions and Constraints

- The application is intended for a single university cafeteria or a small group of cafeteria outlets.
- The first release is a monolithic web application; microservices are not required.
- Payment can be recorded as cash, card, or wallet-based confirmation, depending on institutional policy.
- The system focuses on ordering and cafeteria administration, not full enterprise procurement or supply-chain automation.

---

## 2. Project Scope and Objectives

### 2.1 Scope

The system covers the following functions:

- user authentication and role assignment,
- cafeteria staff management,
- meal session management such as breakfast, lunch, and dinner,
- menu publication and item pricing,
- order placement and order tracking,
- payment recording,
- audit logging,
- management reports for administrators.

The system does not attempt to implement unnecessary large-scale infrastructure such as distributed message brokers, multiple application clusters, or separate microservices for every function. Those components are not justified for a university-level project of this size.

### 2.2 Objectives

The system is designed to:

- reduce manual errors in cafeteria administration,
- support controlled access by role,
- provide a reliable record of all important actions,
- keep meal and menu data synchronized with orders,
- support daily operational reporting,
- provide a design that can be implemented efficiently in Laravel.

### 2.3 Primary Users

| User Type | Responsibility |
| --- | --- |
| Administrator | Manages users, roles, menu configuration, meal sessions, and reports |
| Cashier | Confirms payments, records completed orders, and supports customer service |
| Kitchen Staff | Reviews active orders and prepares meals for the current service period |
| Customer or Student | Browses menus, places orders, and views order status |

---

## 3. Overall System Description

### 3.1 System Context

HUcMS operates as a browser-based application. Users access the system through a standard web browser. The Laravel application handles business logic, while MySQL stores persistent data. Blade templates render the user interface. The design is intentionally simple so that it remains practical for implementation, maintenance, and demonstration.

### 3.2 Functional Overview

The system supports the following major activities:

- user login and access control,
- registration and maintenance of cafeteria staff accounts,
- definition of meal sessions and menu items,
- publication of menus for specific dates and sessions,
- ordering of items from an available menu,
- recording of payments and order completion,
- logging of create, update, and delete actions,
- report generation for management review.

### 3.3 Non-Functional Requirements

The design must satisfy the following non-functional requirements:

- reliability through database constraints,
- consistency through transactional updates,
- maintainability through clear MVC separation,
- security through authentication and authorization,
- scalability suitable for a modest university deployment,
- readability of code and schema for academic assessment.

---

## 4. Architectural Design

### 4.1 Selected Technology Stack

The implementation uses only one backend stack:

- **Backend:** Laravel 11
- **Language:** PHP 8.3
- **Database:** MySQL 8.0
- **View Layer:** Blade templates
- **Styling:** Tailwind CSS
- **Authentication:** Laravel authentication features
- **Testing:** PHPUnit or Pest, depending on project preference

This stack is sufficient for a realistic university project and avoids the inconsistency of mixing Laravel and Django in the same design.

### 4.2 Architectural Style

The system follows the Model-View-Controller pattern.

- **Models** represent domain data and database relations.
- **Views** render pages for users.
- **Controllers** coordinate requests, validation, and responses.
- **Services** encapsulate business rules that are shared across controllers.
- **Repositories or query classes** may be used where complex data retrieval is needed.

### 4.3 Logical Architecture

The application is divided into three logical layers:

| Layer | Responsibility |
| --- | --- |
| Presentation Layer | Blade templates, forms, and user interaction |
| Application Layer | Controllers, validation rules, services, and policies |
| Data Layer | Eloquent models, migrations, seeders, and MySQL persistence |

### 4.4 Design Rationale

The chosen architecture is intentionally compact. It provides strong separation of concerns without introducing unnecessary complexity. A monolithic Laravel application is more appropriate than a distributed architecture because it is easier to build, deploy, test, and present in a university setting.

---

## 5. UML Design Specifications

The original diagram descriptions have been rewritten here as textual UML instructions that can be directly used to draw the required diagrams in a modeling tool.

### 5.1 Class Diagram

#### 5.1.1 Textual UML Representation

**Role**
- role_id: bigint, PK
- name: string, unique
- description: string
- timestamps

**User**
- user_id: bigint, PK
- role_id: bigint, FK
- full_name: string
- email: string, unique
- password_hash: string
- phone_number: string, nullable
- status: string
- timestamps
- methods: authenticate(), assignRole(), updateProfile()

**MealSession**
- meal_session_id: bigint, PK
- session_name: string, unique
- start_time: time
- end_time: time
- is_active: boolean
- timestamps
- methods: isOpen(), activate(), deactivate()

**MenuItem**
- menu_item_id: bigint, PK
- item_name: string
- category: string
- base_price: decimal
- is_available: boolean
- timestamps
- methods: updatePrice(), markUnavailable()

**DailyMenu**
- daily_menu_id: bigint, PK
- menu_date: date
- meal_session_id: bigint, FK
- created_by: bigint, FK to users
- status: string
- timestamps
- methods: publish(), closeMenu()

**DailyMenuItem**
- daily_menu_item_id: bigint, PK
- daily_menu_id: bigint, FK
- menu_item_id: bigint, FK
- selling_price: decimal
- available_quantity: integer
- timestamps
- methods: reserveStock(), reduceQuantity()

**Order**
- order_id: bigint, PK
- user_id: bigint, FK
- daily_menu_id: bigint, FK
- order_number: string, unique
- order_status: string
- total_amount: decimal
- ordered_at: datetime
- timestamps
- methods: calculateTotal(), submit(), cancel()

**OrderItem**
- order_item_id: bigint, PK
- order_id: bigint, FK
- menu_item_id: bigint, FK
- quantity: integer
- unit_price: decimal
- line_total: decimal
- timestamps
- methods: computeLineTotal()

**Payment**
- payment_id: bigint, PK
- order_id: bigint, FK, unique
- amount_paid: decimal
- payment_method: string
- payment_status: string
- paid_at: datetime, nullable
- timestamps
- methods: confirm(), fail(), refund()

**AuditLog**
- audit_log_id: bigint, PK
- user_id: bigint, FK, nullable
- action_type: string
- entity_type: string
- entity_id: bigint or string
- before_data: json, nullable
- after_data: json, nullable
- ip_address: string, nullable
- user_agent: string, nullable
- created_at: datetime
- methods: recordAction()

#### 5.1.2 Associations and Multiplicity

- One `Role` has many `User` records.
- One `User` belongs to exactly one `Role`.
- One `MealSession` has many `DailyMenu` records.
- One `DailyMenu` belongs to exactly one `MealSession`.
- One `DailyMenu` has many `DailyMenuItem` records.
- One `MenuItem` can appear in many `DailyMenuItem` records.
- One `User` can place many `Order` records.
- One `Order` has many `OrderItem` records.
- One `Order` has zero or one `Payment` record until payment is completed.
- One `User` can generate many `AuditLog` entries.

#### 5.1.3 Drawing Instructions

To draw the class diagram, place the core domain classes in the center of the diagram, with `User` and `Order` at the center because they connect most of the system. Put `Role` above `User`, `MealSession` and `MenuItem` to the right, `DailyMenu` between sessions and items, `OrderItem` below `Order`, `Payment` beside `Order`, and `AuditLog` at the bottom as a cross-cutting concern. Use standard UML association lines with multiplicities on both ends.

### 5.2 Sequence Diagram

#### 5.2.1 Scenario: Customer Places an Order

**Lifelines:** Customer, Browser UI, OrderController, OrderService, DailyMenuRepository, OrderRepository, PaymentService, AuditLogService, MySQL Database

#### 5.2.2 Textual Flow

1. Customer opens the cafeteria menu in the browser.
2. Browser UI requests the active daily menu from `OrderController`.
3. `OrderController` calls `DailyMenuRepository` to fetch the available items.
4. Customer adds one or more menu items to the cart.
5. Browser UI sends the order payload to `OrderController`.
6. `OrderController` validates the request and forwards it to `OrderService`.
7. `OrderService` checks whether the selected meal session is still open.
8. `OrderService` recalculates the total amount from the selected items.
9. `OrderService` writes the order and order items to the database.
10. If payment is immediate, `PaymentService` records the payment status.
11. `AuditLogService` stores a log entry for the completed transaction.
12. The system returns the order number and status to the browser.

#### 5.2.3 Alternative Path

If the meal session is closed or stock is insufficient, the system rejects the order, returns a validation message to the browser, and records the failure in the audit log if the action reached the application layer.

#### 5.2.4 Drawing Instructions

Draw the sequence diagram from left to right with the lifelines listed above. Use solid arrows for requests, dashed arrows for responses, and a decision fragment for the closed-session and payment-failure cases.

### 5.3 Activity Diagram

#### 5.3.1 Scenario: Order Lifecycle

#### 5.3.2 Textual Activity Flow

- Start
- User logs in
- System verifies role and session
- User opens the menu page
- System displays active meal sessions and available items
- User selects items and quantity
- System validates item availability and order limits
- Decision: Is the meal session open?
  - If no, show a rejection message and end
  - If yes, continue
- System calculates order total
- User confirms order
- Decision: Is payment required immediately?
  - If yes, process payment and record payment status
  - If no, mark order as pending payment
- System saves order, order items, payment record, and audit log
- System displays the order confirmation
- End

#### 5.3.3 Drawing Instructions

Use three swimlanes: Customer, Application, and Database. Place decisions after session validation and payment confirmation. Keep the diagram linear and avoid unnecessary branches so that the flow remains easy to read in a university report.

### 5.4 Deployment Diagram

#### 5.4.1 Textual Deployment Representation

**Client Node**
- Web browser on a laptop, desktop, or mobile device
- Communicates with the system over HTTPS

**Web/Application Node**
- Nginx or Apache web server
- PHP 8.3 runtime with Laravel 11 application
- Handles authentication, request routing, validation, and business logic

**Database Node**
- MySQL 8.0 database server
- Stores users, roles, menu data, orders, payments, and audit logs

**Optional Storage Node**
- Local file storage or shared server storage for receipts and uploaded assets
- Not required as a separate enterprise service

#### 5.4.2 Drawing Instructions

Place the browser node on the left, the web application node in the center, and the database node on the right. Connect the browser to the web node with HTTPS, and the web node to the database node with a database connection line. If a storage node is shown, connect it to the application node with a file-storage link.

---

## 6. Database Design

### 6.1 Design Principles

The database is designed to be normalized, consistent, and realistic for a cafeteria management system. It also follows an important rule for all database object creation: before creating any table, index, view, trigger, or function, the migration script must check whether the object already exists and then either skip creation, recreate it safely, or replace it using the correct DDL form. This prevents migration failures when scripts are run more than once.

Recommended idempotent patterns include:

- `CREATE TABLE IF NOT EXISTS`
- `CREATE INDEX IF NOT EXISTS`
- `CREATE OR REPLACE VIEW`
- `CREATE OR REPLACE FUNCTION`
- `DROP TRIGGER IF EXISTS` before recreating a trigger when needed
- `DROP INDEX IF EXISTS` when a renamed or altered index must be replaced

### 6.2 Core Database Tables

| Table | Purpose | Primary Key | Important Foreign Keys |
| --- | --- | --- | --- |
| roles | Stores access roles | role_id | none |
| users | Stores application accounts | user_id | role_id -> roles.role_id |
| meal_sessions | Stores service periods such as breakfast and lunch | meal_session_id | none |
| menu_items | Stores menu item master data | menu_item_id | none |
| daily_menus | Stores menus for a specific date and meal session | daily_menu_id | meal_session_id -> meal_sessions.meal_session_id, created_by -> users.user_id |
| daily_menu_items | Connects menu items to a daily menu | daily_menu_item_id | daily_menu_id -> daily_menus.daily_menu_id, menu_item_id -> menu_items.menu_item_id |
| orders | Stores customer orders | order_id | user_id -> users.user_id, daily_menu_id -> daily_menus.daily_menu_id |
| order_items | Stores order line items | order_item_id | order_id -> orders.order_id, menu_item_id -> menu_items.menu_item_id |
| payments | Stores payment information | payment_id | order_id -> orders.order_id |
| audit_logs | Stores action history and accountability data | audit_log_id | user_id -> users.user_id |

### 6.3 Key Attributes by Table

**roles**
- role_id, name, description, timestamps

**users**
- user_id, role_id, full_name, email, password_hash, phone_number, status, timestamps

**meal_sessions**
- meal_session_id, session_name, start_time, end_time, is_active, timestamps

**menu_items**
- menu_item_id, item_name, category, description, base_price, is_active, timestamps

**daily_menus**
- daily_menu_id, menu_date, meal_session_id, created_by, status, timestamps

**daily_menu_items**
- daily_menu_item_id, daily_menu_id, menu_item_id, selling_price, available_quantity, timestamps

**orders**
- order_id, user_id, daily_menu_id, order_number, order_status, total_amount, ordered_at, timestamps

**order_items**
- order_item_id, order_id, menu_item_id, quantity, unit_price, line_total, timestamps

**payments**
- payment_id, order_id, amount_paid, payment_method, payment_status, transaction_reference, paid_at, timestamps

**audit_logs**
- audit_log_id, user_id, action_type, entity_type, entity_id, before_data, after_data, ip_address, user_agent, created_at

### 6.4 Relationship Rules

- Each user belongs to one role.
- Each meal session can have many daily menus.
- Each daily menu contains many menu items through `daily_menu_items`.
- Each order belongs to one user and one daily menu.
- Each order contains one or more order items.
- Each order has at most one payment record.
- Each audit log belongs to the user who performed the action, if known.

### 6.5 Normalization

The schema is normalized to Third Normal Form.

- **First Normal Form:** all values are atomic, and repeated groups are removed.
- **Second Normal Form:** non-key attributes depend on the whole key, especially in associative tables.
- **Third Normal Form:** no table stores data that can be derived from another non-key attribute.

Examples of normalized design choices include:

- roles are separated from users,
- meal sessions are separated from daily menus,
- menu items are separated from daily menu pricing,
- order totals are computed from order items rather than stored manually as the only source of truth,
- audit data is stored once in a dedicated log table.

### 6.6 Constraints and Integrity Rules

The database should enforce the following rules:

- role names must be unique,
- user emails must be unique,
- meal session names must be unique,
- order numbers must be unique,
- menu item prices must be non-negative,
- order quantities must be greater than zero,
- payment amounts must not be negative,
- dates and times must be valid and consistent,
- foreign key relationships must remain valid.

### 6.7 Indexing Strategy

The following indexes are recommended:

- `users(role_id)`
- `daily_menus(meal_session_id, menu_date)`
- `daily_menu_items(daily_menu_id, menu_item_id)`
- `orders(user_id, ordered_at)`
- `order_items(order_id, menu_item_id)`
- `payments(order_id)`
- `audit_logs(user_id, created_at)`

These indexes support common administrative queries, order lookup, and auditing without overcomplicating the schema.

### 6.8 Audit and Logging Design

The `audit_logs` table is included to satisfy traceability requirements. It should store the actor, the action performed, the affected entity, and optional before-and-after snapshots in JSON format. This design is useful for accountability, especially when menu prices, order statuses, or user records are changed.

### 6.9 Database Creation Order

To avoid foreign key errors, the creation order should be:

1. roles
2. users
3. meal_sessions
4. menu_items
5. daily_menus
6. daily_menu_items
7. orders
8. order_items
9. payments
10. audit_logs

This order ensures that parent tables exist before child tables reference them.

---

## 7. Module Design

### 7.1 Authentication Module

This module handles login, logout, password management, and role-based navigation. Users see only the pages that match their assigned role.

### 7.2 Administration Module

Administrators manage users, roles, meal sessions, and menu item master data. They can also review audit logs and operational reports.

### 7.3 Menu Management Module

This module allows staff to publish a daily menu for a given meal session and date. It also supports pricing, availability, and quantity control.

### 7.4 Ordering Module

Customers use this module to browse available items, build an order, and submit it for processing. The module validates order timing, availability, and price calculations.

### 7.5 Payment Module

The payment module records payment status for completed orders. It can support cash confirmation at the counter or an online payment confirmation workflow.

### 7.6 Reporting Module

Management reports summarize order volume, meal session usage, sales totals, and payment completion rates. Reports are generated from database queries rather than stored manually.

---

## 8. Security and Validation Design

### 8.1 Authentication and Authorization

The system uses Laravel authentication for user login and password handling. Authorization is enforced using role checks and policy logic in the application layer. Sensitive operations such as role management, menu publication, and order updates are restricted to authorized users.

### 8.2 Input Validation

All user input must be validated before database storage. Validation applies to:

- email format,
- password complexity,
- menu prices,
- item quantities,
- order dates,
- meal session times,
- payment status values.

### 8.3 Transaction Safety

Order creation, payment recording, and audit logging should be handled within database transactions. This prevents partial writes and keeps the order state consistent if one step fails.

### 8.4 Auditability

Every important administrative action should create an audit log entry. This includes create, update, delete, and approval actions. The audit trail improves accountability and supports troubleshooting.

### 8.5 Error Handling

The system should return clear validation errors to the user and avoid exposing internal stack traces in production. Database exceptions must be caught and translated into user-friendly messages.

---

## 9. Deployment Design

### 9.1 Recommended Deployment Model

The deployment model is intentionally simple:

- one client tier for browsers,
- one application tier for Laravel,
- one database tier for MySQL.

### 9.2 Deployment Diagram Summary

- **Client:** desktop, laptop, tablet, or phone browser
- **Application Server:** Nginx or Apache with PHP-FPM running Laravel
- **Database Server:** MySQL 8.0
- **Storage:** local or shared storage for receipts and uploaded files if needed

### 9.3 Why This Design Is Appropriate

This deployment is realistic for a university cafeteria project because it is easy to host on a VPS, campus server, or shared institutional environment. It also avoids enterprise complexity that would be unnecessary for the project scope.

---

## 10. Testing Strategy

### 10.1 Testing Objectives

The testing strategy must confirm that the design works correctly and that the database rules are enforced.

### 10.2 Test Areas

- authentication and authorization,
- validation rules,
- menu publication and visibility,
- order creation and total calculation,
- payment recording,
- audit log creation,
- foreign key enforcement,
- index and query behavior.

### 10.3 Representative Test Cases

| Test Case | Expected Result |
| --- | --- |
| Create a user with a duplicate email | rejected by unique constraint |
| Submit an order outside the active meal session | rejected by validation |
| Add an item with zero quantity | rejected by validation |
| Record a negative payment amount | rejected by validation |
| Delete a menu item used in past orders | blocked or handled according to referential rules |
| Confirm payment for a valid order | payment is stored and order status is updated |
| Review audit logs after an update | log entry is present with the correct actor and action |

### 10.4 Validation Principle

The design assumes that database constraints, application validation, and transactional control must work together. None of these layers should be relied on alone.

---

## 11. Conclusion

The HUcMS Cafeteria Management System is designed as a realistic and academically appropriate web application for university use. The design emphasizes clarity, maintainability, and database integrity rather than unnecessary infrastructure complexity. By selecting one backend stack, Laravel 11 with PHP 8.3, the system remains consistent and implementable.

The database model is normalized, the role structure is clear, the audit trail is explicit, and the UML specifications are provided in a form that can be directly drawn. The resulting design is suitable for a final-year or advanced software engineering submission because it demonstrates sound architecture, practical database modeling, and professional documentation standards.

---

## 12. Appendix: Data Dictionary and DDL Rules

### 12.1 Data Dictionary Summary

| Entity | Description |
| --- | --- |
| roles | Stores application roles such as administrator, cashier, and customer |
| users | Stores login accounts and role assignments |
| meal_sessions | Stores service periods such as breakfast, lunch, and dinner |
| menu_items | Stores the master list of cafeteria items |
| daily_menus | Stores menus published for a specific date and session |
| daily_menu_items | Stores the available items and prices for a daily menu |
| orders | Stores customer orders |
| order_items | Stores line items for each order |
| payments | Stores payment information and status |
| audit_logs | Stores action history for accountability |

### 12.2 Idempotent DDL Rule

Every database migration must be safe to run more than once. Before creating any database object, the migration should check whether it already exists and then handle it appropriately. The preferred approach is:

- create tables and indexes with `IF NOT EXISTS`,
- replace views and functions with `CREATE OR REPLACE` where supported,
- drop dependent objects with `IF EXISTS` only when a structural change requires recreation,
- keep the migration order consistent with foreign key dependencies.

This rule prevents duplicate objects and reduces deployment errors during repeated development or grading runs.

### 12.3 Relationship Summary

- `roles` 1 to many `users`
- `meal_sessions` 1 to many `daily_menus`
- `daily_menus` 1 to many `daily_menu_items`
- `menu_items` 1 to many `daily_menu_items`
- `users` 1 to many `orders`
- `orders` 1 to many `order_items`
- `orders` 1 to 0 or 1 `payments`
- `users` 1 to many `audit_logs`

### 12.4 Final Note on Implementation

If the design is implemented exactly as specified, the system will remain consistent, readable, and suitable for a university submission. The document intentionally favors correctness, maintainability, and academic clarity over unnecessary technical novelty.
