const config = {
  apiUrl: process.env.REACT_APP_API_URL,
  graphqlEndpoint: process.env.REACT_APP_GRAPHQL_ENDPOINT,
  paging: {
    perPage: 25,
  },
  roles: {
    SuperAdmin: 'SuperAdmin',
    CompanyAdmin: 'CompanyAdmin',
    ClientAdmin: 'ClientAdmin',
    Employee: 'Employee',
    TaskManager: 'TaskManager',
    Vendor: 'Vendor',
  },
};

export default config;
