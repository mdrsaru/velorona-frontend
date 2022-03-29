import { lazy } from 'react';

const routes = {
  dashboard: {
    path: 'dashboard',
    routePath: '/dashboard',
    component: lazy(() => import('../pages/Dashboard')),
    name: 'Dashboard',
  },
  companyAdmin: {
    path: 'company',
    routePath: '/company',
    component: lazy(() => import('../pages/Company')),
    name: 'Company',
  },
  login: {
    path: 'login',
    routePath: '/login',
    component: lazy(() => import('../pages/Login')),
    name: 'Login',
  },
  loginAdmin: {
    path: ':role',
    routePath: '/login/admin',
    component: lazy(() => import('../pages/Login')),
    name: 'Login',
  },
  home: {
    path: '/',
    routePath: '/',
    component: lazy(() => import('../pages/Home')),
    name: 'Home',
  },
  role: {
    path: 'role',
    routePath:  (id: string) => `${id}/role`,
    component: lazy(() => import('../pages/Role')),
    name: 'Role',
  },
  companyDashboard: {
    path: 'dashboard',
    routePath:  (id: string) => `/${id}/dashboard`,
    component: lazy(() => import('../pages/Dashboard')),
    name: 'Dashboard',
  },
  company: {
    path: ':id',
    routePath:  (id: string) => `/${id}`,
    component: lazy(() => import('../pages/Company')),
    name: 'Company',
  },
  addCompany: {
    path: ':new',
    routePath: `/company/new`,
    component: lazy(() => import('../pages/Company/NewCompany')),
    name: 'New Company',
  },
  employee: {
    path: 'employee',
    routePath: (id: string) => `${id}/employee`,
    component: lazy(() => import('../pages/Employee')),
    name: 'Employee',
  },
  editEmployee: {
    path: ':eid',
    routePath: (id: string, eid: string) => `${eid}`,
    component: lazy(() => import('../pages/Employee/EditEmployee')),
    name: 'Edit Employee',
  },
  addEmployee: {
    path: 'new-employee',
    routePath: (id: string) => `/${id}/new-employee`,
    component: lazy(() => import('../pages/Employee/NewEmployee')),
    name: 'New Employee',
  },
  timesheet: {
    path: 'timesheet',
    routePath: '/timesheet',
    component: lazy(() => import('../pages/Timesheet')),
    name: 'Timesheet',
  },
  schedule: {
    path: '/schedule',
    routePath: '/schedule',
    component: lazy(() => import('../pages/Schedule')),
    name: 'Schedule',
  },
  tasks: {
    path: 'tasks',
    routePath: '/tasks',
    component: lazy(() => import('../pages/Tasks')),
    name: 'Tasks',
  },
  newTimesheet: {
    path: 'new',
    routePath: '/timesheet/new',
    component: lazy(() => import('../pages/Timesheet/NewTimesheet')),
    name: 'New Timesheet',
  },
  detailTimesheet: {
    path: ':id',
    routePath: (id: string) => id,
    component: lazy(() => import('../pages/Timesheet/DetailTimesheet')),
    name: 'Detail Timesheet',
  },
};

export default routes;

