const config = {
  apiUrl: process.env.REACT_APP_API_URL,
  graphqlEndpoint: process.env.REACT_APP_GRAPHQL_ENDPOINT,
  paging: {
    perPage: 25,
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
  }
};

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

export const user_status = [{
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

export default config;
