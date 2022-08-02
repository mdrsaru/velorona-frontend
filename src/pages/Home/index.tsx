import { Navigate } from 'react-router-dom';

import routes from '../../config/routes';
import { authVar } from '../../App/link';
import constants from '../../config/constants';

const Home = () => {
  const authData = authVar();
  const roles = authData?.user?.roles;
  const companyCode = authData?.company?.code;

  if (roles.includes(constants.roles.SuperAdmin)) {
    return <Navigate to={routes.dashboard.path} />
  } else if (roles.includes(constants.roles.CompanyAdmin)) {
    return <Navigate to={routes.company.path(companyCode)} />
  } else if (roles.includes(constants.roles.Employee)) {
    return <Navigate to={routes.company.path(companyCode)} />
  } else if (roles.includes(constants.roles.TaskManager)) {
    return <Navigate to={routes.company.path(companyCode)} />
  } else {
    return (
      <>
        <h1>Welcome</h1>
      </>
    )
  }
}

export default Home;
