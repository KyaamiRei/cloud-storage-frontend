export interface LoginFormDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
}

export type RegisterFormDTO = LoginResponseDTO & { fullname: string };
export type RegisterResponseDTO = LoginResponseDTO;

export interface User {
  id: string;
  email: string;
  fullName: string;
}
