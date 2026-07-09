import type { Request, Response } from "express";

const userFindOne = jest.fn();
const userSave = jest.fn();
const preferenceCount = jest.fn();
const preferenceSave = jest.fn();
const preferenceRemove = jest.fn();
const createQueryBuilder = jest.fn();

jest.mock("../data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn((entity: { name: string }) => {
      if (entity.name === "User") {
        return { findOne: userFindOne, save: userSave };
      }
      if (entity.name === "UserPreference") {
        return {
          count: preferenceCount,
          save: preferenceSave,
          remove: preferenceRemove,
          createQueryBuilder,
        };
      }
      return {};
    }),
  },
}));

import { UserController } from "../controller/user.controller";

// creates a response 
const createResponse = () => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  return { response: { status } as unknown as Response, json };
};

// creates a methods of a repository API 
// for different parts of SQL Queries
const createQuery = (result?: unknown) => {
  const query = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(result),
    getMany: jest.fn().mockResolvedValue([]),
    execute: jest.fn().mockResolvedValue({ affected: 1 }),
  };
  return query;
};

describe("User controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // eventhough there is an update but if the update does not want
  // to change the phone number then the phone number is  preserved or unchanged
  it("preserves the stored phone number when a partial update omits phone", async () => {
    const user = {
      id: 1,
      first_name: "Old",
      last_name: "Name",
      username: "old_name",
      email: "old@example.com",
      phone: "0412345678",
    };
    userFindOne.mockResolvedValue(user);
    userSave.mockImplementation(async (savedUser) => savedUser);
    const { response } = createResponse();

    await new UserController().changeUser(
      {
        params: { userId_: "1" },
        body: { userId: 1, first_name: "New" },
      } as unknown as Request,
      response,
    );

    expect(userSave).toHaveBeenCalledWith(
      expect.objectContaining({ first_name: "New", phone: "0412345678" }),
    );
  });

  // It is used the update of the preference
  it("uses the userId column when moving a preference to a lower rank", async () => {
    const preference = { id: 3, pref_no: 3, user: { id: 1 } };
    const lookup = createQuery(preference);
    const update = createQuery();
    const list = createQuery();
    createQueryBuilder
      .mockReturnValueOnce(lookup)
      .mockReturnValueOnce(update)
      .mockReturnValueOnce(list);
    preferenceCount.mockResolvedValue(3);
    const { response } = createResponse();

    await new UserController().updatePreference(
      {
        params: { pref_id: "3" },
        body: { userId: 1, pref_no: 1 },
      } as unknown as Request,
      response,
    );

    expect(update.where).toHaveBeenCalledWith("userId = :userId", {
      userId: 1,
    });
  });
  //check if using userid column when closing ranks after removing a preference 
  it("uses the userId column when closing ranks after removing a preference", async () => {
    const preference = { id: 2, pref_no: 2, user: { id: 1 } };
    const lookup = createQuery(preference);
    const update = createQuery();
    const list = createQuery();
    createQueryBuilder
      .mockReturnValueOnce(lookup)
      .mockReturnValueOnce(update)
      .mockReturnValueOnce(list);
    const { response } = createResponse();

    await new UserController().removePreference(
      {
        params: { pref_id: "2" },
        body: { userId: 1 },
      } as unknown as Request,
      response,
    );

    expect(update.where).toHaveBeenCalledWith("userId = :userId", {
      userId: 1,
    });
  });
});
