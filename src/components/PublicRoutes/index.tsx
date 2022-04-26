import { Outlet, RouteProps, Navigate } from 'react-router-dom';

import { authVar } from "../../App/link";
import routes from "../../config/routes";
import constants from "../../config/constants";


interface IProps extends RouteProps {
  children?: any;
  redirect_to?: any
}

const PublicRoutes = (props: IProps) => {
  const authData = authVar();
  const roles = authData?.user?.roles ?? [];
  const isLoggedIn = authData?.isLoggedIn;

  const getRoutePath = () => {
    if (roles.includes(constants.roles.SuperAdmin)) {
      return routes.dashboard.path
    } else if (roles.includes(constants.roles.CompanyAdmin)) {
      return routes.company.path(authData?.company?.code);
    } else {
      return routes.home.path;
    }
  }

  return isLoggedIn ? <Navigate to={getRoutePath()} /> : props?.children ? props?.children : <Outlet/>

};

export default PublicRoutes;

