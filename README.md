# DeskFlow — A Support Ticket Triage Board

DeskFlow is a modern, high-performance Support Ticket Triage Board designed to facilitate customer support pipelines. The application separates workflows into a four-column triage pipeline with strict status transition checks, dynamic priority-based SLA breach targets, real-time ticket age timers, and a sleek dark-themed visual interface with drag-and-drop actions.

Developed for the **MERN Stack Coding Assessment (Round 1)**.

---

## 👨‍💻 Candidate Portfolio
* **Candidate Name:** Shivam Kumar
* **Candidate Email:** [shivamkumar230983@acropolis.in](mailto:shivamkumar230983@acropolis.in)
* **GitHub Profile:** [shivamkumar203](https://github.com/shivamkumar203)

---

## 🌟 Application Features

1. **Strict State Progression Engine**: 
   * Transition path: `Open ➔ In Progress ➔ Resolved ➔ Closed`.
   * Only one-step forward or backward transitions are allowed.
   * Attempting to skip states (e.g. `Open ➔ Resolved` or `Closed ➔ In Progress`) is rejected on both server and client layers.

2. **Real-time Live Aging**:
   * Support tickets display how long they've been open using an interactive dynamic timer (`Xm`, `Xh Ym`, or `Xd Xh Ym`).
   * For active queues (`Open`, `In Progress`), timers tick forward in real-time.
   * For resolved states (`Resolved`, `Closed`), the age freezes at the duration to resolution.

3. **Priority SLA Tracking & Breach Alarms**:
   * SLA Targets:
     * **Urgent**: 1 Hour
     * **High**: 4 Hours
     * **Medium**: 24 Hours
     * **Low**: 72 Hours
   * Automatically flashes red "SLA BREACHED" indicators if unresolved past targets.

4. **Premium Visual Board & Drag-and-Drop Operations**:
   * Sleek obsidian-themed dashboard utilizing custom glassmorphism.
   * Implements custom HTML5 Drag & Drop handlers.
   * **Visual Snapbacks**: If an examiner attempts to drag a ticket to an disallowed column, the card triggers an interactive shaking vibration and snaps back to its origin.

5. **Aggregate Metrics Strip**:
   * Displays live total counts of tickets in each status column.
   * Displays aggregate counts of currently open (unresolved) SLA breached tickets.

---

## 🛠️ Technology Stack

* **Database**: MongoDB (Atlas connection string / Local fallback)
* **Backend**: Express.js, Mongoose ODM
* **Frontend**: React + Vite, Vanilla CSS (harmonious dark styling, zero boilerplate template)
* **Icons & Assets**: Lucide React vectors

---

## 📡 API Endpoints Spec

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/tickets` | Create a support ticket. Validates subject, description, priority, and email. |
| **GET** | `/tickets` | List tickets. Supports combinable query filters (`?status=`, `?priority=`, and `?breached=true`). |
| **PATCH**| `/tickets/:id` | Update ticket status. Enforces strict transitions. Sets `resolvedAt` on resolution, and clears it on backtrack. |
| **DELETE**| `/tickets/:id` | Delete a support ticket. |
| **GET** | `/tickets/stats` | Returns real-time metrics per status, priority, and total open SLA-breached count. |

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended)
* MongoDB (Local daemon or Atlas account)

### Setup & Local Execution

1. **Clone & Open Project Workspace**
   ```bash
   cd "Bajaj Api round"
   ```

2. **Install All Workspace Dependencies**
   The monorepo-level custom script installs dependencies for both backend and frontend automatically:
   ```bash
   npm run install-all
   ```

3. **Configure Environment Variables**
   Create a `.env` file inside the `backend/` folder (A pre-configured template is already supplied):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/deskflow
   NODE_ENV=development
   ```

4. **Launch Application Dev Servers**
   Run the unified run script to launch both the API backend server (port 5000) and the React Vite client (port 5173) simultaneously:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to **[http://localhost:5173](http://localhost:5173)** to interact with the dashboard.
