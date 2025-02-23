export interface RegisterPostData {
  fullName: string;
  email: string;
  password: string;
}

export interface User extends RegisterPostData {
  id: string;
  accountAmount: number;
  role: Role;
}

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}
