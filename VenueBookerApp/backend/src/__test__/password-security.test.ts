import type { Request, Response } from "express";
import { getMetadataArgsStorage } from "typeorm";

const getOne = jest.fn();
const queryBuilder = {
  addSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  getOne,
};

jest.mock("../data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(() => ({
      createQueryBuilder: jest.fn(() => queryBuilder),
    })),
  },
}));

jest.mock("bcrypt", () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
  },
}));

import bcrypt from "bcrypt";
import { AuthController } from "../controller/auth.controller";
import { User, UserType } from "../entity/User";
import { UserDocument } from "../entity/UserDocument";

describe("Password response security", () => {
  //check if password being returned
  it("does not select password columns by default", () => {
    const passwordColumn = getMetadataArgsStorage().columns.find(
      (column) =>
        column.target === User && column.propertyName === "password",
    );

    expect(passwordColumn?.options.select).toBe(false);
  });

  //check if using generated id is used as primary key
  it("uses only the generated id as the user document primary key", () => {
    const primaryColumns = getMetadataArgsStorage().columns.filter(
      (column) => column.target === UserDocument && column.options.primary,
    );

    expect(primaryColumns.map((column) => column.propertyName)).toEqual(["id"]);
  });

  //check if passwod hashing is removed for for successful login response
  it("removes the password hash from successful login responses", async () => {
    getOne.mockResolvedValue({
      id: 1,
      first_name: "Test",
      last_name: "User",
      username: "test_user",
      email: "test@example.com",
      password: "$2b$10$hashed-password",
      role: UserType.HIRER,
      phone: null,
      createdAt: "2026-06-12",
      updatedAt: "2026-06-12",
    });
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const req = {
      body: { username: "test_user", password: "Password!" },
    } as Request;
    const res = { status } as unknown as Response;

    await new AuthController().login(req, res);

    expect(queryBuilder.addSelect).toHaveBeenCalledWith("user.password");
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: {
          user: expect.not.objectContaining({
            password: expect.anything(),
          }),
        },
      }),
    );
  });
});
