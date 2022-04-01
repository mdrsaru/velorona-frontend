import {useQuery} from '@apollo/client';
import {Outlet, RouteProps, Navigate} from 'react-router-dom';

import {AUTH} from '../../gql/auth.gql';
import NotFound from "../NotFound";


interface IProps extends RouteProps {
  allowedRoles: string[]
  redirect_to?: string
  children?: any
}

const CheckRoles = (props: IProps) => {
  const {data: authData} = useQuery(AUTH);

  if (props?.redirect_to) {
    return <Navigate to={props?.redirect_to} />;
  }

  if (authData?.AuthUser?.user?.roles?.find((role: string) => props.allowedRoles?.includes(role))) {
    return props?.children ? props?.children : <Outlet/>
  }

  return (
    <NotFound/>
  )
};

export default CheckRoles;

