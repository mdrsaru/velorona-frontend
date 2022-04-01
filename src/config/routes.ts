import { lazy } from 'react';

const routes = {
  dashboard: {
    childPath: 'dashboard',
    path: '/dashboard',
    component: lazy(() => import('../pages/Dashboard')),
    name: 'Dashboard',
  },
  companyAdmin: {
    childPath: 'company',
    path: '/company',
    component: lazy(() => import('../pages/Company')),
    name: 'Company',
  },
  login: {
    childPath: null,
    path: '/login',
    component: lazy(() => import('../pages/Login')),
    name: 'Login',
  },
  loginAdmin: {
    childPath: ':role',
    path: '/login/admin',
    component: lazy(() => import('../pages/Login')),
    name: 'Login',
  },
  home: {
    childPath: null,
    path: '/',
    component: lazy(() => import('../pages/Home')),
    name: 'Home',
  },
  role: {
    childPath: 'role',
    path:  '/role',
    component: lazy(() => import('../pages/Role')),
    name: 'Role',
  },
  companyDashboard: {
    childPath: 'dashboard',
    path:  (company: string) => `/${company}/dashboard`,
    component: lazy(() => import('../pages/Dashboard')),
    name: 'Dashboard',
  },
  company: {
    childPath: ':id',
    path:  (id: string) => `/${id}`,
    component: lazy(() => import('../pages/Company')),
    name: 'Company',
  },
  addCompany: {
    childPath: ':new',
    path: `/company/new`,
    component: lazy(() => import('../pages/Company/NewCompany')),
    name: 'New Company',
  },
  employee: {
    childPath: 'employee',
    path: (id: string) => `${id}/employee`,
    component: lazy(() => import('../pages/Employee')),
    name: 'Employee',
  },
  editEmployee: {
    childPath: ':eid',
    path: (id: string, eid: string) => `/${id}/employee/${eid}`,
    component: lazy(() => import('../pages/Employee/EditEmployee')),
    name: 'Edit Employee',
  },
  detailEmployee: {
    childPath: ':eid/detail',
    path: (id: string, eid: string) => `/${id}/employee/${eid}/detail`,
    component: lazy(() => import('../pages/Employee/DetailEmployee')),
    name: 'Employee Detail',
  },
  addEmployee: {
    childPath: 'add',
    path: (id: string) => `/${id}/employee/add`,
    component: lazy(() => import('../pages/Employee/NewEmployee')),
    name: 'New Employee',
  },
  timesheet: {
    childPath: null,
    path: '/timesheet',
    component: lazy(() => import('../pages/Timesheet')),
    name: 'Timesheet',
  },
  schedule: {
    childPath: '/schedule',
    path: '/schedule',
    component: lazy(() => import('../pages/Schedule')),
    name: 'Schedule',
  },
  tasks: {
    childPath: 'tasks',
    path: '/tasks',
    component: lazy(() => import('../pages/Tasks')),
    name: 'Tasks',
  },
  projects: {
    childPath: 'projects',
    path: '/projects',
    component: lazy(() => import('../pages/Project')),
    name: 'Projects',
  },
  addProject: {
    childPath: ':new',
    path: `/projects/new`,
    component: lazy(() => import('../pages/Project/NewProject')),
    name: 'New Company',
  },
  newTimesheet: {
    childPath: 'new',
    path: '/timesheet/new',
    component: lazy(() => import('../pages/Timesheet/NewTimesheet')),
    name: 'New Timesheet',
  },
  detailTimesheet: {
    childPath: ':id',
    path: (id: string) => id,
    component: lazy(() => import('../pages/Timesheet/DetailTimesheet')),
    name: 'Detail Timesheet',
  },
};

export default routes;

