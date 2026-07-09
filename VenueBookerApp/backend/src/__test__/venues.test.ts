import request from "supertest";
import { LessThanOrEqual, Like, MoreThanOrEqual } from "typeorm";

// created seperate function names
// in order to avoid confusion
const venueFind = jest.fn();
const venueFindOne = jest.fn();
const venueCreate = jest.fn();
const venueSave = jest.fn();
const venueRemove = jest.fn();
const userFindOne = jest.fn();
const bookedTimeFind = jest.fn();
const bookedTimeFindOne = jest.fn();
const bookedTimeSave = jest.fn();
const bookedTimeRemove = jest.fn();
const applicationFind = jest.fn();
const applicationDelete = jest.fn();
const queryBuilderGetOne = jest.fn();
const queryBuilder = {
  leftJoinAndSelect: jest.fn(),
  where: jest.fn(),
  getOne: queryBuilderGetOne,
};

queryBuilder.leftJoinAndSelect.mockReturnValue(queryBuilder);
queryBuilder.where.mockReturnValue(queryBuilder);

jest.mock("../data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn((entity: { name: string }) => {
      const repositories: Record<string, object> = {
        Venue: {
          // since i assign these jest functions to
          // the actual function names called in the actual controller
          // it is assigned by reference
          // so both of them refer to the same function
          // in the memory
          // therefore we can use the unique functions
          // name in order to check whether they are called or not
          find: venueFind,
          findOne: venueFindOne,
          create: venueCreate,
          save: venueSave,
          remove: venueRemove,
          createQueryBuilder: jest.fn(() => queryBuilder),
        },
        User: { findOne: userFindOne },
        BookedTime: {
          find: bookedTimeFind,
          findOne: bookedTimeFindOne,
          save: bookedTimeSave,
          remove: bookedTimeRemove,
        },
        Application: {
          find: applicationFind,
          delete: applicationDelete,
        },
      };

      return repositories[entity.name];
    }),
  },
}));

import app from "../utils/server";

const vendor = {
  id: 7,
  username: "venue-owner",
  role: "vendor",
};

const otherVendor = {
  id: 8,
  username: "other-owner",
  role: "vendor",
};

const hirer = {
  id: 9,
  username: "hirer",
  role: "hirer",
};

const grandBallroom = {
  id: 1,
  name: "Grand Ballroom",
  location: "Melbourne CBD",
  capacity: 300,
  price: 5000,
  description: "Large ballroom",
  image: "ballroom.jpg",
  suitabilities: ["wedding", "dinner"],
  is_featured: true,
  userId: vendor.id,
};

const gardenTerrace = {
  id: 2,
  name: "Garden Terrace",
  location: "Fitzroy",
  capacity: 60,
  price: 900,
  description: "Outdoor terrace",
  image: "terrace.jpg",
  suitabilities: ["birthday", "wedding"],
  is_featured: false,
  userId: vendor.id,
};

const techHub = {
  id: 3,
  name: "Tech Hub Conference Room",
  location: "Docklands",
  capacity: 80,
  price: 1200,
  description: "Conference room",
  image: "tech-hub.jpg",
  suitabilities: ["classical music", "dinner"],
  is_featured: false,
  userId: vendor.id,
};

const validVenuePayload = {
  name: "New Venue",
  location: "Carlton",
  description: "A new event venue",
  capacity: 120,
  price: 1500,
  image: "/new-venue.jpg",
  userId: vendor.id,
  suitabilities: ["wedding"],
  is_featured: false,
};

const validTimeBlock = {
  date: "2026-07-10",
  time: "10:00:00",
  duration: 2,
  userId: vendor.id,
};

const expectError = (
  response: request.Response,
  status: number,
  code: string,
  message: string,
) => {
  expect(response.status).toBe(status);
  expect(response.body).toMatchObject({
    success: false,
    error: { code, message },
  });
};

describe("Venue API", () => {
  beforeEach(() => {
    venueFind.mockResolvedValue([]);
    venueFindOne.mockResolvedValue(null);
    userFindOne.mockResolvedValue(vendor);
    bookedTimeFind.mockResolvedValue([]);
    bookedTimeFindOne.mockResolvedValue(null);
    applicationFind.mockResolvedValue([]);
    queryBuilderGetOne.mockResolvedValue(null);
    venueCreate.mockImplementation((venue) => ({ id: 10, ...venue }));
    venueSave.mockImplementation(async (venue) => venue);
    bookedTimeSave.mockImplementation(async (bookedTime) => bookedTime);
  });

  describe("GET /api/venue", () => {
    //check venues are split into featured and non featured
    it("gets all venues and separates featured venues", async () => {
      venueFind.mockResolvedValue([grandBallroom, gardenTerrace, techHub]);

      const response = await request(app).get("/api/venue");

      expect(response.status).toBe(200);
      expect(venueFind).toHaveBeenCalledWith({ where: {} });
      expect(response.body.data.featured_venues).toEqual([grandBallroom]);
      expect(response.body.data.non_featured_venues).toEqual([
        gardenTerrace,
        techHub,
      ]);
    });

    //check filters are trimmed and combined using the advertised ranges
    it("combines text, minimum capacity, and maximum price filters", async () => {
      venueFind.mockResolvedValue([grandBallroom]);

      const response = await request(app).get("/api/venue").query({
        name: " Grand ",
        location: " Melbourne ",
        capacity: "300",
        price: "5000",
        suitability: " wedding ",
      });

      expect(response.status).toBe(200);
      expect(venueFind).toHaveBeenCalledWith({
        where: {
          name: Like("%Grand%"),
          location: Like("%Melbourne%"),
          capacity: MoreThanOrEqual(300),
          price: LessThanOrEqual(5000),
          suitabilities: Like("%wedding%"),
        },
      });
    });

    //check blank filters are ignored
    it("ignores blank filters", async () => {
      await request(app).get("/api/venue").query({
        name: " ",
        location: "",
        capacity: " ",
        price: "",
        suitability: " ",
      });

      expect(venueFind).toHaveBeenCalledWith({ where: {} });
    });

    //check for database failure
    it("returns 500 when retrieving venues fails", async () => {
      venueFind.mockRejectedValue(new Error("database unavailable"));

      const response = await request(app).get("/api/venue");

      expectError(
        response,
        500,
        "INTERNAL_SERVER_ERROR",
        "database unavailable",
      );
    });
  });

  describe("GET /api/venue/vendor/:vendorId", () => {
    //check vendor gets their own venues
    it("returns all venues belonging to a vendor", async () => {
      venueFind.mockResolvedValue([grandBallroom, gardenTerrace]);

      const response = await request(app).get(`/api/venue/vendor/${vendor.id}`);

      expect(response.status).toBe(200);
      expect(userFindOne).toHaveBeenCalledWith({ where: { id: vendor.id } });
      expect(venueFind).toHaveBeenCalledWith({
        where: { user: { id: vendor.id } },
      });
      expect(response.body.data.venues).toEqual([
        grandBallroom,
        gardenTerrace,
      ]);
    });

    //check for missing vendor
    it("returns 404 when the vendor does not exist", async () => {
      userFindOne.mockResolvedValue(null);

      const response = await request(app).get("/api/venue/vendor/999");

      expectError(response, 404, "NOT_FOUND", "Vendor not found");
      expect(venueFind).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/venue/:venueId", () => {
    //check venue is returned with its blocked times
    it("returns a venue with its blocked times", async () => {
      const venue = { ...grandBallroom, bookedTimes: [] };
      queryBuilderGetOne.mockResolvedValue(venue);

      const response = await request(app).get("/api/venue/1");

      expect(response.status).toBe(200);
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        "venue.bookedTimes",
        "bookedTimes",
      );
      expect(queryBuilder.where).toHaveBeenCalledWith(
        "venue.id = :venueId",
        { venueId: 1 },
      );
      expect(response.body.data.venue).toEqual(venue);
    });

    //check for missing venue
    it("returns 404 when the venue does not exist", async () => {
      const response = await request(app).get("/api/venue/999");

      expectError(response, 404, "NOT_FOUND", "Venue not found");
    });

    //check unknown path is not treated as a vendor id
    it("does not treat an unknown single-segment path as a vendor lookup", async () => {
      const response = await request(app).get("/api/venue/not-a-route");

      expectError(response, 404, "NOT_FOUND", "Venue not found");
      expect(userFindOne).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/venue/:venueId/availability", () => {
    //check blocked times and accepted bookings are combined
    it("returns normalized blocked and accepted-booking times", async () => {
      venueFindOne.mockResolvedValue({
        ...grandBallroom,
        bookedTimes: [
          { id: 10, venueId: 1, date: "2026-07-01", time: "10:00", duration: 2 },
        ],
      });
      applicationFind.mockResolvedValue([
        {
          id: 20,
          venueId: 1,
          status: "accepted",
          date: "2026-07-01",
          time: "14:00",
          duration: 3,
        },
      ]);

      const response = await request(app).get("/api/venue/1/availability");

      expect(response.status).toBe(200);
      expect(applicationFind).toHaveBeenCalledWith({
        where: {
          venue: { id: 1 },
          status: "accepted",
        },
      });
      expect(response.body.data.unavailableTimes).toEqual([
        { date: "2026-07-01", time: "10:00", duration: 2 },
        { date: "2026-07-01", time: "14:00", duration: 3 },
      ]);
    });
  });

  describe("POST /api/venue", () => {
    //check for missing fields
    it("validates the request payload", async () => {
      const response = await request(app).post("/api/venue").send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed");
      expect(userFindOne).not.toHaveBeenCalled();
    });

    //check only vendors can create venues
    it("rejects a user who is not a vendor", async () => {
      userFindOne.mockResolvedValue(hirer);

      const response = await request(app)
        .post("/api/venue")
        .send({ ...validVenuePayload, userId: hirer.id });

      expectError(
        response,
        403,
        "NOT_ALLOWED",
        "User does not have permission to perform this action",
      );
      expect(venueSave).not.toHaveBeenCalled();
    });

    //check for successful venue creation
    it("creates a venue for a vendor", async () => {
      const response = await request(app)
        .post("/api/venue")
        .send(validVenuePayload);

      expect(response.status).toBe(201);
      expect(venueCreate).toHaveBeenCalledWith({
        name: validVenuePayload.name,
        location: validVenuePayload.location,
        description: validVenuePayload.description,
        image: validVenuePayload.image,
        suitabilities: validVenuePayload.suitabilities,
        is_featured: validVenuePayload.is_featured,
        price: validVenuePayload.price,
        capacity: validVenuePayload.capacity,
        // the rating and num_ratings are checked like this because it is
        // not provided by the client but it is initialized like this by the controller
        rating: null,
        num_ratings: 0,
        user: vendor,
      });
      
      expect(venueSave).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 10,
          name: validVenuePayload.name,
        }),
      );
      expect(response.body.data.venue).toMatchObject({
        id: 10,
        name: validVenuePayload.name,
      });
    });
  });

  describe("GET /api/venue/:venueId/timeslots", () => {
    //check all blocked times are returned
    it("returns all blocked times for a venue", async () => {
      const bookedTimes = [{ id: 4, ...validTimeBlock }];
      venueFindOne.mockResolvedValue({ ...grandBallroom, bookedTimes });

      const response = await request(app).get("/api/venue/1/timeslots");

      expect(response.status).toBe(200);
      expect(venueFindOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { bookedTimes: true },
      });
      expect(response.body.data.blockTimes).toEqual(bookedTimes);
    });

    //check for missing venue
    it("returns 404 when the venue does not exist", async () => {
      const response = await request(app).get("/api/venue/999/timeslots");

      expectError(response, 404, "NOT_FOUND", "Venue not found");
    });

    //check for missing user
    it("returns 404 when the requesting user does not exist", async () => {
      userFindOne.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/venue/1/addTimeBlock")
        .send(validTimeBlock);

      expectError(response, 404, "NOT_FOUND", "User not found");
      expect(bookedTimeSave).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/venue/:venueId/addTimeBlock", () => {
    //check for invalid duration
    it("rejects durations outside the inclusive two-to-ten hour range", async () => {
      const response = await request(app)
        .post("/api/venue/1/addTimeBlock")
        .send({ ...validTimeBlock, duration: 1 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed");
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ property: "duration" }),
        ]),
      );
      expect(bookedTimeSave).not.toHaveBeenCalled();
    });

    //check owner can block a free time slot
    it("blocks an available time slot for the venue owner", async () => {
      venueFindOne.mockResolvedValue({
        ...grandBallroom,
        bookedTimes: [],
        applications: [],
      });

      const response = await request(app)
        .post("/api/venue/1/addTimeBlock")
        .send(validTimeBlock);

      expect(response.status).toBe(200);
      expect(bookedTimeSave).toHaveBeenCalledWith(
        expect.objectContaining({
          date: validTimeBlock.date,
          time: validTimeBlock.time,
          duration: validTimeBlock.duration,
          venue: expect.objectContaining({ id: grandBallroom.id }),
        }),
      );
      expect(response.body.data.bookedTime).toMatchObject({
        date: validTimeBlock.date,
        time: validTimeBlock.time,
        duration: validTimeBlock.duration,
      });
    });

    //check for missing venue
    it("returns 404 when the venue does not exist", async () => {
      const response = await request(app)
        .post("/api/venue/999/addTimeBlock")
        .send(validTimeBlock);

      expectError(response, 404, "NOT_FOUND", "Venue does not exists");
    });

    //check for non-owner vendor
    it("forbids a vendor who does not own the venue", async () => {
      userFindOne.mockResolvedValue(otherVendor);
      venueFindOne.mockResolvedValue({
        ...grandBallroom,
        bookedTimes: [],
        applications: [],
      });

      const response = await request(app)
        .post("/api/venue/1/addTimeBlock")
        .send({ ...validTimeBlock, userId: otherVendor.id });

      expectError(
        response,
        403,
        "FORBIDDEN",
        "The Vendor cannot block Time slots because that person does not own it",
      );
    });

    //check for collision with an existing block
    it("rejects a time slot overlapping an existing block", async () => {
      venueFindOne.mockResolvedValue({
        ...grandBallroom,
        bookedTimes: [
          {
            id: 4,
            date: validTimeBlock.date,
            time: "09:00:00",
            duration: 3,
          },
        ],
        applications: [],
      });

      const response = await request(app)
        .post("/api/venue/1/addTimeBlock")
        .send(validTimeBlock);

      expectError(response, 400, "BAD_REQUEST", "The timing is already booked");
      expect(bookedTimeSave).not.toHaveBeenCalled();
    });

    //check for collision with an accepted application
    it("rejects a time slot overlapping an accepted application", async () => {
      venueFindOne.mockResolvedValue({
        ...grandBallroom,
        bookedTimes: [],
        applications: [
          {
            id: 20,
            status: "accepted",
            date: validTimeBlock.date,
            time: "11:00:00",
            duration: 3,
          },
        ],
      });

      const response = await request(app)
        .post("/api/venue/1/addTimeBlock")
        .send(validTimeBlock);

      expectError(response, 400, "BAD_REQUEST", "The timing is already booked");
      expect(bookedTimeSave).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/venue/:venueId/bookedTime/:blockId", () => {
    //check owner can unblock a time slot
    it("unblocks a time slot and returns the remaining blocks", async () => {
      const bookedTime = { id: 4, ...validTimeBlock };
      const remaining = [{ id: 5, ...validTimeBlock, time: "15:00:00" }];
      venueFindOne.mockResolvedValue(grandBallroom);
      bookedTimeFindOne.mockResolvedValue(bookedTime);
      bookedTimeFind.mockResolvedValue(remaining);

      const response = await request(app)
        .delete("/api/venue/1/bookedTime/4")
        .send({ userId: vendor.id });

      expect(response.status).toBe(200);
      expect(bookedTimeRemove).toHaveBeenCalledWith(bookedTime);
      expect(bookedTimeFind).toHaveBeenCalledWith({
        where: { venue: { id: 1 } },
      });
      expect(response.body.data.blockTimes).toEqual(remaining);
    });

    //check for missing venue
    it("returns 404 when the venue does not exist", async () => {
      const response = await request(app)
        .delete("/api/venue/999/bookedTime/4")
        .send({ userId: vendor.id });

      expectError(
        response,
        404,
        "NOT_FOUND",
        "There is no venue which exists with this id",
      );
    });

    //check for non-owner vendor
    it("forbids a vendor who does not own the venue", async () => {
      userFindOne.mockResolvedValue(otherVendor);
      venueFindOne.mockResolvedValue(grandBallroom);

      const response = await request(app)
        .delete("/api/venue/1/bookedTime/4")
        .send({ userId: otherVendor.id });

      expectError(
        response,
        403,
        "FORBIDDEN",
        "The Vendor cannot unblock time slots because that person does not own it",
      );
    });

    //check for missing blocked time
    it("returns 404 when the blocked time does not exist", async () => {
      venueFindOne.mockResolvedValue(grandBallroom);

      const response = await request(app)
        .delete("/api/venue/1/bookedTime/999")
        .send({ userId: vendor.id });

      expectError(
        response,
        404,
        "NOT_FOUND",
        "There is no bookedTime which exists with this id",
      );
    });
  });

  describe("PUT /api/venue/:venueId", () => {
    //check owner can update venue fields
    it("updates all venue fields for the owner", async () => {
      const venue = { ...grandBallroom };
      venueFindOne.mockResolvedValue(venue);
      const payload = {
        ...validVenuePayload,
        name: "Updated Venue",
        price: 1750,
        is_featured: false,
      };

      const response = await request(app).put("/api/venue/1").send(payload);

      expect(response.status).toBe(200);
      expect(venueSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: payload.name,
          price: payload.price,
          is_featured: payload.is_featured,
        }),
      );
      expect(response.body.data.venue).toMatchObject({
        name: payload.name,
        price: payload.price,
        is_featured: payload.is_featured,
      });
    });

    //check for missing venue
    it("returns 404 when the venue does not exist", async () => {
      const response = await request(app)
        .put("/api/venue/999")
        .send(validVenuePayload);

      expectError(response, 404, "NOT_FOUND", "Venue not found");
    });

    //check for non-owner vendor
    it("forbids a vendor who does not own the venue", async () => {
      userFindOne.mockResolvedValue(otherVendor);
      venueFindOne.mockResolvedValue(grandBallroom);

      const response = await request(app)
        .put("/api/venue/1")
        .send({ ...validVenuePayload, userId: otherVendor.id });

      expectError(
        response,
        403,
        "FORBIDDEN",
        "The Owner of the venue can only update it",
      );
      expect(venueSave).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/venue/:venueId", () => {
    //check for successful delete with cascades
    it("deletes the venue and relies on database cascades for related data", async () => {
      const venue = { ...grandBallroom, user: vendor };
      venueFindOne.mockResolvedValue(venue);
      userFindOne.mockResolvedValue({ ...vendor, venues: [gardenTerrace] });

      const response = await request(app).delete("/api/venue/1");

      expect(response.status).toBe(200);
      expect(applicationDelete).not.toHaveBeenCalled();
      expect(venueRemove).toHaveBeenCalledWith(venue);
      expect(response.body.data.venues).toEqual([gardenTerrace]);
    });

    //check for missing venue
    it("returns 404 when the venue does not exist", async () => {
      const response = await request(app).delete("/api/venue/999");

      expectError(response, 404, "NOT_FOUND", "Venue not found");
      expect(applicationDelete).not.toHaveBeenCalled();
      expect(venueRemove).not.toHaveBeenCalled();
    });

    //check for missing owner after delete
    it("returns 404 when the owner cannot be loaded after deletion", async () => {
      venueFindOne.mockResolvedValue({ ...grandBallroom, user: vendor });
      userFindOne.mockResolvedValue(null);

      const response = await request(app).delete("/api/venue/1");

      expectError(response, 404, "NOT_FOUND", "User not found");
      expect(venueRemove).toHaveBeenCalled();
    });
  });
});
