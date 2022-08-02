import { lazy } from 'react';

import constants from '../config/constants';

const { SuperAdmin, CompanyAdmin, Employee, TaskManager } = constants.roles;

const routes = {
  dashboard: {
    childPath: 'dashboard',
    path: '/dashboard',
    component: lazy(() => import('../pages/Dashboard')),
    name: 'Dashboard',
    key: 'dashboard',
    allowedRoles: [SuperAdmin],
  },
  companyAdmin: {
    childPath: 'company',
    path: '/company',
    component: lazy(() => import('../pages/Company')),
    name: 'Company',
    key: 'company',
    allowedRoles: [SuperAdmin],
  },
  invoicePaymentConfig: {
    childPath: 'payment-config',
    path: '/payment-config',
    component: lazy(() => import('../pages/PaymentConfig')),
    name: 'Payment Config',
    key: 'payment-config',
    allowedRoles: [SuperAdmin],
  },
  login: {
    childPath: null,
    path: '/login',
    component: lazy(() => import('../pages/Login')),
    name: 'Login',
    key: 'login'
  },
  loginAdmin: {
    childPath: ':role',
    path: '/login/admin',
    component: lazy(() => import('../pages/Login')),
    name: 'Login',
    key: 'login'
  },
  resetPassword: {
    childPath: null,
    path: '/reset-password',
    component: lazy(() => import('../pages/ResetPassword')),
    name: 'Reset Password',
    key: 'reset'
  },
  home: {
    childPath: null,
    path: '/',
    component: lazy(() => import('../pages/Home')),
    name: 'Home',
    key: '/',
    allowedRoles: [SuperAdmin],
  },
  role: {
    childPath: 'role',
    path: '/role',
    component: lazy(() => import('../pages/Role')),
    name: 'Roles',
    key: 'role',
    allowedRoles: [SuperAdmin],
  },
  checkDashboard:{
    childPath: ':company',
    path: (company: string | undefined) => `/${company}`,
    component: lazy(() => import('../components/CheckDashboard')),
    name: 'Dashboard',
    key: 'dashboard',
    allowedRoles: [CompanyAdmin, Employee, TaskManager, SuperAdmin],
  },
  company: {
    childPath: ':id',
    path: (id: string | undefined) => `/${id}`,
    component: lazy(() => import('../pages/Company')),
    name: 'Company',
    key: 'dashboard',
    allowedRoles: [CompanyAdmin, SuperAdmin, TaskManager],
  },
  addCompany: {
    childPath: ':add',
    path: `/company/add`,
    component: lazy(() => import('../pages/Company/NewCompany')),
    name: 'New Company',
    key: 'company'
  },
  editCompany: {
    childPath: ':id/edit',
    path: (id: string) => `/company/${id}/edit`,
    component: lazy(() => import('../pages/Company/EditCompany')),
    name: 'Edit Company',
    key: 'company'
  },
  user: {
    childPath: 'users',
    path: (id: string) => `/${id}/users`,
    component: lazy(() => import('../pages/Employee')),
    name: 'Users',
    key: 'users',
    allowedRoles: [CompanyAdmin, SuperAdmin],
  },
  editEmployee: {
    childPath: ':eid',
    path: (id: string, eid: string) => `/${id}/users/${eid}`,
    component: lazy(() => import('../pages/Employee/EditEmployee')),
    name: 'Edit User',
    key: 'employee'
  },
  editProfile: {
    childPath: '/profile-edit/:eid',
    path: (eid: string) => `/profile-edit/${eid}`,
    component: lazy(() => import('../pages/Employee/EditEmployee')),
    name: 'Edit User',
    key: 'profile-edit'
  },
  detailEmployee: {
    childPath: ':eid/detail',
    path: (id: string, eid: string) => `/${id}/users/${eid}/detail`,
    component: lazy(() => import('../pages/Employee/DetailEmployee')),
    name: 'User Detail',
    key: 'employee'
  },
  profile: {
    childPath: 'profile/:eid',
    path: (eid: string) => `/profile/${eid}`,
    component: lazy(() => import('../pages/Employee/DetailEmployee')),
    name: 'Profile',
    key: 'profile'
  },
  companySetting: {
    childPath: 'setting/:eid',
    path: (eid: string) => `/setting/${eid}`,
    component: lazy(() => import('../pages/CompanySetting')),
    name: 'Profile',
    key: 'profile',
    allowedRoles: [CompanyAdmin, SuperAdmin],
  },
  editCompanySetting: {
    childPath: 'setting/:eid/edit',
    path: (eid: string) => `/setting/${eid}/edit`,
    component: lazy(() => import('../pages/CompanySetting/EditCompanySetting')),
    name: 'Profile',
    key: 'profile',
    allowedRoles: [CompanyAdmin, SuperAdmin],
  },
  changePassword: {
    childPath: 'profile/:eid/change-password',
    path: (eid: string) => `/profile/${eid}/change-password`,
    component: lazy(() => import('../pages/ChangePassword')),
    name: 'Profile',
    key: 'profile'
  },

  addEmployee: {
    childPath: 'add',
    path: (id: string) => `/${id}/users/add`,
    component: lazy(() => import('../pages/Employee/NewEmployee')),
    name: 'New User',
    key: 'employee'
  },
  attachClient: {
    childPath: ':eid/add-client',
    path: (id: string, eid: string) => `/${id}/users/${eid}/add-client`,
    component: lazy(() => import('../pages/Employee/EditEmployee/AttachClient')),
    name: 'Add Client',
    key: 'employee'
  },
  timesheet: {
    childPath: 'timesheet',
    path: (id: string) => `/${id}/timesheet`,
    component: lazy(() => import('../pages/Timesheet')),
    name: 'Timesheet',
    key: 'timesheet',
    allowedRoles: [Employee],
  },
  employeeTimesheet: {
    childPath: 'timesheet/employee',
    path: (id: string) => `/${id}/timesheet/employee`,
    component: lazy(() => import('../pages/EmployeeTimesheet')),
    name: 'Employee Timesheet',
    key: 'timesheet',
    allowedRoles: [CompanyAdmin, SuperAdmin, TaskManager],
  },
  timesheetInvoice: {
    childPath: 'timesheet/employee/:timesheetId/add-invoice',
    path: (code: string, id: string) => `/${code}/timesheet/employee/${id}/add-invoice`,
    component: lazy(() => import('../pages/TimesheetInvoice')),
    name: 'Add Invoice',
    key: 'timesheet',
    allowedRoles: [CompanyAdmin, SuperAdmin, TaskManager],
  },
  employeeSchedule: {
    childPath: 'schedule',
    path: (id: string) => `/${id}/schedule`,
    component: lazy(() => import('../pages/EmployeeSchedule')),
    name: 'Schedule',
    key: 'schedule',
    allowedRoles: [Employee],
  },
  schedule: {
    childPath: 'scheduleList',
    path: (id: string) => `/${id}/scheduleList`,
    component: lazy(() => import('../pages/Schedule')),
    name: 'Schedule',
    key: 'scheduleList',
    allowedRoles: [CompanyAdmin, SuperAdmin],
  },
 detailSchedule: {
    childPath: 'scheduleList/:sid',
    path: (id: string,sid:string) => `/${id}/scheduleList/${sid}`,
    component: lazy(() => import('../pages/Schedule/DetailSchedule')),
    name: 'DetailSchedule',
    key: 'scheduleList',
    allowedRoles: [CompanyAdmin, SuperAdmin],
  },
  projects: {
    childPath: 'projects',
    path: (id: string) => `/${id}/projects`,
    component: lazy(() => import('../pages/Project')),
    name: 'Projects',
    key: 'projects',
    allowedRoles: [CompanyAdmin, SuperAdmin],
  },
  addProject: {
    childPath: 'add',
    path: (id: string) => `/${id}/projects/add`,
    component: lazy(() => import('../pages/Project/NewProject')),
    name: 'Add Projects',
    key: 'projects',
    allowedRoles: [CompanyAdmin, SuperAdmin],
  },
  detailProject: {
    childPath: ':pid/detail',
    path: (id: string, pid: string) => `/${id}/projects/${pid}/detail`,
    component: lazy(() => import('../pages/Project/DetailProject')),
    name: 'Project Detail',
    key: 'projects'
  },
  addTasksProject: {
    childPath: ':pid/add-tasks',
    path: (id: string, pid: string) => `/${id}/projects/${pid}/add-tasks`,
    component: lazy(() => import('../pages/Project/AddTasks')),
    name: 'Add Tasks',
    key: 'projects'
  },
  editTasksProject: {
    childPath: ':pid/task/:tid/edit-tasks',
    path: (id: string, pid: string,tid:string) => `/${id}/projects/${pid}/task/${tid}/edit-tasks`,
    component: lazy(() => import('../pages/Project/EditTasks')),
    name: 'Edit Tasks',
    key: 'projects'
  },
  editProject: {
    childPath: ':pid',
    path: (id: string, pid: string) => `/${id}/projects/${pid}`,
    component: lazy(() => import('../pages/Project/EditProject')),
    name: 'Edit Project',
    key: 'projects'
  },
  invoice: {
    childPath: 'invoices',
    path: (id: string) => `/${id}/invoices`,
    component: lazy(() => import('../pages/Invoice')),
    name: 'Invoices',
    key: 'invoices',
    allowedRoles: [CompanyAdmin, SuperAdmin],
  },
  addInvoice: {
    childPath: 'add',
    path: (id: string) => `/${id}/invoices/add`,
    component: lazy(() => import('../pages/Invoice/NewInvoice')),
    name: 'New Client',
    key: 'invoices'
  },
  editInvoice: {
    childPath: ':id',
    path: (code: string, id: string) => `/${code}/invoices/${id}`,
    component: lazy(() => import('../pages/Invoice/EditInvoice')),
    name: 'Edit Invoice',
    key: 'invoices'
  },
  client: {
    childPath: 'clients',
    path: (id: string) => `/${id}/clients`,
    component: lazy(() => import('../pages/Client')),
    name: 'Clients',
    key: 'clients',
    allowedRoles: [CompanyAdmin, SuperAdmin],
  },
  addClient: {
    childPath: 'add',
    path: (id: string) => `/${id}/clients/add`,
    component: lazy(() => import('../pages/Client/NewClient')),
    name: 'New Client',
    key: 'clients'
  },
  editClient: {
    childPath: ':cid/edit',
    path: (id: string, cid: string) => `/${id}/clients/${cid}/edit`,
    component: lazy(() => import('../pages/Client/EditClient')),
    name: 'Edit Client',
    key: 'clients'
  },
  viewClient: {
    childPath: ':cid',
    path: (id: string, cid: string) => `/${id}/clients/${cid}`,
    component: lazy(() => import('../pages/Client/ClientDetail')),
    name: 'View Client',
    key: 'clients'
  },
  newTimesheet: {
    childPath: 'add',
    path: (id: string) => `/${id}/timesheet/add`,
    component: lazy(() => import('../pages/Timesheet/NewTimesheet')),
    name: 'New Timesheet',
    key: 'timesheet'
  },
  detailTimesheet: {
    childPath: ':id/detail',
    path: (id: string, tid: string) => `/${id}/timesheet/${tid}/detail`,
    component: lazy(() => import('../pages/Timesheet/DetailTimesheet')),
    name: 'Detail Timesheet',
    key: 'timesheet',
    allowedRoles: [CompanyAdmin, SuperAdmin, Employee, TaskManager],
  },
  subscription: {
    childPath: 'subscriptions',
    path: (code: string) => `/${code}/subscriptions`,
    component: lazy(() => import('../pages/Subscription')),
    name: 'Subscriptions',
    key: 'subscriptions',
    allowedRoles: [CompanyAdmin, SuperAdmin],
  },
};

export default routes;

