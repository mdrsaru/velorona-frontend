import { useEffect, useState } from 'react';
import { authVar } from '../../App/link';
import constants from '../../config/constants';
import routes from '../../config/routes';
import CompanyDashboard from '../../pages/CompanyDashboard';
import { useNavigate } from 'react-router';
import Dashboard from '../../pages/Dashboard';
import TaskManagerDashboard from '../../pages/TaskManagerDashboard';
import EmployeeDashboard from '../../pages/EmployeeDashboard';
import Home from '../../pages/Home';

const DashboardComponent = () => {
  const authData = authVar()
  const roles = authData?.user?.roles;

  return (
    <>
      {roles.includes(constants.roles.SuperAdmin) ?
        <Dashboard />
        :
        roles.includes(constants.roles.CompanyAdmin) ?
          <CompanyDashboard />
          :
          roles.includes(constants.roles.TaskManager) ?
            <TaskManagerDashboard />
            :
            roles.includes(constants.roles.Employee) ?
              <EmployeeDashboard />
              :
              <Home />
      }
    </>
  )
}

export default DashboardComponent