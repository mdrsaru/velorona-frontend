import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

import routes from '../../config/routes';

const NotFound = () => {

  return (
    <Result
      status="404"
      title="404"
      subTitle="Whoops! Page Not Found"
      extra={
        <Button type="primary">
          <Link to={routes.dashboard.path}>Back Home</Link>
        </Button>
      }
    />
  );
};

export default NotFound;

