export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
  DateTime: any;
};

export type Address = {
  __typename?: 'Address';
  aptOrSuite?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  state?: Maybe<Scalars['String']>;
  streetAddress: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  zipcode?: Maybe<Scalars['String']>;
};

export type AddressCreateInput = {
  aptOrSuite?: InputMaybe<Scalars['String']>;
  city: Scalars['String'];
  state: Scalars['String'];
  streetAddress: Scalars['String'];
  zipcode: Scalars['String'];
};

export type AddressInput = {
  aptOrSuite?: InputMaybe<Scalars['String']>;
  city: Scalars['String'];
  state: Scalars['String'];
  streetAddress: Scalars['String'];
  zipcode: Scalars['String'];
};

export type AddressUpdateInput = {
  aptOrSuite?: InputMaybe<Scalars['String']>;
  city: Scalars['String'];
  id?: InputMaybe<Scalars['String']>;
  state: Scalars['String'];
  streetAddress: Scalars['String'];
  zipcode: Scalars['String'];
};

export enum AdminRole {
  SuperAdmin = 'SuperAdmin'
}

export type AssignTaskInput = {
  task_id: Scalars['String'];
  user_id: Array<Scalars['String']>;
};

export type AssignedUserQueryInput = {
  company_id: Scalars['String'];
  id: Scalars['String'];
};

export type AssociateUserClientInput = {
  client_id: Scalars['String'];
  user_id: Scalars['String'];
};

export type ChangeProfilePictureInput = {
  avatar_id: Scalars['String'];
  id: Scalars['String'];
};

export type Client = {
  __typename?: 'Client';
  address: Address;
  address_id: Scalars['String'];
  archived: Scalars['Boolean'];
  company?: Maybe<Company>;
  company_id: Scalars['String'];
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  id: Scalars['ID'];
  invoicingEmail: Scalars['String'];
  name: Scalars['String'];
  status: ClientStatus;
  updatedAt: Scalars['DateTime'];
};

export type ClientCreateInput = {
  address: AddressInput;
  archived?: InputMaybe<Scalars['Boolean']>;
  company_id: Scalars['String'];
  email: Scalars['String'];
  invoicingEmail: Scalars['String'];
  name: Scalars['String'];
  status?: InputMaybe<ClientStatus>;
};

export type ClientDeleteInput = {
  company_id: Scalars['String'];
  id: Scalars['String'];
};

export type ClientPagingResult = {
  __typename?: 'ClientPagingResult';
  data: Array<Client>;
  paging: PagingResult;
};

export type ClientQuery = {
  archived?: InputMaybe<Scalars['Boolean']>;
  company_id: Scalars['String'];
  id?: InputMaybe<Scalars['String']>;
};

export type ClientQueryInput = {
  paging?: InputMaybe<PagingInput>;
  query: ClientQuery;
};

export enum ClientStatus {
  Active = 'Active',
  Inactive = 'Inactive'
}

export type ClientUpdateInput = {
  address?: InputMaybe<AddressInput>;
  archived?: InputMaybe<Scalars['Boolean']>;
  company_id: Scalars['String'];
  id: Scalars['String'];
  name?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<ClientStatus>;
};

export type Company = {
  __typename?: 'Company';
  archived: Scalars['Boolean'];
  companyCode: Scalars['String'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  name: Scalars['String'];
  status: CompanyStatus;
  updatedAt: Scalars['DateTime'];
  users: Array<User>;
  workschedules?: Maybe<Workschedule>;
};

export type CompanyCreateInput = {
  archived?: InputMaybe<Scalars['Boolean']>;
  name: Scalars['String'];
  status: CompanyStatus;
};

export type CompanyPagingResult = {
  __typename?: 'CompanyPagingResult';
  data: Array<Company>;
  paging: PagingResult;
};

export type CompanyQuery = {
  archived?: InputMaybe<Scalars['Boolean']>;
  companyCode?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
};

export type CompanyQueryInput = {
  paging?: InputMaybe<PagingInput>;
  query?: InputMaybe<CompanyQuery>;
};

export enum CompanyRole {
  Client = 'Client',
  CompanyAdmin = 'CompanyAdmin',
  Employee = 'Employee',
  TaskManager = 'TaskManager'
}

export enum CompanyStatus {
  Active = 'Active',
  Inactive = 'Inactive'
}

export type CompanyUpdateInput = {
  archived?: InputMaybe<Scalars['Boolean']>;
  id: Scalars['String'];
  name?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<CompanyStatus>;
};

export type DeleteInput = {
  id: Scalars['String'];
};

export type ForgotPasswordInput = {
  companyCode?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  userType: ForgotPasswordUserType;
};

export enum ForgotPasswordUserType {
  Company = 'Company',
  SystemAdmin = 'SystemAdmin'
}

export type Invitation = {
  __typename?: 'Invitation';
  company: Company;
  company_id: Scalars['String'];
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  expiresIn: Scalars['DateTime'];
  id: Scalars['ID'];
  inviter: User;
  inviter_id: Scalars['String'];
  role: RoleName;
  status: InvitationStatus;
  token: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type InvitationCreateInput = {
  company_id: Scalars['String'];
  email: Scalars['String'];
  role: RoleName;
};

export type InvitationPagingResult = {
  __typename?: 'InvitationPagingResult';
  data: Array<Invitation>;
  paging: PagingResult;
};

export type InvitationQuery = {
  company_id: Scalars['String'];
  id?: InputMaybe<Scalars['String']>;
  inviter_id?: InputMaybe<Scalars['String']>;
  role?: InputMaybe<RoleName>;
};

export type InvitationQueryInput = {
  paging?: InputMaybe<PagingInput>;
  query: InvitationQuery;
};

export type InvitationRegisterInput = {
  address: AddressCreateInput;
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  middleName?: InputMaybe<Scalars['String']>;
  password: Scalars['String'];
  phone: Scalars['String'];
  token: Scalars['String'];
};

export type InvitationRegisterResponse = {
  __typename?: 'InvitationRegisterResponse';
  id: Scalars['String'];
};

export type InvitationRenewInput = {
  company_id: Scalars['String'];
  id: Scalars['String'];
};

export enum InvitationStatus {
  Approved = 'Approved',
  Pending = 'Pending'
}

export type LoginInput = {
  companyCode?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  password: Scalars['String'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  company?: Maybe<Company>;
  id: Scalars['String'];
  refreshToken: Scalars['String'];
  roles: Array<Role>;
  token: Scalars['String'];
};

export type Media = {
  __typename?: 'Media';
  createdAt: Scalars['DateTime'];
  id: Scalars['String'];
  name: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  url: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  AssignTask: Task;
  AssociateUserWithClient: UserClient;
  ChangeProfilePicture: User;
  ClientCreate: Client;
  ClientDelete: Client;
  ClientUpdate: Client;
  CompanyCreate: Company;
  CompanyDelete: Company;
  CompanyUpdate: Company;
  ForgotPassword: Scalars['String'];
  InvitationCreate: Invitation;
  InvitationRenew: Invitation;
  Login: LoginResponse;
  Logout: Scalars['Boolean'];
  ProjectCreate: Project;
  ProjectUpdate: Project;
  RegisterWithInvitation: InvitationRegisterResponse;
  ResetPassword: Scalars['String'];
  RoleCreate: Role;
  RoleDelete: Role;
  RoleUpdate: Role;
  StopTimesheet: Timesheet;
  TaskCreate: Task;
  TaskDelete: Task;
  TaskUpdate: Task;
  TimesheetCreate: Timesheet;
  TimesheetDelete: Timesheet;
  TimesheetUpdate: Timesheet;
  UserAdminCreate: User;
  UserArchive: User;
  /** Create user related to company */
  UserCreate: User;
  UserUpdate: User;
  WorkscheduleCreate: Workschedule;
  WorkscheduleDelete: Workschedule;
  WorkscheduleUpdate: Workschedule;
};


export type MutationAssignTaskArgs = {
  input: AssignTaskInput;
};


export type MutationAssociateUserWithClientArgs = {
  input: AssociateUserClientInput;
};


export type MutationChangeProfilePictureArgs = {
  input: ChangeProfilePictureInput;
};


export type MutationClientCreateArgs = {
  input: ClientCreateInput;
};


export type MutationClientDeleteArgs = {
  input: ClientDeleteInput;
};


export type MutationClientUpdateArgs = {
  input: ClientUpdateInput;
};


export type MutationCompanyCreateArgs = {
  input: CompanyCreateInput;
};


export type MutationCompanyDeleteArgs = {
  input: DeleteInput;
};


export type MutationCompanyUpdateArgs = {
  input: CompanyUpdateInput;
};


export type MutationForgotPasswordArgs = {
  input: ForgotPasswordInput;
};


export type MutationInvitationCreateArgs = {
  input: InvitationCreateInput;
};


export type MutationInvitationRenewArgs = {
  input: InvitationRenewInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationProjectCreateArgs = {
  input: ProjectCreateInput;
};


export type MutationProjectUpdateArgs = {
  input: ProjectUpdateInput;
};


export type MutationRegisterWithInvitationArgs = {
  input: InvitationRegisterInput;
};


export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};


export type MutationRoleCreateArgs = {
  input: RoleCreateInput;
};


export type MutationRoleDeleteArgs = {
  input: DeleteInput;
};


export type MutationRoleUpdateArgs = {
  input: RoleUpdateInput;
};


export type MutationStopTimesheetArgs = {
  input: StopTimesheetInput;
};


export type MutationTaskCreateArgs = {
  input: TaskCreateInput;
};


export type MutationTaskDeleteArgs = {
  input: DeleteInput;
};


export type MutationTaskUpdateArgs = {
  input: TaskUpdateInput;
};


export type MutationTimesheetCreateArgs = {
  input: TimesheetCreateInput;
};


export type MutationTimesheetDeleteArgs = {
  input: DeleteInput;
};


export type MutationTimesheetUpdateArgs = {
  input: TimesheetUpdateInput;
};


export type MutationUserAdminCreateArgs = {
  input: UserAdminCreateInput;
};


export type MutationUserArchiveArgs = {
  input: UserArchiveInput;
};


export type MutationUserCreateArgs = {
  input: UserCreateInput;
};


export type MutationUserUpdateArgs = {
  input: UserUpdateInput;
};


export type MutationWorkscheduleCreateArgs = {
  input: WorkscheduleCreateInput;
};


export type MutationWorkscheduleDeleteArgs = {
  input: DeleteInput;
};


export type MutationWorkscheduleUpdateArgs = {
  input: WorkscheduleUpdateInput;
};

export type PagingInput = {
  /** Sort order */
  order?: InputMaybe<Array<Scalars['String']>>;
  /** Number to skip */
  skip?: InputMaybe<Scalars['Int']>;
  /** Limit - max number of entities that should be taken */
  take?: InputMaybe<Scalars['Int']>;
};

export type PagingResult = {
  __typename?: 'PagingResult';
  endIndex: Scalars['Int'];
  hasNextPage: Scalars['Boolean'];
  startIndex: Scalars['Int'];
  /** Total number of entities with the provided filter/query */
  total: Scalars['Int'];
};

export type Project = {
  __typename?: 'Project';
  client: User;
  client_id: Scalars['String'];
  company: Company;
  company_id: Scalars['String'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  name: Scalars['String'];
  /** Field for timesheet */
  timesheet?: Maybe<Timesheet>;
  updatedAt: Scalars['DateTime'];
};

export type ProjectCreateInput = {
  client_id: Scalars['String'];
  company_id: Scalars['String'];
  name: Scalars['String'];
};

export type ProjectPagingResult = {
  __typename?: 'ProjectPagingResult';
  data: Array<Project>;
  paging: PagingResult;
};

export type ProjectQuery = {
  client_id?: InputMaybe<Scalars['String']>;
  /** Query by company id */
  company_id: Scalars['String'];
  id?: InputMaybe<Scalars['String']>;
};

export type ProjectQueryInput = {
  paging?: InputMaybe<PagingInput>;
  query: ProjectQuery;
};

export type ProjectUpdateInput = {
  company_id: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  AssignedUser: Array<User>;
  Client: ClientPagingResult;
  Company: CompanyPagingResult;
  Invitation: InvitationPagingResult;
  Project: ProjectPagingResult;
  Role: RolePagingResult;
  SearchClient: UserPagingResult;
  Task: TaskPagingResult;
  Timesheet: TimesheetPagingResult;
  User: UserPagingResult;
  Workschedule: WorkschedulePagingResult;
  me: User;
};


export type QueryAssignedUserArgs = {
  input?: InputMaybe<AssignedUserQueryInput>;
};


export type QueryClientArgs = {
  input: ClientQueryInput;
};


export type QueryCompanyArgs = {
  input?: InputMaybe<CompanyQueryInput>;
};


export type QueryInvitationArgs = {
  input: InvitationQueryInput;
};


export type QueryProjectArgs = {
  input: ProjectQueryInput;
};


export type QueryRoleArgs = {
  input?: InputMaybe<RoleQueryInput>;
};


export type QuerySearchClientArgs = {
  input?: InputMaybe<UserQueryInput>;
};


export type QueryTaskArgs = {
  input: TaskQueryInput;
};


export type QueryTimesheetArgs = {
  input: TimesheetQueryInput;
};


export type QueryUserArgs = {
  input?: InputMaybe<UserQueryInput>;
};


export type QueryWorkscheduleArgs = {
  input?: InputMaybe<WorkscheduleQueryInput>;
};

export type ResetPasswordInput = {
  password: Scalars['String'];
  token: Scalars['String'];
};

export type Role = {
  __typename?: 'Role';
  createdAt: Scalars['DateTime'];
  description: Scalars['String'];
  id: Scalars['ID'];
  name: RoleName;
  updatedAt: Scalars['DateTime'];
};

export type RoleCreateInput = {
  description?: InputMaybe<Scalars['String']>;
  name: RoleName;
};

export enum RoleName {
  Client = 'Client',
  CompanyAdmin = 'CompanyAdmin',
  Employee = 'Employee',
  SuperAdmin = 'SuperAdmin',
  TaskManager = 'TaskManager'
}

export type RolePagingResult = {
  __typename?: 'RolePagingResult';
  data: Array<Role>;
  paging: PagingResult;
};

export type RoleQuery = {
  id?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<RoleName>;
};

export type RoleQueryInput = {
  paging?: InputMaybe<PagingInput>;
  query?: InputMaybe<RoleQuery>;
};

export type RoleUpdateInput = {
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  name: RoleName;
};

export type StopTimesheetInput = {
  company_id: Scalars['String'];
  end: Scalars['DateTime'];
  id: Scalars['String'];
};

export type Task = {
  __typename?: 'Task';
  archived: Scalars['Boolean'];
  company_id: Scalars['String'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  manager_id: Scalars['String'];
  name: Scalars['String'];
  status: TaskStatus;
  /** Field for timesheet */
  timesheet?: Maybe<Timesheet>;
  updatedAt: Scalars['DateTime'];
  users: Array<User>;
  workschedules?: Maybe<Workschedule>;
};

export type TaskCreateInput = {
  archived?: InputMaybe<Scalars['Boolean']>;
  company_id: Scalars['String'];
  manager_id: Scalars['String'];
  name: Scalars['String'];
  status: TaskStatus;
};

export type TaskPagingResult = {
  __typename?: 'TaskPagingResult';
  data: Array<Task>;
  paging: PagingResult;
};

export type TaskQuery = {
  company_id: Scalars['String'];
  id?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<TaskStatus>;
  /** Assigned user_id for the task */
  user_id?: InputMaybe<Scalars['String']>;
};

export type TaskQueryInput = {
  paging?: InputMaybe<PagingInput>;
  query: TaskQuery;
};

export enum TaskStatus {
  Active = 'Active',
  Inactive = 'Inactive'
}

export type TaskUpdateInput = {
  archived?: InputMaybe<Scalars['Boolean']>;
  company_id?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  manager_id?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<TaskStatus>;
};

export type Timesheet = {
  __typename?: 'Timesheet';
  approver?: Maybe<User>;
  approver_id?: Maybe<Scalars['String']>;
  clientLocation?: Maybe<Scalars['String']>;
  company: Company;
  company_id: Scalars['String'];
  createdAt: Scalars['DateTime'];
  created_by: Scalars['String'];
  creator: User;
  end?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  project: Project;
  project_id: Scalars['String'];
  start: Scalars['DateTime'];
  task: Task;
  task_id: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type TimesheetCreateInput = {
  clientLocation?: InputMaybe<Scalars['String']>;
  company_id: Scalars['String'];
  created_by: Scalars['String'];
  end?: InputMaybe<Scalars['DateTime']>;
  project_id: Scalars['String'];
  start: Scalars['DateTime'];
  task_id: Scalars['String'];
};

export type TimesheetPagingResult = {
  __typename?: 'TimesheetPagingResult';
  data: Array<Timesheet>;
  paging: PagingResult;
};

export type TimesheetQuery = {
  company_id: Scalars['String'];
  id?: InputMaybe<Scalars['String']>;
  task_id?: InputMaybe<Scalars['String']>;
};

export type TimesheetQueryInput = {
  paging?: InputMaybe<PagingInput>;
  query: TimesheetQuery;
};

export type TimesheetUpdateInput = {
  approver_id?: InputMaybe<Scalars['String']>;
  clientLocation?: InputMaybe<Scalars['String']>;
  company_id?: InputMaybe<Scalars['String']>;
  created_by?: InputMaybe<Scalars['String']>;
  end?: InputMaybe<Scalars['DateTime']>;
  id: Scalars['String'];
  project_id?: InputMaybe<Scalars['String']>;
  start?: InputMaybe<Scalars['DateTime']>;
  task_id?: InputMaybe<Scalars['String']>;
};

export enum TokenType {
  Refresh = 'refresh',
  ResetPassword = 'resetPassword'
}

export type User = {
  __typename?: 'User';
  address: Address;
  address_id: Scalars['String'];
  archived: Scalars['Boolean'];
  avatar?: Maybe<Media>;
  avatar_id?: Maybe<Scalars['String']>;
  company?: Maybe<Company>;
  company_id: Scalars['String'];
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  firstName: Scalars['String'];
  fullName: Scalars['String'];
  id: Scalars['ID'];
  lastName: Scalars['String'];
  middleName?: Maybe<Scalars['String']>;
  phone: Scalars['String'];
  roles: Array<Role>;
  status: UserStatus;
  tokens?: Maybe<UserToken>;
  updatedAt: Scalars['DateTime'];
  workschedules?: Maybe<Workschedule>;
};

export type UserAdminCreateInput = {
  address: AddressCreateInput;
  email: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  middleName?: InputMaybe<Scalars['String']>;
  phone: Scalars['String'];
  roles: Array<AdminRole>;
  status: UserStatus;
};

export type UserArchiveInput = {
  archived: Scalars['Boolean'];
  company_id: Scalars['String'];
  id: Scalars['String'];
};

export type UserClient = {
  __typename?: 'UserClient';
  client: User;
  client_id: Scalars['String'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  status: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  user: User;
  user_id: Scalars['String'];
};

export type UserCreateInput = {
  address: AddressCreateInput;
  company_id: Scalars['String'];
  email: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  middleName?: InputMaybe<Scalars['String']>;
  phone: Scalars['String'];
  roles: Array<CompanyRole>;
  status: UserStatus;
};

export type UserPagingResult = {
  __typename?: 'UserPagingResult';
  data: Array<User>;
  paging: PagingResult;
};

export type UserQuery = {
  id?: InputMaybe<Scalars['String']>;
  role?: InputMaybe<RoleName>;
  search?: InputMaybe<Scalars['String']>;
};

export type UserQueryInput = {
  paging?: InputMaybe<PagingInput>;
  query?: InputMaybe<UserQuery>;
};

export enum UserStatus {
  Active = 'Active',
  Inactive = 'Inactive'
}

export type UserToken = {
  __typename?: 'UserToken';
  createdAt: Scalars['DateTime'];
  expiresIn: Scalars['DateTime'];
  id: Scalars['ID'];
  token: Scalars['String'];
  tokenType: TokenType;
  updatedAt: Scalars['DateTime'];
};

export type UserUpdateInput = {
  address?: InputMaybe<AddressUpdateInput>;
  email?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  lastName?: InputMaybe<Scalars['String']>;
  middleName?: InputMaybe<Scalars['String']>;
  phone?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<UserStatus>;
};

export type Workschedule = {
  __typename?: 'Workschedule';
  company: Company;
  company_id: Scalars['String'];
  createdAt: Scalars['DateTime'];
  date: Scalars['DateTime'];
  from: Scalars['Float'];
  id: Scalars['ID'];
  task_id: Scalars['String'];
  tasks: Task;
  to: Scalars['Float'];
  updatedAt: Scalars['DateTime'];
  user: User;
  user_id: Scalars['String'];
};

export type WorkscheduleCreateInput = {
  company_id: Scalars['String'];
  date: Scalars['DateTime'];
  from: Scalars['Float'];
  task_id: Scalars['String'];
  to: Scalars['Float'];
  user_id: Scalars['String'];
};

export type WorkschedulePagingResult = {
  __typename?: 'WorkschedulePagingResult';
  data: Array<Workschedule>;
  paging: PagingResult;
};

export type WorkscheduleQuery = {
  company_id?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
};

export type WorkscheduleQueryInput = {
  paging?: InputMaybe<PagingInput>;
  query?: InputMaybe<WorkscheduleQuery>;
};

export type WorkscheduleUpdateInput = {
  company_id?: InputMaybe<Scalars['String']>;
  date?: InputMaybe<Scalars['DateTime']>;
  from?: InputMaybe<Scalars['Float']>;
  id: Scalars['String'];
  task_id?: InputMaybe<Scalars['String']>;
  to?: InputMaybe<Scalars['Float']>;
  user_id?: InputMaybe<Scalars['String']>;
};
