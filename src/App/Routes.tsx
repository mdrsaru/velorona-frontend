import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Skeleton } from 'antd';

import routes from '../config/routes';
import NotFound from '../components/NotFound';
import Layout from '../components/Layout';
import constants from "../config/constants";

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
        <Route path="/"  element={<Layout allowedRoles={[constants.roles.Employee]}/>}>
          <Route index element={<Suspense fallback={<Skeleton/>}>
            <routes.home.component/>
          </Suspense>}/>
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
          <Route
            path={routes.tasks.path}
            element={
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
        <Route element={<Layout allowedRoles={[constants.roles.SuperAdmin]}/>}>
          <Route
            path={routes.dashboard.path}
            element={
              <Suspense fallback={<Skeleton/>}>
                <routes.dashboard.component/>
              </Suspense>
            }/>
          <Route path={routes.clientAdmin.path}>
            <Route index element={<Suspense fallback={<Skeleton/>}>
              <routes.client.component/>
            </Suspense>}/>
            <Route path={routes.addClient.path}
                   element={
                     <Suspense fallback={<Skeleton/>}>
                       <routes.addClient.component/>
                     </Suspense>
                   }/>
          </Route>
        </Route>
        <Route element={<Layout allowedRoles={[constants.roles.ClientAdmin]}/>}>
          <Route path={routes.clientDashboard.path}
            element={
              <Suspense fallback={<Skeleton/>}>
                <routes.dashboard.component/>
              </Suspense>
            }/>
          <Route path={routes.role.path} element={
            <Suspense fallback={<Skeleton/>}>
              <routes.role.component/>
            </Suspense>
          }/>
          <Route path={routes.addEmployee.path}
                 element={
                   <Suspense fallback={<Skeleton/>}>
                     <routes.addEmployee.component/>
                   </Suspense>
                 }/>
          <Route path={routes.employee.path} element={
            <Suspense fallback={<Skeleton/>}>
              <routes.employee.component/>
            </Suspense>
          }/>
          <Route
            path="*"
            element={<NotFound/>}/>
        </Route>
      </Routes>
    </Router>
  );
};

export default _Routes;


