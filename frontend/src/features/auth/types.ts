export type User = {
  id: string;
  email: string;
  username: string;
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
