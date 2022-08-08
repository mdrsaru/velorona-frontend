const config = {
  apiUrl: process.env.REACT_APP_API_URL,
  graphqlEndpoint: process.env.REACT_APP_GRAPHQL_ENDPOINT,
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
}
]

export const status = [{
  value: 'Active',
  name: 'Active'
},
{
  value: 'Inactive',
  name: 'In Active'
},
{
  value: 'Archived',
  name: 'Archived'
},
{
  value: 'Unarchived',
  name: 'UnArchived'
}
]

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
      'Host upto 100 employees',
      'Create upto 25 free projects',
      'Timesheets tracking',
    ],
    Professional: [
      'Host upto 100 employees',
      'Create upto 25 free projects',
      'Timesheets tracking',
      'Invoicing included',
    ],
  }
};


export default config;
