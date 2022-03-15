import { authVar } from "../../App/link";
import { Navigate } from "react-router-dom";

import routes from "../../config/routes";

const AuthRoute = ({ children }: { children: JSX.Element }) => {
  const auth = authVar();

  return auth.isLoggedIn ? children : <Navigate to={routes.login.path} />;
}

export default AuthRoute
