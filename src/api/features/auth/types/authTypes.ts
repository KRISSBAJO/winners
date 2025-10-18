export type OrgRef = string | { _id: string; name: string };

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  avatar?: string;
  email: string;
  role:
    | "siteAdmin"
    | "churchAdmin"
    | "pastor"
    | "volunteer"
    | "nationalPastor"
    | "districtPastor";
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  churchId?: OrgRef;
  districtId?: OrgRef;
  nationalChurchId?: OrgRef;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TokensResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}


export type DelegatedScope = { nationalChurchId?: string; districtId?: string; churchId?: string };

export interface MePayload extends User {
  permissions?: string[];
  delegatedScopes?: DelegatedScope[];
}