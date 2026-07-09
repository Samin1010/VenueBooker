import request from "supertest";
// supertest for sending fake HTTP Request 

const findOne = jest.fn();

jest.mock("../data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(() => ({
      findOne,
    })),
  },
}));

import app from "../utils/server";

const expectValidationErrors = (
  response: request.Response,
  expectedProperties: string[],
) => {
  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Validation failed");

  for (const property of expectedProperties) {
    // it is an array of errors so using expect.arrayContaining
    expect(response.body.errors).toEqual(
      // expect.objectContaining is used to check if atleast a single object
      // in that array with that property exists
      expect.arrayContaining([expect.objectContaining({ property })]),
    );
  }
};

describe("Protected APIs", () => {
  beforeEach(() => {
    findOne.mockResolvedValue(null);
  });

  describe("Venue API", () => {
    //check if try to create venue with empty payload
    it("returns 400 when creating a venue with an empty payload", async () => {
      const response = await request(app).post("/api/venue").send({});

      expectValidationErrors(response, [
        "name",
        "location",
        "description",
        "capacity",
        "price",
        "image",
        "userId",
        "suitabilities",
      ]);
      expect(findOne).not.toHaveBeenCalled();
    });

    //check if vendor is missing from venue payload
    it("returns 404 when the vendor in a valid payload does not exist", async () => {
      const response = await request(app).post("/api/venue").send({
        name: "Test Venue",
        location: "Melbourne",
        description: "A venue used by the API test suite",
        capacity: 100,
        price: 500,
        image: "/venue.jpg",
        userId: 999,
        suitabilities: ["wedding"],
      });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "User not found",
        },
      });
    });
  });

  //check if trying to create application with empty payload
  describe("Application API", () => {
    it("returns 400 when creating an application with an empty payload", async () => {
      const response = await request(app).post("/api/application/1").send({});

      expectValidationErrors(response, [
        "userId",
        "venueId",
        "eventName",
        "expectedGuests",
        "date",
        "time",
        "duration",
      ]);
      expect(findOne).not.toHaveBeenCalled();
    });

    //check if hirer not present in application payload
    it("returns 404 when the hirer in a valid payload does not exist", async () => {
      const response = await request(app).post("/api/application/1").send({
        userId: 999,
        venueId: 1,
        eventName: "Test event",
        expectedGuests: 50,
        date: "2026-06-20",
        time: "18:00",
        duration: 2,
      });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("NOT_FOUND");
    });

    //check if duuration is valid
    it("rejects durations outside the inclusive two-to-ten hour range", async () => {
      const response = await request(app).post("/api/application/1").send({
        userId: 999,
        venueId: 1,
        eventName: "Test event",
        expectedGuests: 50,
        date: "2026-06-20",
        time: "18:00",
        duration: 1,
      });

      expectValidationErrors(response, ["duration"]);
      expect(findOne).not.toHaveBeenCalled();
    });
  });

  describe("User API", () => {
    //check if creating preference with empty payload
    it("returns 400 when creating a preference with an empty payload", async () => {
      const response = await request(app).post("/api/user/1/preference").send({});

      expectValidationErrors(response, ["userId", "venueId", "pref_no"]);
      expect(findOne).not.toHaveBeenCalled();
    });

    //check if hirer not present in preference payload
    it("returns 404 when the hirer in a valid preference does not exist", async () => {
      const response = await request(app)
        .post("/api/user/999/preference")
        .send({
          userId: 999,
          venueId: 1,
          pref_no: 1,
        });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("NOT_FOUND");
    });
  });
});
