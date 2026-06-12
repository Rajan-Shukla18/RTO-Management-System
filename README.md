# Vehix | Smart RTO Management System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.x-61DAFB.svg?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?logo=tailwind-css)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933.svg?logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-5.x-000000.svg?logo=express)

**Vehix** is an advanced, real-time Regional Transport Office (RTO) Management System built to handle modern vehicle registration, compliance alerts, and administrative activity tracking. This project was designed with a focus on high performance, enterprise-grade UX/UI, and real-time data synchronization.

🔗 **[Live Demo on Vercel](https://rto-management-system-five.vercel.app)**

## 🚀 Key Features

*   **Real-time Activity Center:** A dynamic audit log that continuously polls for system updates, complete with export capabilities (Native Excel `.xlsx` generation).
*   **Compliance Alerts Engine:** Automated monitoring of expired insurances, suspended licenses, and registration renewals with a dedicated management interface.
*   **Dual-Role Authentication:** Secure access portal supporting both **Admin (RTO Official)** and **Citizen** roles, complete with session persistence and protected routes.
*   **Advanced Dashboard Analytics:** Comprehensive statistical overview of all vehicles, owners, and active compliance metrics.
*   **Responsive & Animated UI:** Built with Tailwind CSS and Framer Motion for a fluid, professional user experience across all devices.

## 🛠️ Technology Stack

**Frontend:**
*   **React 19** - UI Library
*   **Vite** - Build Tool & Development Server
*   **Tailwind CSS** - Utility-first styling
*   **Framer Motion** - Fluid animations & transitions
*   **Lucide React** - Modern iconography

**Backend:**
*   **Node.js & Express.js** - Robust REST API architecture
*   **SQLite3** - Lightweight, embedded relational database
*   **CORS & Dotenv** - Security and environment configuration

## 📦 Local Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Rajan-Shukla18/RTO-Management-System.git
    cd RTO-Management-System
    ```

2.  **Install all dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development environment:**
    This project uses `concurrently` to run both the Vite frontend and the Express backend simultaneously.
    ```bash
    npm run dev:all
    ```

4.  **Access the application:**
    Open `http://localhost:5173` in your browser.

## 🔑 Demo Credentials

To explore the system, use the following credentials on the Login Portal:

*   **Admin Access:**
    *   Username: `admin`
    *   Password: `admin123`
*   **Citizen Access:**
    *   Username: `rajan`
    *   Password: `rajan123`

## ☁️ Deployment Architecture

*   **Frontend:** Deployed globally via **Vercel** for optimal edge caching and fast delivery.
*   **Backend:** Hosted on **Render** (Node.js runtime) providing a robust, constantly available REST API.

---
*Designed and developed as a comprehensive Database Management System (DBMS) project.*
