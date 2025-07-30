export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  JSONObject: { input: any; output: any; }
};

/** Activity */
export type Activity = {
  __typename?: 'Activity';
  activity_id: Scalars['Int']['output'];
  created_at: Scalars['DateTime']['output'];
  entity: Entity;
  metadata: Scalars['JSONObject']['output'];
  type: Scalars['String']['output'];
};

export type CreateProjectInput = {
  name: Scalars['String']['input'];
  thumbnail_id: Scalars['Int']['input'];
};

export type CreateScanInput = {
  input_file_id: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  project_id: Scalars['Int']['input'];
};

export enum Entity {
  Project = 'project',
  Scan = 'scan'
}

/** File */
export type File = {
  __typename?: 'File';
  bucket: Scalars['String']['output'];
  created_at: Scalars['DateTime']['output'];
  file_id: Scalars['Int']['output'];
  key: Scalars['String']['output'];
  mimetype: Scalars['String']['output'];
  name: Scalars['String']['output'];
  thumbnail: Scalars['String']['output'];
  type: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type ForgotPasswordInput = {
  email: Scalars['String']['input'];
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  create_project: Project;
  create_scan: Scan;
  delete_project: Project;
  delete_scan: Scan;
  forgot_password: PasswordReset;
  login: UserWithToken;
  read_notifications: Array<Notification>;
  reset_password: PasswordReset;
  signup: Verification;
  update_account: User;
  update_password: User;
  update_project: Project;
  update_scan: Scan;
  verify_account: UserWithToken;
};


export type MutationCreate_ProjectArgs = {
  data: CreateProjectInput;
};


export type MutationCreate_ScanArgs = {
  data: CreateScanInput;
};


export type MutationDelete_ProjectArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDelete_ScanArgs = {
  id: Scalars['Int']['input'];
};


export type MutationForgot_PasswordArgs = {
  data: ForgotPasswordInput;
};


export type MutationLoginArgs = {
  data: LoginInput;
};


export type MutationReset_PasswordArgs = {
  data: ResetPasswordInput;
};


export type MutationSignupArgs = {
  data: SignupInput;
};


export type MutationUpdate_AccountArgs = {
  data: UpdateUserInput;
};


export type MutationUpdate_PasswordArgs = {
  data: UpdatePasswordInput;
};


export type MutationUpdate_ProjectArgs = {
  data: UpdateProjectInput;
  id: Scalars['Int']['input'];
};


export type MutationUpdate_ScanArgs = {
  data: UpdateScanInput;
  id: Scalars['Int']['input'];
};


export type MutationVerify_AccountArgs = {
  data: VerifyAccountInput;
};

/** Notification */
export type Notification = {
  __typename?: 'Notification';
  created_at: Scalars['DateTime']['output'];
  metadata: Scalars['JSONObject']['output'];
  notification_id: Scalars['Int']['output'];
  read: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type PasswordReset = {
  __typename?: 'PasswordReset';
  password_reset_id: Scalars['Int']['output'];
};

export type Project = {
  __typename?: 'Project';
  created_at: Scalars['DateTime']['output'];
  name: Scalars['String']['output'];
  project_id: Scalars['Int']['output'];
  scans: Array<Scan>;
  slug: Scalars['String']['output'];
  thumbnail: File;
  user: User;
};

export type Query = {
  __typename?: 'Query';
  activities: Array<Activity>;
  notifications: Array<Notification>;
  project: Project;
  projects: Array<Project>;
  scan: Scan;
  scans: Array<Scan>;
  verify_token: User;
};


export type QueryActivitiesArgs = {
  project_slug?: InputMaybe<Scalars['String']['input']>;
  scan_slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProjectArgs = {
  id?: InputMaybe<Scalars['Int']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProjectsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Sort>;
  sort_by?: InputMaybe<SortBy>;
};


export type QueryScanArgs = {
  id?: InputMaybe<Scalars['Int']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type ResetPasswordInput = {
  id: Scalars['Int']['input'];
  password: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type Scan = {
  __typename?: 'Scan';
  created_at: Scalars['DateTime']['output'];
  input_file: File;
  name: Scalars['String']['output'];
  scan_id: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  splat_file?: Maybe<File>;
  status: ScanStatus;
  user: User;
};

export enum ScanStatus {
  Completed = 'Completed',
  Failed = 'Failed',
  Preparing = 'Preparing'
}

export type SignupInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export enum Sort {
  Ascending = 'ascending',
  Descending = 'descending'
}

export enum SortBy {
  CreatedAt = 'created_at',
  Name = 'name'
}

export type UpdatePasswordInput = {
  current_password: Scalars['String']['input'];
  new_password: Scalars['String']['input'];
};

export type UpdateProjectInput = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateScanInput = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  picture?: InputMaybe<Scalars['String']['input']>;
};

/** User */
export type User = {
  __typename?: 'User';
  created_at: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  name: Scalars['String']['output'];
  picture: Scalars['String']['output'];
  user_id: Scalars['Int']['output'];
  verified: Scalars['Boolean']['output'];
};

/** UserWithToken */
export type UserWithToken = {
  __typename?: 'UserWithToken';
  created_at: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  name: Scalars['String']['output'];
  picture: Scalars['String']['output'];
  token: Scalars['String']['output'];
  user_id: Scalars['Int']['output'];
  verified: Scalars['Boolean']['output'];
};

export type Verification = {
  __typename?: 'Verification';
  verification_id: Scalars['Int']['output'];
};

export type VerifyAccountInput = {
  id: Scalars['Int']['input'];
  token: Scalars['String']['input'];
};
