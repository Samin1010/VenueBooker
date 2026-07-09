import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { sendError, sendSuccess } from "../types/responses";
import type { ApiResponse } from "@shared/types";
import type { AuthPayload } from "@shared/types/auth_payload";
import bcrypt from "bcrypt";

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);
  async signUp(req: Request, res: Response<ApiResponse<AuthPayload>>) {
    try {
      const { email, password, first_name, last_name, username, role, phone } =
        req.body;
      if (!email || !password || !first_name || !last_name || !username || !role) {
        return sendError(
          res,
          400,
          "BAD_REQUEST",
          "Please send all the required informations",
        );
      }
      const isValidEmail = (email: string) => {
        // [it can eb anything other than @]@[can be anything other than @].[anything other than @]
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      };
      // there is only capital and lowercase letters
      const isValidName = (name: string) => {
        return /^[A-Za-z]+$/.test(name);
      };
      // (there should be capital letter)(small letter)(special character)
      const isStrongPassword = (password: string) => {
        return /^(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).{6,}$/.test(password);
      };
      const isValidRole = (role: string) => {
        return role.toLowerCase() == "hirer" || role.toLowerCase() == "vendor";
      };
      const isValidPhoneNumber = (number: string) => {
        return /^[0-9]{10}$/.test(number);
      };

      const isValidUsername = (username: string) => {
        return /^[A-Za-z0-9._-]{3,30}$/.test(username);
      };
      // checking validities of all the attributes of the data send by the request
      if (!isValidEmail(email)) {
        return sendError(res, 400, "BAD_REQUEST", "Is not a Valid email");
      }
      if (!isValidName(first_name)) {
        return sendError(res, 400, "BAD_REQUEST", "is not a valid first name");
      }
      if (!isValidName(last_name)) {
        return sendError(res, 400, "BAD_REQUEST", "is not a valid last name");
      }
      if (!isStrongPassword(password)) {
        return sendError(res, 400, "BAD_REQUEST", "is not a strong password");
      }
      if (!isValidRole(role)) {
        return sendError(res, 400, "BAD_REQUEST", "is not a valid role");
      }

      if (!isValidUsername(username)) {
        return sendError(res, 400, "BAD_REQUEST", "is not a valid username");
      }

      if (phone && !isValidPhoneNumber(phone)) {
        return sendError(
          res,
          400,
          "BAD_REQUEST",
          "is not a valid phone number",
        );
      }

      const user_exists = await this.userRepository.findOne({
        where: [{ username: username }, { email: email }],
      });

      if (user_exists) {
        return sendError(
          res,
          400,
          "USER_ALREADY_EXISTS",
          "Username or email already exists",
        );
      }
      // everything is valid now so create a new user
      const user: User = new User();
      user.email = email;
      const saltRounds = 10;
      user.password = await bcrypt.hash(password, saltRounds);
      // we need to hash the password
      user.first_name = first_name;
      user.last_name = last_name;
      user.username = username;
      user.role = role;
      user.phone = phone;
      await this.userRepository.save(user);
      // sending a response back to the user

      const { password: hashedPassword, ...userWithoutPassword } = user;

      return sendSuccess(
        res,
        {
          user: userWithoutPassword,
        },
        "Successfully logged in",
        201,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
      }
      return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
    }
  }
  async login(req: Request, res: Response<ApiResponse<AuthPayload>>) {
    try {
      const { username, password } = req.body;
      // if not username or password then cannot login
      if (!username || !password) {
        return sendError(
          res,
          400,
          "BAD_REQUEST",
          "The username or password is not provided",
        );
      }
      const user: User | null = await this.userRepository
        .createQueryBuilder("user")
        .addSelect("user.password")
        .where("user.username = :username", { username })
        .getOne();
      // if user does not exists then return
      if (!user) {
        return sendError(
          res,
          400,
          "BAD_REQUEST",
          "The username is not registered",
        );
      }
      // return failure if password not correct

      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
        return sendError(res, 400, "BAD_REQUEST", "The password is incorrect");
      }
      // everything is successfully it reached at this point
      const { password: hashedPassword, ...userWithoutPassword } = user;

      return sendSuccess(
        res,
        {
          user: userWithoutPassword,
        },
        "Successfully logged in",
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return sendError(res, 500, "INTERNAL_SERVER_ERROR", error.message);
      }
      return sendError(res, 500, "INTERNAL_SERVER_ERROR", String(error));
    }
  }
}
