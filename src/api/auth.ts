import axios from "@/core/axios";
import {
  LoginFormDTO,
  LoginResponseDTO,
  RegisterFormDTO,
  RegisterResponseDTO,
  User,
} from "./dto/auth.dto";
import { destroyCookie } from "nookies";

export const login = async (values: LoginFormDTO): Promise<LoginResponseDTO> => {
  return (await axios.post("/login", values)).data;
};

export const register = async (values: RegisterFormDTO): Promise<RegisterResponseDTO> => {
  return (await axios.post("/register", values)).data;
};

export const getMe = async (): Promise<User> => {
  return (await axios.get("/users/me")).data;
};

export const logout = () => {
  destroyCookie(null, "_token", { path: "/" });
};

export interface UpdateProfileDTO {
  fullName?: string;
  email?: string;
  password?: string;
}

export const updateProfile = async (data: UpdateProfileDTO): Promise<User> => {
  return (await axios.patch("/users/me", data)).data;
};