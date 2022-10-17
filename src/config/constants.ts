const config = {
  apiUrl: process.env.REACT_APP_API_URL,
  graphqlEndpoint: process.env.REACT_APP_GRAPHQL_ENDPOINT,
  accessTokenLife: process.env.REACT_APP_ACCESS_TOKEN_LIFE || '15m',
  paging: {
    perPage: 10,
  },
  roles: {
    SuperAdmin: 'SuperAdmin',
    CompanyAdmin: 'CompanyAdmin',
    Client: 'Client',
    Employee: 'Employee',
    TaskManager: 'TaskManager',
    Vendor: 'Vendor',
    BookKeeper : 'BookKeeper',
  },
  userType: {
    SystemAdmin: 'SystemAdmin',
    Company: 'Company'
  },
};

export const stripeSetting = {
  publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY as string,
}

export const roles_user = [{
  value: 'CompanyAdmin',
  name: 'Company Admin'
},
{
  value: 'Employee',
  name: 'Employee'
},
{
  value: 'TaskManager',
  name: 'Task Manager'
},
{
  value: 'BookKeeper',
  name: 'Book Keeper'
}
]

export const status = [
  {
    value: 'Active',
    name: 'Active',
  },
  {
    value: 'Inactive',
    name: 'In Active',
  },
];

export const payment_status = [
  {
    value: 'Paid',
    name: 'Paid',
  },
  {
    value: 'Pending',
    name: 'In Pending',
  },
  {
    value: 'RequiredAction',
    name: 'RequiredAction',
  },
];

export const archived = [
  {
    value: true,
    name: 'Archived',
  },
  {
    value: false,
    name: 'Unarchive',
  },
];

export const invoice_status = [{
  value: 'Sent',
  name: 'Sent'
},
{
  value: 'Pending',
  name: 'Pending'
},
{
  value: 'Received',
  name: 'Received'
},
]

export const employee_timesheet_status = [{
  value: 'Approved',
  name: 'Approved'
},
{
  value: 'Pending',
  name: 'Pending'
},
{
  value: 'Rejected',
  name: 'Rejected'
},
{
  value: 'PartiallyApproved',
  name: 'PartiallyApproved'
},
]

export const company_status = [{
  value: 'Active',
  name: 'Active'
},
{
  value: 'Inactive',
  name: 'In Active'
}
]

export const attachment_type = [{
  value: 'Timesheet',
  name: 'Timesheet'
},
{
  value: 'Attachment',
  name: 'Attachment'
},
{
  value: 'Others',
  name: 'Others'
}
]

export const plans = {
  Starter: 'Starter',
  Professional: 'Professional',
};

export const subscription = {
  price: {
    Starter: 'FREE',
    Professional: '$10 Flat + $1 per user',
  },
  description: {
    Starter: 'For Small Business',
    Professional: 'Ideal for Medium Business',
  },
  features: {
    Starter: [
      'Manual Invoicing',
      'Unlimited clients',
      'Unlimited work schedule',
      'Use own company logo',
      'Copy and paste schedule',
      'Unlimited users',
      'Notification for new schedule',
      'Unlimited project'
    ],
    Professional: [
      'Everything from free features',
      'Timesheet/ time tracker with approvals',
      'Unlimited task manager',
      'Attachment in timesheet',
      'Auto attachment in the invoice'
    ],
  }
};

export const subscriptionStatus =  {
  active: 'active',
  inactive: 'inactive',
  canceled: 'canceled',
  trialing: 'trialing',
  past_due: 'past_due',
  unpaid: 'unpaid',
  incomplete: 'incomplete',
  incomplete_expired: 'incomplete_expired',
};


export default config;
