import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import NotFound from '../components/NotFound';
import Layout from '../components/Layout';
import CheckRoles from '../components/CheckRoles';

import routes from '../config/routes';

import LoginLoader from '../components/Skeleton/LoginLoader';
import RouteLoader from '../components/Skeleton/RouteLoader';
import PublicRoutes from '../components/PublicRoutes';
import TimeSheetLoader from '../components/Skeleton/TimeSheetLoader';
import CompanySet from '../components/CompanySet';

const _Routes = () => {

  return (
    <Router>
      <Routes>
        {/* public routes */}
        <Route path={routes.login.path}>
          <Route
            index
            element={
              <PublicRoutes>
                <Suspense fallback={<LoginLoader />}>
                  <routes.login.component />
                </Suspense>
              </PublicRoutes>
            }
          />
          <Route
            path={routes.loginAdmin.childPath}
            element={
              <PublicRoutes>
                <Suspense fallback={<LoginLoader />}>
                  <routes.login.component />
                </Suspense>
              </PublicRoutes>
            }
          />
        </Route>

        <Route path={routes.resetPassword.path}>
          <Route
            index
            element={
              <PublicRoutes>
                <Suspense fallback={<LoginLoader />}>
                  <routes.resetPassword.component />
                </Suspense>
              </PublicRoutes>
            }
          />
        </Route>

        {/* protected routes */}
        <Route path={routes.home.path} element={<Layout />}>
          <Route
            index
            element={
              <Suspense fallback={<RouteLoader />}>
                <routes.home.component />
              </Suspense>
            }
          />

          <Route
            path={routes.role.path}
            element={
              <CheckRoles allowedRoles={routes.role.allowedRoles}>
                <Suspense fallback={<RouteLoader />}>
                  <routes.role.component />
                </Suspense>
              </CheckRoles>
            }
          />

		<Route path={routes.superAdmin.path}>
		<Route
            index
            element={
                <Suspense fallback={<RouteLoader />}>
                  <routes.superAdmin.component />
                </Suspense>
            }
          />

		 <Route
            path={routes.editSuperAdmin.childPath}
            element={
              <CheckRoles allowedRoles={routes.addSuperAdmin.allowedRoles}>
                <Suspense fallback={<RouteLoader />}>
                  <routes.editSuperAdmin.component />
                </Suspense>
              </CheckRoles>
            }
          />
          <Route
            path={routes.addSuperAdmin.path}
            element={
              <CheckRoles allowedRoles={routes.addSuperAdmin.allowedRoles}>
                <Suspense fallback={<RouteLoader />}>
                  <routes.addSuperAdmin.component />
                </Suspense>
              </CheckRoles>
            }
          />
		   <Route
            path={routes.viewSuperAdmin.childPath}
            element={
              <CheckRoles allowedRoles={routes.addSuperAdmin.allowedRoles}>
                <Suspense fallback={<RouteLoader />}>
                  <routes.viewSuperAdmin.component />
                </Suspense>
              </CheckRoles>
            }
          />
          </Route>

          <Route 
            path={routes.demoRequest.path}
            element={
              <Suspense fallback={<RouteLoader />}>
                <routes.demoRequest.component />
              </Suspense>
            }
          />

          <Route path={routes.invoicePaymentConfig.path}>
            <Route
              index
              element={
                <Suspense fallback={<RouteLoader />}>
                  <routes.invoicePaymentConfig.component />
                </Suspense>
              }
            />
          </Route>

          <Route 
            path={routes.payments.path}
            element={
              <Suspense fallback={<RouteLoader />}>
                <routes.payments.component />
              </Suspense>
            }
          />

					<Route
            path={routes.dashboard.path}
            element={
              <CheckRoles allowedRoles={routes.dashboard.allowedRoles}>
                <Suspense fallback={<RouteLoader />}>
                  <routes.dashboard.component />
                </Suspense>
              </CheckRoles>
            }
          />

          <Route 
            path={routes.companyAdmin.path}
            element={<CheckRoles allowedRoles={routes.companyAdmin.allowedRoles} />}
          >
            <Route
              index
              element={
                <Suspense fallback={<RouteLoader />}>
                  <routes.companyAdmin.component />
                </Suspense>
              }
            />

            <Route
              path={routes.addCompany.childPath}
              element={
                <Suspense fallback={<RouteLoader />}>
                  <routes.addCompany.component />
                </Suspense>
              }
            />

            <Route
              path={routes.editCompany.childPath}
              element={
                <Suspense fallback={<RouteLoader />}>
                  <routes.editCompany.component />
                </Suspense>
              }
            />
          </Route>

          <Route
            path={routes.editProfile.childPath}
            element={
              <Suspense fallback={<RouteLoader />}>
                <routes.editProfile.component />
              </Suspense>
            }
          />

          <Route path={routes.company.childPath} element={<CompanySet />}>
            <Route
              index
              element={
                  <Suspense fallback={<RouteLoader />}>
                    <routes.company.component />
                  </Suspense>
              }
            />

            <Route
              path={routes.employeeTimesheet.childPath}
              element={
                <CheckRoles allowedRoles={routes.employeeTimesheet.allowedRoles}>
                  <Suspense fallback={<RouteLoader />}>
                    <routes.employeeTimesheet.component />
                  </Suspense>
                </CheckRoles>
              }
            />

            <Route
              path={routes.timesheetInvoice.childPath}
              element={
                <CheckRoles allowedRoles={routes.timesheetInvoice.allowedRoles}>
                  <Suspense fallback={<RouteLoader />}>
                    <routes.timesheetInvoice.component />
                  </Suspense>
                </CheckRoles>
              }
            />
 			<Route
                path={routes.timeTracker.childPath}
                element={
                  <Suspense fallback={<TimeSheetLoader />}>
                    <routes.timeTracker.component />
                  </Suspense>
                }
              />

            <Route path={routes.timesheet.childPath}>
              <Route
                index
                element={
                  <CheckRoles allowedRoles={routes.timesheet.allowedRoles}>
                    <Suspense fallback={<TimeSheetLoader />}>
                      <routes.timesheet.component />
                    </Suspense>
                  </CheckRoles>
                }
              />

              <Route
                path={routes.newTimesheet.childPath}
                element={
                  <Suspense fallback={<TimeSheetLoader />}>
                    <routes.newTimesheet.component />
                  </Suspense>
                }
              />

              <Route
                path={routes.detailTimesheet.childPath}
                element={
                  <CheckRoles allowedRoles={routes.detailTimesheet.allowedRoles}>
                    <Suspense fallback={<TimeSheetLoader />}>
                      <routes.detailTimesheet.component />
                    </Suspense>
                  </CheckRoles>
                } />
            </Route>

            <Route
              path={routes.employeeSchedule.childPath}
              element={
                <CheckRoles allowedRoles={routes.employeeSchedule.allowedRoles}>
                  <Suspense fallback={<RouteLoader />}>
                    <routes.employeeSchedule.component />
                  </Suspense>
                </CheckRoles>
              }
            />

            <Route
              path={routes.schedule.childPath}
              element={
                <CheckRoles allowedRoles={routes.schedule.allowedRoles}>
                  <Suspense fallback={<RouteLoader />}>
                    <routes.schedule.component />
                  </Suspense>
                </CheckRoles>
              }
            />

            <Route
              path={routes.detailSchedule.childPath}
              element={
                <CheckRoles allowedRoles={routes.detailSchedule.allowedRoles}>
                  <Suspense fallback={<RouteLoader />}>
                    <routes.detailSchedule.component />
                  </Suspense>
                </CheckRoles>
              }
            />

          <Route
                path={routes.reports.childPath}
                element={
                <Suspense fallback={<RouteLoader />}>
                  <routes.reports.component />
                </Suspense>
                }
              />
            <Route
              path={routes.projects.childPath}
              element={<CheckRoles allowedRoles={routes.projects.allowedRoles} />}
            >
              <Route
                index
                element={
                  <Suspense fallback={<RouteLoader />}>
                    <routes.projects.component />
                  </Suspense>
                }
              />
              <Route
                path={routes.addProject.childPath}
                element={
                  <Suspense fallback={<RouteLoader />}>
                    <routes.addProject.component />
                  </Suspense>
                }
              />
              <Route
                path={routes.addTasksProject.childPath}
                element={
                  <Suspense fallback={<RouteLoader />}>
                    <routes.addTasksProject.component />
                  </Suspense>
                }
              />
              <Route
                path={routes.editTasksProject.childPath}
                element={
                  <Suspense fallback={<RouteLoader />}>
                    <routes.editTasksProject.component />
                  </Suspense>
                }
              />
              <Route
                path={routes.editProject.childPath}
                element={
                  <Suspense fallback={<RouteLoader />}>
                    <routes.editProject.component />
                  </Suspense>
                }
              />
              <Route
                path={routes.detailProject.childPath}
                element={
                  <Suspense fallback={<RouteLoader />}>
                    <routes.detailProject.component />
                  </Suspense>
                }
              />
            </Route>

            <Route
              path={routes.invoice.childPath}
              element={<CheckRoles allowedRoles={routes.invoice.allowedRoles} />}
            >
              <Route
                index
                element={
                  <Suspense fallback={<RouteLoader />}>
                    <routes.invoice.component />
                  </Suspense>
                }
              />

              <Route
                path={routes.editInvoice.childPath}
                element={
                  <Suspense fallback={<RouteLoader />}>
                    <routes.editInvoice.component />
                  </Suspense>
                }
              />

              <Route
                path={routes.addInvoice.childPath}
                element={
                  <Suspense fallback={<RouteLoader />}>
                    <routes.addInvoice.component />
                  </Suspense>
                }
              />
            </Route>

            <Route
              path={routes.client.childPath}
              element={<CheckRoles allowedRoles={routes.client.allowedRoles} />}
            >
              <Route
                index
                element={
                  <Suspense fallback={<RouteLoader />}>
                    <routes.client.component />
                  </Suspense>
                }
              />
              <Route
                path={routes.addClient.childPath}
                element={
                  <Suspense fallback={<RouteLoader />}>
                    <routes.addClient.component />
                  </Suspense>
                }
              />
              <Route
                path={routes.editClient.childPath}
                element={
                  <Suspense fallback={<RouteLoader />}>
                    <routes.editClient.component />
                  </Suspense>
                }
              />

              <Route
                path={routes.viewClient.childPath}
                element={
                  <Suspense fallback={<RouteLoader />}>
                    <routes.viewClient.component />
                  </Suspense>
                }
              />
            </Route>

            <Route 
              path={routes.user.childPath}
              element={<CheckRoles allowedRoles={routes.user.allowedRoles} />}
            >
              <Route
                index
                element={
                  <Suspense fallback={<RouteLoader />}>
                    <routes.user.component />
                  </Suspense>
                }
              />

              <Route
                path={routes.addEmployee.childPath}
                element={
                  <Suspense fallback={<RouteLoader />}>
                    <routes.addEmployee.component />
                  </Suspense>
                }
              />

              <Route
                path={routes.attachClient.childPath}
                element={
                  <Suspense fallback={<RouteLoader />}>
                    <routes.attachClient.component />
                  </Suspense>
                }
              />

              <Route
                path={routes.editEmployee.childPath}
                element={
                  <Suspense fallback={<RouteLoader />}>
                    <routes.editEmployee.component />
                  </Suspense>
                }
              />

              <Route
                path={routes.detailEmployee.childPath}
                element={
                  <Suspense fallback={<RouteLoader />}>
                    <routes.detailEmployee.component />
                  </Suspense>
                }
              />
            </Route>

            <Route
              path={routes.subscription.childPath}
              element={
                <CheckRoles allowedRoles={routes.subscription.allowedRoles}>
                  <Suspense fallback={<RouteLoader />}>
                    <routes.subscription.component />
                  </Suspense>
                </CheckRoles>
              }
            />
          </Route>

          <Route
            path={routes.profile.childPath}
            element={
              <Suspense fallback={<RouteLoader />}>
                <routes.profile.component />
              </Suspense>
            }
          />

          <Route
            path={routes.companySetting.childPath}
            element={
              <CheckRoles allowedRoles={routes.companySetting.allowedRoles}>
                <Suspense fallback={<RouteLoader />}>
                  <routes.companySetting.component />
                </Suspense>
              </CheckRoles>
            }
          />

          <Route
            path={routes.editCompanySetting.childPath}
            element={
              <CheckRoles allowedRoles={routes.editCompanySetting.allowedRoles}>
                <Suspense fallback={<RouteLoader />}>
                  <routes.editCompanySetting.component />
                </Suspense>
              </CheckRoles>
            }
          />

          <Route
            path={routes.changePassword.childPath}
            element={
              <Suspense fallback={<RouteLoader />}>
                <routes.changePassword.component />
              </Suspense>
            }
          />

		<Route
            path={routes.privacyPolicy.childPath}
            element={
              <Suspense fallback={<RouteLoader />}>
                <routes.privacyPolicy.component />
              </Suspense>
            }
          />

		<Route
            path={routes.cookiePolicy.childPath}
            element={
              <Suspense fallback={<RouteLoader />}>
                <routes.cookiePolicy.component />
              </Suspense>
            }
          />	
		  
		<Route
		  path={routes.termsAndCondition.childPath}
		  element={
			<Suspense fallback={<RouteLoader />}>
			  <routes.termsAndCondition.component />
			</Suspense>
		  }
		/>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default _Routes;
