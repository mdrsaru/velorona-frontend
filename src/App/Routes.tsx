import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import routes from '../config/routes';
import NotFound from '../components/NotFound';
import AuthRoute from "../components/AuthRoute";
import constants from "../config/constants";
import Layout from "../components/Layout";
import AppLoader from "../components/Skeleton/AppLoader";
import LoginLoader from "../components/Skeleton/LoginLoader";
import RouteLoader from "../components/Skeleton/RouteLoader";

const _Routes = () => {
  return (
    <Router>
      <Routes>
        {/* public routes */}
        <Route path={routes.login.path}>
          <Route index element={<Suspense fallback={<LoginLoader/>}>
            <routes.login.component/>
          </Suspense>}/>
          <Route path={routes.loginAdmin.path}
                 element={
                   <Suspense fallback={<LoginLoader/>}>
                     <routes.login.component/>
                   </Suspense>
                 }/>
        </Route>

        {/* protected routes */}
        <Route path="/" element={<Layout/>}>
          <Route path={routes.company.path} element={<AuthRoute allowedRoles={[constants.roles.CompanyAdmin]}/>}>
            <Route index element={<Suspense fallback={<RouteLoader/>}><routes.dashboard.component/></Suspense>}/>
            <Route path={routes.role.path} element={<Suspense fallback={<RouteLoader/>}>
                <routes.role.component/>
              </Suspense>}/>
            <Route path={routes.addEmployee.path} element={<Suspense fallback={<RouteLoader/>}>
                       <routes.addEmployee.component/>
                     </Suspense>}/>
            <Route path={routes.employee.path}>
              <Route index element={
                <Suspense fallback={<AppLoader count={14}/> }>
                  <routes.employee.component/>
                </Suspense>}/>
              <Route path={routes.editEmployee.path}
                     element={
                       <Suspense fallback={<RouteLoader/>}>
                         <routes.editEmployee.component/>
                       </Suspense>
                     }/>
              <Route path={routes.detailEmployee.path}
                     element={
                       <Suspense fallback={<RouteLoader/>}>
                         <routes.detailEmployee.component/>
                       </Suspense>
                     }/>
            </Route>
          </Route>
          <Route element={<AuthRoute allowedRoles={[constants.roles.SuperAdmin]}/>}>
            <Route path={routes.dashboard.path} element={
              <Suspense fallback={<RouteLoader/>}>
                <routes.dashboard.component/>
              </Suspense>
            }/>
            <Route path={routes.companyAdmin.path}>
              <Route index element={<Suspense fallback={<RouteLoader/>}>
                <routes.company.component/>
              </Suspense>}/>
              <Route path={routes.addCompany.path}
                     element={
                       <Suspense fallback={<RouteLoader/>}>
                         <routes.addCompany.component/>
                       </Suspense>
                     }/>
            </Route>
          </Route>
          <Route element={<AuthRoute allowedRoles={[constants.roles.Employee]}/>}>
            <Route index element={<Suspense fallback={<RouteLoader/>}><routes.home.component/></Suspense>}/>
            <Route path={routes.timesheet.path}>
              <Route index element={<Suspense fallback={<RouteLoader/>}>
                <routes.timesheet.component/>
              </Suspense>}/>
              <Route path={routes.newTimesheet.path}
                     element={
                       <Suspense fallback={<RouteLoader/>}>
                         <routes.newTimesheet.component/>
                       </Suspense>
                     }/>
              <Route path={routes.detailTimesheet.path}
                     element={
                       <Suspense fallback={<RouteLoader/>}>
                         <routes.detailTimesheet.component/>
                       </Suspense>
                     }/>
            </Route>
            <Route path={routes.tasks.path} element={
              <Suspense fallback={<RouteLoader/>}>
                <routes.tasks.component/>
              </Suspense>
            }/>

            <Route
              path={routes.schedule.path}
              element={
                <Suspense fallback={<RouteLoader/>}>
                  <routes.schedule.component/>
                </Suspense>
              }/>
          </Route>
          <Route
            path="*"
            element={<NotFound/>}/>
        </Route>
      </Routes>
    </Router>
  );
};

export default _Routes;


