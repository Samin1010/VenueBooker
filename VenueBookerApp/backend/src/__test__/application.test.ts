import request from "supertest";

const userFindOne = jest.fn();
const venueFindOne = jest.fn();
const applicationFind = jest.fn();
const applicationFindOne = jest.fn();
const applicationSave = jest.fn();
const notificationSave = jest.fn();
const applicationQueryBuilderGetOne = jest.fn();
const applicationQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getOne: applicationQueryBuilderGetOne,
};

jest.mock("../data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn((entity: { name: string }) => {
      const repositories: Record<string, object> = {
        User: { findOne: userFindOne },
        Venue: { findOne: venueFindOne },
        Application: {
          find: applicationFind,
          findOne: applicationFindOne,
          save: applicationSave,
          createQueryBuilder: jest.fn(() => applicationQueryBuilder),
        },
        Notification: { save: notificationSave },
      };

      return repositories[entity.name] ?? {};
    }),
  },
}));

import app from "../utils/server";

const hirer = { id: 1, role: "hirer", username: "hirer" };
const vendor = { id: 2, role: "vendor", username: "vendor" };
const venue = {
  id: 5,
  userId: vendor.id,
  capacity: 50,
  bookedTimes: [],
};

const applicationPayload = {
  userId: hirer.id,
  venueId: venue.id,
  eventName: "Future event",
  expectedGuests: 40,
  date: "2099-06-20",
  time: "18:00",
  duration: 2,
};

describe("Application business rules", () => {
  beforeEach(() => {
    userFindOne.mockResolvedValue(hirer);
    venueFindOne.mockResolvedValue(venue);
    applicationFind.mockResolvedValue([]);
    applicationSave.mockImplementation(async (application) => application);
    notificationSave.mockImplementation(async (notification) => notification);
  });

  //check for going over venue capacity
  it("rejects applications that exceed venue capacity", async () => {
    const response = await request(app)
      .post(`/api/application/${venue.id}`)
      .send({ ...applicationPayload, expectedGuests: 51 });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VENUE_CAPACITY_EXCEEDED");
    expect(applicationSave).not.toHaveBeenCalled();
  });

  //check for application dates in past
  it("rejects applications in the past", async () => {
    const response = await request(app)
      .post(`/api/application/${venue.id}`)
      .send({ ...applicationPayload, date: "2020-01-01" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("APPLICATION_DATE_IN_PAST");
    expect(applicationSave).not.toHaveBeenCalled();
  });

  //check for time format
  it("stores notification time as local HH:MM:SS without a UTC suffix", async () => {
    userFindOne.mockResolvedValue(vendor);
    applicationFindOne.mockResolvedValue({
      id: 10,
      user: hirer,
      venueId: venue.id,
      date: "2099-06-20",
      time: "18:00",
      duration: 2,
      status: "pending",
    });

    const response = await request(app)
      .put("/api/application/10/status")
      .send({ userId: vendor.id, status: "rejected" });

    expect(response.status).toBe(200);
    expect(notificationSave).toHaveBeenCalledWith(
      expect.objectContaining({
        time: expect.stringMatching(/^\d{2}:\d{2}:\d{2}$/),
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      }),
    );
  });

  //check if only applications for venues owned by respective vendor
  it("scopes application details to venues owned by the requesting vendor", async () => {
    applicationQueryBuilderGetOne.mockResolvedValue(null);

    const response = await request(app).get("/api/application/2/10");

    expect(response.status).toBe(404);
    expect(applicationQueryBuilder.andWhere).toHaveBeenCalledWith(
      "venue.userId = :vendorId",
      { vendorId: 2 },
    );
  });
});
