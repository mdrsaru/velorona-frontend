import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import NotFound from '../components/NotFound';
import Layout from "../components/Layout";
import CheckRoles from "../components/CheckRoles";

import routes from '../config/routes';
import constants from "../config/constants";

import AppLoader from "../components/Skeleton/AppLoader";
import LoginLoader from "../components/Skeleton/LoginLoader";
import RouteLoader from "../components/Skeleton/RouteLoader";

const _Routes = () => {
  return (
    <Router>
      <Routes>
        {/* public routes */}
        <Route path={routes.login.path}>
          <Route
            index
            element={
              <Suspense fallback={<LoginLoader/>}>
                <routes.login.component/>
              </Suspense>
            }/>
          <Route
            path={routes.loginAdmin.childPath}
            element={
              <Suspense fallback={<LoginLoader/>}>
                <routes.login.component/>
              </Suspense>
            }/>
        </Route>

        {/* protected routes */}
        <Route path={routes.home.path} element={<Layout/>}>

          <Route
            path={routes.role.path}
            element={
              <CheckRoles allowedRoles={[constants.roles.SuperAdmin]}>
                <Suspense fallback={<RouteLoader/>}>
                  <routes.role.component/>
                </Suspense>
              </CheckRoles>
            }/>

          <Route path={routes.company.childPath}>
            <Route
              index
              element={
                <CheckRoles allowedRoles={[constants.roles.CompanyAdmin]}>
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.dashboard.component/>
                  </Suspense>
                </CheckRoles>
              }/>

            <Route path={routes.projects.childPath}>
              <Route index element={
                <CheckRoles allowedRoles={[constants.roles.CompanyAdmin]}>
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.projects.component/>
                  </Suspense>
                </CheckRoles>
              }/>
              <Route
                path={routes.addProject.childPath}
                element={
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.addProject.component/>
                  </Suspense>
                }/>
            </Route>

            <Route path={routes.invoice.childPath}>
              <Route index element={
                <CheckRoles allowedRoles={[constants.roles.CompanyAdmin]}>
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.invoice.component/>
                  </Suspense>
                </CheckRoles>
              }/>
              <Route
                path={routes.addInvoice.childPath}
                element={
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.addInvoice.component/>
                  </Suspense>
                }/>
            </Route>

            <Route path={routes.client.childPath}>
              <Route index element={
                <CheckRoles allowedRoles={[constants.roles.CompanyAdmin]}>
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.client.component/>
                  </Suspense>
                </CheckRoles>
              }/>
              <Route
                path={routes.addClient.childPath}
                element={
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.addClient.component/>
                  </Suspense>
                }/>
            </Route>

            <Route path={routes.employee.childPath}>
              <Route
                index
                element={
                  <Suspense fallback={<AppLoader count={14}/>}>
                    <routes.employee.component/>
                  </Suspense>
                }/>

              <Route
                path={routes.addEmployee.childPath}
                element={
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.addEmployee.component/>
                  </Suspense>
                }/>

              <Route
                path={routes.editEmployee.childPath}
                element={
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.editEmployee.component/>
                  </Suspense>
                }/>

              <Route
                path={routes.detailEmployee.childPath}
                element={
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.detailEmployee.component/>
                  </Suspense>
                }/>

            </Route>
          </Route>

          <Route
            path={routes.dashboard.path}
            element={
              <CheckRoles allowedRoles={[constants.roles.SuperAdmin]}>
                <Suspense fallback={<RouteLoader/>}>
                  <routes.dashboard.component/>
                </Suspense>
              </CheckRoles>
            }/>

          <Route path={routes.companyAdmin.path}>
            <Route
              index
              element={
                <CheckRoles allowedRoles={[constants.roles.SuperAdmin]}>
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.company.component/>
                  </Suspense>
                </CheckRoles>
              }/>

            <Route
              path={routes.addCompany.childPath}
              element={
                <Suspense fallback={<RouteLoader/>}>
                  <routes.addCompany.component/>
                </Suspense>
              }/>

          </Route>

          <Route
            index
            element={
              <CheckRoles allowedRoles={[constants.roles.Employee]}>
                <Suspense fallback={<RouteLoader/>}>
                  <routes.home.component/>
                </Suspense>
              </CheckRoles>
            }/>

          <Route path={routes.timesheet.path}>
            <Route
              index
              element={
                <CheckRoles allowedRoles={[constants.roles.Employee]}>
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.timesheet.component/>
                  </Suspense>
                </CheckRoles>
              }/>

            <Route
              path={routes.newTimesheet.childPath}
              element={
                <Suspense fallback={<RouteLoader/>}>
                  <routes.newTimesheet.component/>
                </Suspense>
              }/>

            <Route
              path={routes.detailTimesheet.childPath}
              element={
                <Suspense fallback={<RouteLoader/>}>
                  <routes.detailTimesheet.component/>
                </Suspense>
              }/>

          </Route>

          <Route
            path={routes.tasks.path}
            element={
              <CheckRoles allowedRoles={[constants.roles.Employee]}>
                <Suspense fallback={<RouteLoader/>}>
                  <routes.tasks.component/>
                </Suspense>
              </CheckRoles>
            }/>

          <Route
            path={routes.schedule.path}
            element={
              <CheckRoles allowedRoles={[constants.roles.Employee]}>
                <Suspense fallback={<RouteLoader/>}>
                  <routes.schedule.component/>
                </Suspense>
              </CheckRoles>
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


