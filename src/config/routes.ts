import { lazy } from 'react';

const routes = {
  dashboard: {
    childPath: 'dashboard',
    path: '/dashboard',
    component: lazy(() => import('../pages/Dashboard')),
    name: 'Dashboard',
    key: 'side1'
  },
  companyAdmin: {
    childPath: 'company',
    path: '/company',
    component: lazy(() => import('../pages/Company')),
    name: 'Company',
    key: 'side2'
  },
  login: {
    childPath: null,
    path: '/login',
    component: lazy(() => import('../pages/Login')),
    name: 'Login',
    key: 'side0'
  },
  loginAdmin: {
    childPath: ':role',
    path: '/login/admin',
    component: lazy(() => import('../pages/Login')),
    name: 'Login',
    key: 'side0'
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
    key: 'side1'
  },
  role: {
    childPath: 'role',
    path:  '/role',
    component: lazy(() => import('../pages/Role')),
    name: 'Role',
    key: 'side3'
  },
  companyDashboard: {
    childPath: 'dashboard',
    path:  (company: string) => `/${company}/dashboard`,
    component: lazy(() => import('../pages/Dashboard')),
    name: 'Dashboard',
    key: 'side1'
  },
  company: {
    childPath: ':id',
    path: (id: string | undefined) => `/${id}`,
    component: lazy(() => import('../pages/Company')),
    name: 'Company',
    key: 'side2'
  },
  addCompany: {
    childPath: ':add',
    path: `/company/add`,
    component: lazy(() => import('../pages/Company/NewCompany')),
    name: 'New Company',
    key: 'side2'
  },
  employee: {
    childPath: 'employee',
    path: (id: string) => `/${id}/employee`,
    component: lazy(() => import('../pages/Employee')),
    name: 'Employee',
    key: 'side2'
  },
  editEmployee: {
    childPath: ':eid',
    path: (id: string, eid: string) => `/${id}/employee/${eid}`,
    component: lazy(() => import('../pages/Employee/EditEmployee')),
    name: 'Edit Employee',
    key: 'side2'
  },
  detailEmployee: {
    childPath: ':eid/detail',
    path: (id: string, eid: string) => `/${id}/employee/${eid}/detail`,
    component: lazy(() => import('../pages/Employee/DetailEmployee')),
    name: 'Employee Detail',
    key: 'side2'
  },
  addEmployee: {
    childPath: 'add',
    path: (id: string) => `/${id}/employee/add`,
    component: lazy(() => import('../pages/Employee/NewEmployee')),
    name: 'New Employee',
    key: 'side2'
  },
  attachClient: {
    childPath: ':eid/add-client',
    path: (id: string, eid: string) => `/${id}/employee/${eid}/add-client`,
    component: lazy(() => import('../pages/Employee/EditEmployee/AttachClient')),
    name: 'Add Client',
    key: 'side4'
  },
  timesheet: {
    childPath: null,
    path: '/timesheet',
    component: lazy(() => import('../pages/Timesheet')),
    name: 'Timesheet',
    key: 'side4'
  },
  schedule: {
    childPath: '/schedule',
    path: '/schedule',
    component: lazy(() => import('../pages/Schedule')),
    name: 'Schedule',
    key: 'side5'
  },
  tasks: {
    childPath: 'tasks',
    path: '/tasks',
    component: lazy(() => import('../pages/Tasks')),
    name: 'Task',
    key: 'side6'
  },
  projects: {
    childPath: 'projects',
    path: (id: string) => `${id}/projects`,
    component: lazy(() => import('../pages/Project')),
    name: 'Project',
    key: 'side7'
  },
  addProject: {
    childPath: 'add',
    path: (id: string) => `/${id}/projects/add`,
    component: lazy(() => import('../pages/Project/NewProject')),
    name: 'New Company',
    key: 'side8'
  },
  editProject: {
    childPath: ':pid',
    path: (id: string, pid: string) => `/${id}/projects/${pid}`,
    component: lazy(() => import('../pages/Project/EditProject')),
    name: 'Edit Project',
    key: 'side9'
  },
  invoice: {
    childPath: 'invoices',
    path: (id: string) => `${id}/invoices`,
    component: lazy(() => import('../pages/Invoice')),
    name: 'Invoice',
    key: 'side10'
  },
  addInvoice: {
    childPath: 'add',
    path: (id: string) => `/${id}/invoices/add`,
    component: lazy(() => import('../pages/Invoice/NewInvoice')),
    name: 'New Client',
    key: 'side11'
  },
  client: {
    childPath: 'clients',
    path: (id: string) => `${id}/clients`,
    component: lazy(() => import('../pages/Client')),
    name: 'Client',
    key: 'side12'
  },
  addClient: {
    childPath: 'add',
    path: (id: string) => `/${id}/clients/add`,
    component: lazy(() => import('../pages/Client/NewClient')),
    name: 'New Client',
    key: 'side13'
  },
  newTimesheet: {
    childPath: 'add',
    path: '/timesheet/add',
    component: lazy(() => import('../pages/Timesheet/NewTimesheet')),
    name: 'New Timesheet',
    key: 'side14'
  },
  detailTimesheet: {
    childPath: ':id',
    path: (id: string) => id,
    component: lazy(() => import('../pages/Timesheet/DetailTimesheet')),
    name: 'Detail Timesheet',
    key: 'side15'
  },
};

export default routes;

