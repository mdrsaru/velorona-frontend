import { lazy } from 'react';

const routes = {
  dashboard: {
    path: '/dashboard',
    routePath: '/dashboard',
    component: lazy(() => import('../pages/Dashboard')),
    name: 'Dashboard',
  },
  login: {
    path: '/login',
    routePath: '/login',
    component: lazy(() => import('../pages/Login')),
    name: 'Login',
  },
  home: {
    path: '/',
    routePath: '/',
    component: lazy(() => import('../pages/Home')),
    name: 'Home',
  },
  client: {
    path: '/client/:id',
    routePath: '/client/2',
    component: lazy(() => import('../pages/Client')),
    name: 'Client',
  },
  addClient: {
    path: 'new',
    routePath: '/client/:id/new',
    component: lazy(() => import('../pages/Client/NewClient')),
    name: 'New Client',
  },
  timesheet: {
    path: '/timesheet',
    routePath: '/timesheet',
    component: lazy(() => import('../pages/Timesheet')),
    name: 'Timesheet',
  },
  employee: {
    path: '/employee',
    routePath: '/employee',
    component: lazy(() => import('../pages/Employee')),
    name: 'Employee',
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

