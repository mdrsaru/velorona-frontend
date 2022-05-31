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

export const roles_user = ['CompanyAdmin', 'Employee', 'TaskManager']

export default config;
