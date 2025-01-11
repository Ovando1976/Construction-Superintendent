// src/components/Tabs.js

import React from "react";
import { Tab, Tabs as BootstrapTabs } from "react-bootstrap";
import HomeTab from "./tabs/HomeTab";
import BudgetTab from "./tabs/BudgetTab";
import ScheduleTab from "./tabs/ScheduleTab";
import EmployeesTab from "./tabs/EmployeesTab";
import ToolsTab from "./tabs/ToolsTab";

function Tabs() {
  return (
    <div className="tabs-container p-3">
      <BootstrapTabs defaultActiveKey="home" id="app-tabs" className="mb-3">
        <Tab eventKey="home" title="Home">
          <HomeTab />
        </Tab>
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
      </BootstrapTabs>
    </div>
  );
}

export default Tabs;