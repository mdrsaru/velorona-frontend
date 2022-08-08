
import { authVar } from '../../App/link';
import constants from '../../config/constants';
import CompanyAdminDashboard from './CompanyAdminDashboard';
import TaskManagerDashboard from './TaskManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import Home from '../Home';

const CompanyDashboard = () => {
  const authData = authVar()
  const roles = authData?.user?.roles;

  if(roles.includes(constants.roles.CompanyAdmin) ||roles.includes(constants.roles.SuperAdmin)  ){
	return <CompanyAdminDashboard/>
  }
  else if (roles.includes(constants.roles.TaskManager) ){
	return <TaskManagerDashboard/>
  }

  else if (roles.includes(constants.roles.Employee) ){
	return <EmployeeDashboard/>
  }

  else {
	return <Home/>
  }

}

export default CompanyDashboard
