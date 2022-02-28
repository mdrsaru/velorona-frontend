import { lazy } from 'react';

const routes = {
  dashboard: {
    path: '/dashboard',
    component: lazy(() => import('../pages/Dashboard')),
    name: 'Dashboard',
  },
  login: {
    path: '/login',
    component: lazy(() => import('../pages/Login')),
    name: 'Login',
  },
  home: {
    path: '/',
    component: lazy(() => import('../pages/Home')),
    name: 'Home',
  },
  timesheet: {
    path: '/timesheet',
    component: lazy(() => import('../pages/Timesheet')),
    name: 'Timesheet',
  },
  schedule: {
    path: '/schedule',
    component: lazy(() => import('../pages/Schedule')),
    name: 'Schedule',
  },
  tasks: {
    path: '/tasks',
    component: lazy(() => import('../pages/Tasks')),
    name: 'Tasks',
  },
};

export default routes;

