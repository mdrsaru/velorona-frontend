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
  resetPassword: {
    childPath: null,
    path: '/reset-password',
    component: lazy(() => import('../pages/ResetPassword')),
    name: 'Reset Password',
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
    childPath: ':add',
    path: `/company/add`,
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
    name: 'Task',
  },
  projects: {
    childPath: 'projects',
    path: (id: string) => `${id}/projects`,
    component: lazy(() => import('../pages/Project')),
    name: 'Project',
  },
  addProject: {
    childPath: ':add',
    path: (id: string) => `/${id}/projects/add`,
    component: lazy(() => import('../pages/Project/NewProject')),
    name: 'New Company',
  },
  invoice: {
    childPath: 'invoices',
    path: (id: string) => `${id}/invoices`,
    component: lazy(() => import('../pages/Invoice')),
    name: 'Invoice',
  },
  addInvoice: {
    childPath: 'add',
    path: (id: string) => `/${id}/invoices/add`,
    component: lazy(() => import('../pages/Invoice/NewInvoice')),
    name: 'New Client',
  },
  client: {
    childPath: 'clients',
    path: (id: string) => `${id}/clients`,
    component: lazy(() => import('../pages/Client')),
    name: 'Client',
  },
  addClient: {
    childPath: 'add',
    path: (id: string) => `/${id}/clients/add`,
    component: lazy(() => import('../pages/Client/NewClient')),
    name: 'New Client',
  },
  newTimesheet: {
    childPath: 'add',
    path: '/timesheet/add',
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

