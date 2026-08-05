import bcrypt from "bcrypt";
import { createUser } from "../models/user.model";
import jwt from "jsonwebtoken";
import { findUserByEmail, findUserById } from "../models/user.model";
import { JWT_SECRET } from "../utils/jwt";

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export async function registerUser(data: RegisterData) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await createUser({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });

  return user;
}
export async function loginUser(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Wrong password");
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
export async function getUserById(id: number) {
  const user = await findUserById(id);

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
