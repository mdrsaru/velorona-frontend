import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import NotFound from '../components/NotFound';
import Layout from "../components/Layout";
import CheckRoles from "../components/CheckRoles";

import routes from '../config/routes';
import constants from "../config/constants";

import LoginLoader from "../components/Skeleton/LoginLoader";
import RouteLoader from "../components/Skeleton/RouteLoader";
import PublicRoutes from "../components/PublicRoutes";
import {authVar} from "./link";
import TimeSheetLoader from '../components/Skeleton/TimeSheetLoader';


const _Routes = () => {
  const loginData = authVar();
  const roles = loginData?.user?.roles;
  const getRoute = () => {
    if (roles.includes(constants.roles.SuperAdmin)) {
      return routes.dashboard.path
    } else if(roles.includes(constants.roles.CompanyAdmin)) {
      return routes.company.path(loginData?.company?.code)
    } else {
      return routes.home.path
    }
  }

  return (
    <Router>
      <Routes>
        {/* public routes */}
        <Route path={routes.login.path}>
          <Route
            index
            element={
              <PublicRoutes>
                <Suspense fallback={<LoginLoader/>}>
                  <routes.login.component/>
                </Suspense>
              </PublicRoutes>
            }/>
          <Route
            path={routes.loginAdmin.childPath}
            element={
              <PublicRoutes>
                <Suspense fallback={<LoginLoader/>}>
                  <routes.login.component/>
                </Suspense>
              </PublicRoutes>
            }/>
        </Route>

        <Route path={routes.resetPassword.path}>
          <Route
            index
            element={
              <PublicRoutes>
                <Suspense fallback={<LoginLoader/>}>
                  <routes.resetPassword.component/>
                </Suspense>
              </PublicRoutes>
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
                <CheckRoles allowedRoles={[constants.roles.CompanyAdmin, constants.roles.Employee]}>
                  <Suspense fallback={<RouteLoader/>}>
                    {roles.includes(constants.roles.CompanyAdmin) ? <routes.dashboard.component/> : <routes.home.component/>}
                  </Suspense>
                </CheckRoles>
              }/>

            <Route
              path={routes.employeeTimesheet.childPath}
              element={
                <CheckRoles allowedRoles={[constants.roles.CompanyAdmin, constants.roles.SuperAdmin]}>
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.employeeTimesheet.component/>
                  </Suspense>
                </CheckRoles>
              }
            />

            <Route
              path={routes.timesheetInvoice.childPath}
              element={
                <CheckRoles allowedRoles={[constants.roles.CompanyAdmin, constants.roles.SuperAdmin]}>
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.timesheetInvoice.component/>
                  </Suspense>
                </CheckRoles>
              }
            />


            <Route path={routes.timesheet.childPath}>
              <Route
                index
                element={
                  <CheckRoles allowedRoles={[constants.roles.Employee]}>
                    <Suspense fallback={<TimeSheetLoader/>}>
                      <routes.timesheet.component/>
                    </Suspense>
                  </CheckRoles>
                }/>

              <Route
                path={routes.newTimesheet.childPath}
                element={
                  <Suspense fallback={<TimeSheetLoader/>}>
                    <routes.newTimesheet.component/>
                  </Suspense>
                }/>

              <Route
                path={routes.detailTimesheet.childPath}
                element={
                  <Suspense fallback={<TimeSheetLoader/>}>
                    <routes.detailTimesheet.component/>
                  </Suspense>
                }/>
            </Route>

            <Route
              path={routes.tasks.childPath}
              element={
                <CheckRoles allowedRoles={[constants.roles.Employee]}>
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.tasks.component/>
                  </Suspense>
                </CheckRoles>
              }/>

            <Route
              path={routes.schedule.childPath}
              element={
                <CheckRoles allowedRoles={[constants.roles.Employee]}>
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.schedule.component/>
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
              <Route
                path={routes.addTasksProject.childPath}
                element={
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.addTasksProject.component/>
                  </Suspense>
                }/>
              <Route
                path={routes.editProject.childPath}
                element={
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.editProject.component/>
                  </Suspense>
                }/>
              <Route
                path={routes.detailProject.childPath}
                element={
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.detailProject.component/>
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
                path={routes.editInvoice.childPath}
                element={
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.editInvoice.component/>
                  </Suspense>
                }
              />

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
              <Route
                path={routes.editClient.childPath}
                element={
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.editClient.component/>
                  </Suspense>
                }/>
            </Route>

            <Route path={routes.employee.childPath}>
              <Route
                index
                element={
                  <Suspense fallback={<RouteLoader/>}>
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
                path={routes.attachClient.childPath}
                element={
                  <Suspense fallback={<RouteLoader/>}>
                    <routes.attachClient.component/>
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
              <CheckRoles allowedRoles={[constants.roles.Employee]} redirect_to={getRoute()}>
                <Suspense fallback={<RouteLoader/>}>
                  <routes.home.component/>
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


