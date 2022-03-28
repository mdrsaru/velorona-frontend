import { useQuery } from '@apollo/client';
import { Outlet, RouteProps } from 'react-router-dom';

import { AUTH } from '../../gql/auth.gql';
import NotFound from "../NotFound";


interface IProps extends RouteProps {
  allowedRoles?: string[]
}

const _AuthRoute = (props: IProps) => {
  const { data: authData } = useQuery(AUTH);

  return (
      <>
        {authData?.AuthUser?.user?.roles?.find((role: string) => props.allowedRoles?.includes(role)) ? <Outlet /> : <NotFound/>}
      </>
  )
};

export default _AuthRoute;

