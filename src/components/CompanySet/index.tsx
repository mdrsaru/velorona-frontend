import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';

import routes from '../../config/routes';
import constants from '../../config/constants';
import { authVar } from "../../App/link";
import { AUTH } from '../../gql/auth.gql';
import { notifyGraphqlError } from '../../utils/error';
import { checkRoles } from '../../utils/common';
import { GraphQLResponse } from '../../interfaces/graphql.interface';
import { CompanyPagingResult, QueryCompanyArgs} from '../../interfaces/generated';

import RouteLoader from '../../components/Skeleton/RouteLoader';

const COMPANY_BY_CODE = gql`
  query CompanyById($input: CompanyQueryInput) {
    Company(input: $input) {
      data {
        id
        companyCode
        name
        subscriptionPeriodEnd
        logo {
          id
          name
          url
        }
      }
    }
  }
`;

/**
 * Set company information in authvar(reactive variable)
 */
const CompanySet = () => {
  const navigate = useNavigate();
  const authData = authVar();
  const isLoggedIn = authData?.isLoggedIn;
  const roles = authData?.user?.roles ?? [];
  const { id: companyCode } = useParams();
  const { data: authGqlData } = useQuery(AUTH)

  const isSuperAdmin = checkRoles({
    expectedRoles: [constants.roles.SuperAdmin],
    userRoles: roles,
  });

  const { data: companyData } = useQuery<
    GraphQLResponse<'Company', CompanyPagingResult>,
    QueryCompanyArgs
  >(COMPANY_BY_CODE, {
    skip: !isSuperAdmin,
    variables: {
      input: {
        query: {
          companyCode, 
        }
      }
    },
    onError: notifyGraphqlError,
    onCompleted(response) {
      if(response.Company?.data?.length) {
        const company = response.Company.data[0];

        authVar({
          ...authVar(),
          company: {
            code: company.companyCode,
            id: company.id,
            name: company.name,
            plan: company?.plan as string,
            subscriptionStatus: company?.subscriptionStatus as string,
            subscriptionPeriodEnd: company?.subscriptionPeriodEnd,
            logo:{
              id: company.logo?.id ?? null,
              name: company.logo?.name ?? null,
              url: company.logo?.url ?? null,
            }
          }
        })
      } else {
        navigate(routes.dashboard.path)
      }
    }
  });

  if(!isSuperAdmin || authGqlData?.AuthUser?.company?.id) {
    return <Outlet />
  }

  return <RouteLoader />;
};

export default CompanySet;

