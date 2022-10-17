export interface ILogin {
  id: string;
  token: string;
  refreshToken: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface ILoggedInUser {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IToken {
  token: string;
}

export interface IAuthUser {
  id: string | null;
  roles: string[];
  entryType?: string | null;
}

export interface ICompanyLogo{
  id:string | null;
  name:string | null;
  url:string | null;
}
export interface ICompanyUser {
  id: string | null;
  code: string;
  name:string;
  logo:ICompanyLogo;
  plan: string;
  subscriptionStatus:string;
  subscriptionPeriodEnd: Date | null,
}

export interface IAvatarUser {
  id: string | null;
  url: string | null;
}

export interface IAuth {
  token: string | null;
  user: IAuthUser;
  isLoggedIn: boolean;
  company?: ICompanyUser;
  fullName?:string | null;
  avatar?:IAvatarUser;
}

