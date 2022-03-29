import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Skeleton } from 'antd';

import routes from '../config/routes';
import NotFound from '../components/NotFound';
import AuthRoute from "../components/AuthRoute";
import constants from "../config/constants";
import Layout from "../components/Layout";

const _Routes = () => {
  return (
    <Router>
      <Routes>
        {/* public routes */}
        <Route path={routes.login.path}>
          <Route index element={<Suspense fallback={<Skeleton/>}>
            <routes.login.component/>
          </Suspense>}/>
          <Route path={routes.loginAdmin.path}
                 element={
                   <Suspense fallback={<Skeleton/>}>
                     <routes.login.component/>
                   </Suspense>
                 }/>
        </Route>

        {/* protected routes */}
        <Route path="/" element={<Layout/>}>
          <Route path={routes.company.path} element={<AuthRoute allowedRoles={[constants.roles.CompanyAdmin]}/>}>
            <Route index element={<Suspense fallback={<Skeleton/>}><routes.dashboard.component/></Suspense>}/>
            <Route path={routes.role.path} element={<Suspense fallback={<Skeleton/>}>
                <routes.role.component/>
              </Suspense>}/>
            <Route path={routes.addEmployee.path} element={<Suspense fallback={<Skeleton/>}>
                       <routes.addEmployee.component/>
                     </Suspense>}/>
            <Route path={routes.employee.path}>
              <Route index element={
                <Suspense fallback={<Skeleton/>}>
                  <routes.employee.component/>
                </Suspense>}/>
              <Route path={routes.editEmployee.path}
                     element={
                       <Suspense fallback={<Skeleton/>}>
                         <routes.editEmployee.component/>
                       </Suspense>
                     }/>
            </Route>
          </Route>
          <Route element={<AuthRoute allowedRoles={[constants.roles.SuperAdmin]}/>}>
            <Route path={routes.dashboard.path} element={
              <Suspense fallback={<Skeleton/>}>
                <routes.dashboard.component/>
              </Suspense>
            }/>
            <Route path={routes.companyAdmin.path}>
              <Route index element={<Suspense fallback={<Skeleton/>}>
                <routes.company.component/>
              </Suspense>}/>
              <Route path={routes.addCompany.path}
                     element={
                       <Suspense fallback={<Skeleton/>}>
                         <routes.addCompany.component/>
                       </Suspense>
                     }/>
            </Route>
          </Route>
          <Route element={<AuthRoute allowedRoles={[constants.roles.Employee]}/>}>
            <Route index element={<Suspense fallback={<Skeleton/>}><routes.home.component/></Suspense>}/>
            <Route path={routes.timesheet.path}>
              <Route index element={<Suspense fallback={<Skeleton/>}>
                <routes.timesheet.component/>
              </Suspense>}/>
              <Route path={routes.newTimesheet.path}
                     element={
                       <Suspense fallback={<Skeleton/>}>
                         <routes.newTimesheet.component/>
                       </Suspense>
                     }/>
              <Route path={routes.detailTimesheet.path}
                     element={
                       <Suspense fallback={<Skeleton/>}>
                         <routes.detailTimesheet.component/>
                       </Suspense>
                     }/>
            </Route>
            <Route path={routes.tasks.path} element={
              <Suspense fallback={<Skeleton/>}>
                <routes.tasks.component/>
              </Suspense>
            }/>

            <Route
              path={routes.schedule.path}
              element={
                <Suspense fallback={<Skeleton/>}>
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


