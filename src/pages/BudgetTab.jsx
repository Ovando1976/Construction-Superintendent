import React from "react";

function BudgetTab() {
  return (
    <div className="tab-content">
      <h2>Budget Management</h2>
      <p>
        Use this tab to manage your construction budget. Add expenses, track
        spending, and view reports for a clear picture of your project’s
        finances.
      </p>
      <button className="btn btn-primary m-2">Add Expenses</button>
      <button className="btn btn-secondary m-2">View Reports</button>
    </div>
  );
}

export default BudgetTab;