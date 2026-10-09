import bcrypt from "bcrypt";
import { createUser } from "../models/user.model";
import jwt from "jsonwebtoken";
import { findUserByEmail } from "../models/user.model";
import { JWT_SECRET } from "../utils/jwt";
import AppError from "../utils/AppError";

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export async function registerUser(data: RegisterData) {
  const email = data.email.trim().toLowerCase();
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  await createUser({
    name: data.name.trim(),
    email,
    password: hashedPassword,
  });

  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("Could not create the account", 500);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
export async function loginUser(email: string, password: string) {
  const user = await findUserByEmail(email.trim().toLowerCase());

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
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
