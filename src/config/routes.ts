import { lazy } from 'react';

const routes = {
  dashboard: {
    path: '/dashboard',
    routePath: '/dashboard',
    component: lazy(() => import('../pages/Dashboard')),
    name: 'Dashboard',
  },
  clientAdmin: {
    path: '/client-admin',
    routePath: '/client-admin',
    component: lazy(() => import('../pages/Client')),
    name: 'Client',
  },
  login: {
    path: '/login',
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
    path: ':id/role',
    routePath:  (id: string) => `${id}/role`,
    component: lazy(() => import('../pages/Role')),
    name: 'Role',
  },
  clientDashboard: {
    path: ':id/dashboard',
    routePath:  (id: string) => `/${id}/dashboard`,
    component: lazy(() => import('../pages/Dashboard')),
    name: 'Dashboard',
  },
  client: {
    path: ':id',
    routePath:  (id: string) => `${id}`,
    component: lazy(() => import('../pages/Client')),
    name: 'Client',
  },
  addClient: {
    path: ':new',
    routePath: `/client-admin/new`,
    component: lazy(() => import('../pages/Client/NewClient')),
    name: 'New Client',
  },
  employee: {
    path: ':id/employee',
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
    path: ':id/new-employee',
    routePath: (id: string) => `/${id}/new-employee`,
    component: lazy(() => import('../pages/Employee/NewEmployee')),
    name: 'New Employee',
  },
  timesheet: {
    path: '/timesheet',
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
    path: '/tasks',
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

