export const UserRole = {
  USER: "user",
  PROBLEM_SETTER: "problem_setter",
  ADMIN: "admin",
} as const;

export type Role = (typeof UserRole)[keyof typeof UserRole];

export type User = {
  id: string;
  email: string;
  username: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  username: string;
  password: string;
};
