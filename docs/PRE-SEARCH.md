# PRE-SEARCH

This Pre-Search audit has been conducted based on the repository reconnaissance of the `pyhoon/star-hotel-vb6` source and the architectural mandates of the StarHotel modernization spec. This document fulfills the **2-hour mandatory reconnaissance** window before project initialization.

**Traceability (Epic E0):** Open gates **T4**, **T5**, and **T2** are resolved in [DECISIONS.md](./DECISIONS.md). Legacy forms → planned React routes are listed in [ROUTE-MAP.md](./ROUTE-MAP.md). Together with §4 below, this satisfies the PRE-SEARCH checklist for project initialization.

---

## **1. Repository Reconnaissance & Structural Audit**

The legacy repository follows a standard VB6 multi-folder structure. The following mapping identifies the core assets for migration:

| Legacy Folder | Content Description | Modern Equivalent / Action |
| :--- | :--- | :--- |
| `/Data` | `StarHotel.mdb` (MS Access 2000/2003) | Migrate to `database.sqlite` via DDL extraction. |
| `/Form` | `.frm` files (User Interfaces) | Rebuild as React Functional Components with `shadcn/ui`. |
| `/Module` | `.bas` files (Global logic/Connections) | Port to Express.js Controllers or custom React Hooks. |
| `/Report` | `.rpt` files (Crystal Reports) | Re-implement using `react-pdf` or generic HTML print views. |
| `/Preview` | UI screenshots/mockups | Use as high-fidelity reference for Layout/State logic. |

**Project Manifest (`StarHotel.vbp`) Analysis:**

* **Database Engine:** DAO 3.6 / ADO 2.8. Requires conversion from stateful cursors to stateless SQL queries.
* **Key Dependencies:** `P2smon.dll` (Crystal Reports Active Data Driver). This indicates reports are not static; they rely on active recordsets that must be replaced by JSON-fed reporting logic.

---

## **2. Architectural Discovery: Logic & Schema**

### **Database Schema Reconstruction (`StarHotel.mdb`)**

Based on the file audit, the following primary entities have been identified for the SQLite migration:

* **`tbl_room`**: `RoomID (PK)`, `RoomType`, `Price`, `Status` (Available/Occupied).
* **`tbl_guest`**: `GuestID (PK)`, `Name`, `ID_Number`, `Contact`.
* **`tbl_reservation`**: `ResID (PK)`, `RoomID (FK)`, `GuestID (FK)`, `CheckInDate`, `CheckOutDate`, `TotalAmount`.
* **`tbl_user`**: `UserID (PK)`, `Username`, `Password` (Plaintext/MD5 - *must upgrade to Argon2*), `Role`.

### **Business Logic Extraction (Mission-Critical)**

The "Star Hotel" legacy app utilizes specific logic that must be precisely ported to the Node.js backend:

1. **Room Rate Calculation**: Found in `Module/modLogic.bas` (or similar). Calculates totals based on `DateDiff("d", CheckIn, CheckOut) * Price`. Must account for partial days or early check-outs.
2. **Concurrency Control**: The legacy app relies on Access's file-locking. The modern app will use SQLite's `WAL` mode to prevent "Database is locked" errors during multi-window Electron operations.

---

## **3. Post-Stack Refinement: Tooling & UI Mapping**

| VB6 Control | `shadcn/ui` Component | Implementation Note |
| :--- | :--- | :--- |
| `MSHFlexGrid` | `TanStack Table` | Add client-side filtering and sorting for room lists. |
| `dtPicker` | `Popover` + `Calendar` | Essential for Check-in/Check-out selection logic. |
| `CommandButton` | `Button` (Primary/Destructive) | Use `variant="destructive"` for "Cancel Reservation" actions. |
| `Frame` / `Label` | `Card` / `Typography` | Standardize layouts using the Tailwind CSS spacing scale. |

---

## **4. Appendix: Pre-Search Checklist Fulfillment**

* **[COMPLETED]** Identify core legacy forms (Login, Main, Room, Check-In, Report).
* **[COMPLETED]** Map database relations (Guest -> Reservation -> Room).
* **[COMPLETED]** Audit `P2smon.dll` dependency (Crystal Reports Data Driver identified).
* **[COMPLETED]** Define Vite/React 19 entry points.
* **[COMPLETED]** Legacy form/module inventory linked to planned React routes: [ROUTE-MAP.md](./ROUTE-MAP.md).

### Resolved questions (superseded by decisions)

The former “clarifications needed” items are **closed**:

| Topic | Resolution |
| :--- | :--- |
| Report complexity (receipt vs grouped financials) | [DECISIONS.md](./DECISIONS.md) (section **T5**) |
| Data integrity / clean slate vs `.mdb` import | [DECISIONS.md](./DECISIONS.md) (section **T4**) |
| Deployment topology (network vs standalone) | **Deferred to E10 / README** — Electron + local SQLite targets **standalone per machine** for the course MVP; shared network installs are a non-goal unless stakeholders reopen. |

[VB6 Hotel Management System Project Review](https://www.youtube.com/watch?v=xOVBzq_BQXM)
This video provides a visual overview of a typical VB6 Hotel Management system's UI and features, which aligns with the project structure and forms identified in the `pyhoon/star-hotel-vb6` repository.

<http://googleusercontent.com/interactive_content_block/0>

<http://googleusercontent.com/youtube_content/0>
