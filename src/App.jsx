// src/App.js
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Tab, Tabs as BootstrapTabs } from "react-bootstrap";

// Existing pages
import HomeTab from "./pages/HomeTab";
import ProjectsPage from "./pages/ProjectsPage";
import TasksPage from "./pages/TasksPage";
import BudgetTab from "./pages/BudgetTab";
import EmployeesTab from "./pages/EmployeesTab";
import ScheduleTab from "./pages/ScheduleTab";
import ToolsTab from "./pages/ToolsTab";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";

// NEW pages (to be created in ./pages/MaterialsPage, etc.)
import MaterialsPage from "./pages/MaterialsPage";
import EquipmentPage from "./pages/EquipmentPage";
import DailyReportsPage from "./pages/DailyReportsPage";
import ExpensesPage from "./pages/ExpensesPage";

function App() {
  return (
    <div className="app-container">
      <header className="app-header bg-warning text-white">
        <div className="d-flex align-items-center p-3">
          <img
            src="/avatar.png" // Ensure avatar.png is in /public
            alt="Chatbot Avatar"
            className="avatar"
          />
          <h1 className="ms-3">Construction Management App</h1>
        </div>
      </header>

      {/* Wrap all sections in one tabbed interface */}
      <div className="p-3">
        <BootstrapTabs defaultActiveKey="home" id="app-tabs" className="mb-3">
          {/* 1) Home */}
          <Tab eventKey="home" title="Home">
            <HomeTab />
          </Tab>

          {/* 2) Projects & Tasks (existing) */}
          <Tab eventKey="projects" title="Projects">
            <ProjectsPage />
          </Tab>
          <Tab eventKey="tasks" title="Tasks">
            <TasksPage />
          </Tab>

          {/* 3) NEW PAGES: Materials, Equipment, Daily Reports, Expenses */}
          <Tab eventKey="materials" title="Materials">
            <MaterialsPage />
          </Tab>
          <Tab eventKey="equipment" title="Equipment">
            <EquipmentPage />
          </Tab>
          <Tab eventKey="daily-reports" title="Daily Reports">
            <DailyReportsPage />
          </Tab>
          <Tab eventKey="expenses" title="Expenses">
            <ExpensesPage />
          </Tab>

          {/* 4) Existing tabs (Budget, Schedule, Employees, Tools) */}
          <Tab eventKey="budget" title="Budget">
            <BudgetTab />
          </Tab>
          <Tab eventKey="schedule" title="Schedule">
            <ScheduleTab />
          </Tab>
          <Tab eventKey="employees" title="Employees">
            <EmployeesTab />
          </Tab>
          <Tab eventKey="tools" title="Tools">
            <ToolsTab />
          </Tab>

          {/* 5) Dashboard, Register, Login */}
          <Tab eventKey="dashboard" title="Dashboard">
            <Dashboard />
          </Tab>
          <Tab eventKey="register" title="Register">
            <Register />
          </Tab>
          <Tab eventKey="login" title="Login">
            <Login />
          </Tab>
        </BootstrapTabs>
      </div>
    </div>
  );
}

export default App;