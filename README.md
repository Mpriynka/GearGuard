# GearGuard - Computerized Maintenance Management System (CMMS)

GearGuard is a modern, web-based CMMS designed to streamline maintenance operations for industrial equipment. It helps teams manage equipment inventory, schedule preventive maintenance, track corrective repairs, and analyze technician performance.

## 🚀 Features

*   **Role-Based Access Control (RBAC)**: Secure access for different user roles:
    *   **Admin/Manager**: Full control over inventory, teams, and reporting.
    *   **Technician**: View assigned jobs, update request status (In Progress -> Repaired), and scrap equipment.
    *   **Employee**: Simplified "Report Issue" interface to quickly request maintenance.
*   **Equipment Management**: Track inventory, serial numbers, categories, and status (Active, Under Maintenance, Scrap).
*   **Maintenance Workflows**: specific lifecycles for requests: `New` -> `In Progress` -> `Repaired` or `Scrap`.
*   **Smart Dashboard**: Role-specific KPIs and recent activity feeds.
*   **Team Management**: Organize technicians into teams for efficient assignment.

## 🛠️ Tech Stack

### Backend
*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
*   **Database**: PostgreSQL (using SQLAlchemy ORM)
*   **Authentication**: OAuth2 with JWT tokens
*   **Validation**: Pydantic models

### Frontend
*   **Framework**: [React](https://react.dev/) (Vite)
*   **Styling**: Vanilla CSS with a clean, modern design system
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **HTTP Client**: Axios

## 📦 Installation & Setup

### Prerequisites
*   Python 3.10+
*   Node.js 16+
*   PostgreSQL

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate 
pip install -r requirements.txt

# Configure Database
# Update .env or rely on default: postgresql://gearguard:gearGuard@localhost/gearguard_db

# Run the Server
uvicorn app.main:app --reload
```
The backend API will be available at `http://localhost:8000`. API Docs at `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

## 📚 Usage Guide

### Default Credentials (Test Data)
*   **Admin/Manager**: `admin` / `admin` (or similar configured in populate script)
*   **Technician**: `tech1` / `password`
*   **Employee**: `emp1` / `password`

### Common Workflows
1.  **Reporting an Issue**: Log in as an Employee, click "Report Issue" on the dashboard, fill in the subject and equipment.
2.  **Assigning Work**: Log in as a Manager, open a "New" request, and assign it to a Technician/Team.
3.  **Completing a Job**: Log in as a Technician, start the job, and mark it as "Repaired" when finished.

## 📝 License

This project is proprietary and confidential.