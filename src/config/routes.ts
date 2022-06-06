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
    key: 'side15'
  },
  resetPassword: {
    childPath: null,
    path: '/reset-password',
    component: lazy(() => import('../pages/ResetPassword')),
    name: 'Reset Password',
    key: 'side16'
  },
  home: {
    childPath: null,
    path: '/',
    component: lazy(() => import('../pages/Home')),
    name: 'Home',
    key: 'side17'
  },
  role: {
    childPath: 'role',
    path: '/role',
    component: lazy(() => import('../pages/Role')),
    name: 'Role',
    key: 'side3'
  },
  companyDashboard: {
    childPath: 'dashboard',
    path: (company: string) => `/${company}/dashboard`,
    component: lazy(() => import('../pages/Dashboard')),
    name: 'Dashboard',
    key: 'side18'
  },
  company: {
    childPath: ':id',
    path: (id: string | undefined) => `/${id}`,
    component: lazy(() => import('../pages/Company')),
    name: 'Company',
    key: 'side19'
  },
  addCompany: {
    childPath: ':add',
    path: `/company/add`,
    component: lazy(() => import('../pages/Company/NewCompany')),
    name: 'New Company',
    key: 'side20'
  },
  editCompany: {
    childPath: ':id/edit',
    path: (id: string) => `/company/${id}/edit`,
    component: lazy(() => import('../pages/Company/EditCompany')),
    name: 'Edit Company',
    key: 'side20'
  },
  employee: {
    childPath: 'employee',
    path: (id: string) => `/${id}/employee`,
    component: lazy(() => import('../pages/Employee')),
    name: 'Employee',
    key: 'side21'
  },
  editEmployee: {
    childPath: ':eid',
    path: (id: string, eid: string) => `/${id}/employee/${eid}`,
    component: lazy(() => import('../pages/Employee/EditEmployee')),
    name: 'Edit Employee',
    key: 'side22'
  },
  detailEmployee: {
    childPath: ':eid/detail',
    path: (id: string, eid: string) => `/${id}/employee/${eid}/detail`,
    component: lazy(() => import('../pages/Employee/DetailEmployee')),
    name: 'Employee Detail',
    key: 'side2'
  },
  profile: {
    childPath: 'profile/:eid',
    path: (id: string, eid: string) => `/${id}/profile/${eid}`,
    component: lazy(() => import('../pages/Employee/DetailEmployee')),
    name: 'Profile',
    key: 'side25'
  },
  addEmployee: {
    childPath: 'add',
    path: (id: string) => `/${id}/employee/add`,
    component: lazy(() => import('../pages/Employee/NewEmployee')),
    name: 'New Employee',
    key: 'side23'
  },
  attachClient: {
    childPath: ':eid/add-client',
    path: (id: string, eid: string) => `/${id}/employee/${eid}/add-client`,
    component: lazy(() => import('../pages/Employee/EditEmployee/AttachClient')),
    name: 'Add Client',
    key: 'side4'
  },
  timesheet: {
    childPath: 'timesheet',
    path: (id: string) => `/${id}/timesheet`,
    component: lazy(() => import('../pages/Timesheet')),
    name: 'Timesheet',
    key: 'side4'
  },
  employeeTimesheet: {
    childPath: 'employee-timesheet',
    path: (id: string) => `/${id}/employee-timesheet`,
    component: lazy(() => import('../pages/EmployeeTimesheet')),
    name: 'Employee Timesheet',
    key: '_side4'
  },
  timesheetInvoice: {
    childPath: 'employee-timesheet/:timesheetId/add-invoice',
    path: (code: string, id: string) => `/${code}/employee-timesheet/${id}/add-invoice`,
    component: lazy(() => import('../pages/TimesheetInvoice')),
    name: 'Add Invoice',
    key: '__side4'
  },
  schedule: {
    childPath: 'schedule',
    path: (id: string) => `/${id}/schedule`,
    component: lazy(() => import('../pages/Tasks')),
    name: 'Schedule',
    key: 'side5'
  },
  projects: {
    childPath: 'projects',
    path: (id: string) => `/${id}/projects`,
    component: lazy(() => import('../pages/Project')),
    name: 'Project',
    key: 'side7'
  },
  addProject: {
    childPath: 'add',
    path: (id: string) => `/${id}/projects/add`,
    component: lazy(() => import('../pages/Project/NewProject')),
    name: 'Add Projects',
    key: 'side8'
  },
  detailProject: {
    childPath: ':pid/detail',
    path: (id: string, pid: string) => `/${id}/projects/${pid}/detail`,
    component: lazy(() => import('../pages/Project/DetailProject')),
    name: 'Project Detail',
    key: 'side2'
  },
  addTasksProject: {
    childPath: ':pid/add-tasks',
    path: (id: string, pid: string) => `/${id}/projects/${pid}/add-tasks`,
    component: lazy(() => import('../pages/Project/AddTasks')),
    name: 'Add Tasks',
    key: 'side17'
  },
  editTasksProject: {
    childPath: ':pid/task/:tid/edit-tasks',
    path: (id: string, pid: string,tid:string) => `/${id}/projects/${pid}/task/${tid}/edit-tasks`,
    component: lazy(() => import('../pages/Project/EditTasks')),
    name: 'Edit Tasks',
    key: 'side23'
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
    path: (id: string) => `/${id}/invoices`,
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
  editInvoice: {
    childPath: ':id',
    path: (code: string, id: string) => `/${code}/invoices/${id}`,
    component: lazy(() => import('../pages/Invoice/EditInvoice')),
    name: 'Edit Invoice',
    key: 'side20'
  },
  client: {
    childPath: 'clients',
    path: (id: string) => `/${id}/clients`,
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
  editClient: {
    childPath: ':cid',
    path: (id: string, cid: string) => `/${id}/clients/${cid}`,
    component: lazy(() => import('../pages/Client/EditClient')),
    name: 'Edit Client',
    key: 'side14'
  },
  newTimesheet: {
    childPath: 'add',
    path: (id: string) => `/${id}/timesheet/add`,
    component: lazy(() => import('../pages/Timesheet/NewTimesheet')),
    name: 'New Timesheet',
    key: 'side15'
  },
  detailTimesheet: {
    childPath: ':id/detail',
    path: (id: string, tid: string) => `/${id}/timesheet/${tid}/detail`,
    component: lazy(() => import('../pages/Timesheet/DetailTimesheet')),
    name: 'Detail Timesheet',
    key: 'side16'
  },
};

export default routes;

