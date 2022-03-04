const config = {
  apiUrl: process.env.REACT_APP_API_URL,
  graphqlEndpoint: process.env.REACT_APP_GRAPHQL_ENDPOINT,
  paging: {
    perPage: 25,
  },
  roles: {},
};

export default config;

export const columns = [
  {
    title: 'Start Date',
    dataIndex: 'start_date',
    key: 'start_date',
  },
  {
    title: 'End Date',
    dataIndex: 'end_date',
    key: 'end_date',
  },
  {
    title: 'Leave Days',
    dataIndex: 'leave_days',
    key: 'leave_days',
  },
  {
    title: 'Leave Type',
    dataIndex: 'leave_type',
    key: 'leave_type',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },
];

export const data = [
  {
    key: '1',
    start_date: '02-02-2022',
    end_date: '02-04-2022',
    leave_days: '2',
    leave_type: 'Personal',
    status: 'Pending'
  },
  {
    key: '2',
    start_date: '02-02-2022',
    end_date: '02-04-2022',
    leave_days: '2',
    leave_type: 'Personal',
    status: 'Pending'
  },
  {
    key: '3',
    start_date: '02-02-2022',
    end_date: '02-04-2022',
    leave_days: '2',
    leave_type: 'Personal',
    status: 'Pending'
  },
  {
    key: '4',
    start_date: '02-02-2022',
    end_date: '02-04-2022',
    leave_days: '2',
    leave_type: 'Personal',
    status: 'Pending'
  },
];
