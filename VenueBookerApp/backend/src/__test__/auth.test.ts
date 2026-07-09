import request from "supertest";
import app from "../utils/server";

const expectValidationErrors = (
  response: request.Response,
  expectedProperties: string[],
) => {
  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Validation failed");

  for (const property of expectedProperties) {
    expect(response.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ property })]),
    );
  }
};

describe("Auth API", () => {
  describe("POST /api/auth/login", () => {
    it("returns 400 when the login payload is empty", async () => {
      const response = await request(app).post("/api/auth/login").send({});

      expectValidationErrors(response, ["username", "password"]);
    });

    //check for wrong type
    it("returns 400 when username and password are not strings", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ username: 123, password: true });

      expectValidationErrors(response, ["username", "password"]);
    });
  });

  describe("POST /api/auth/signup", () => {

    //check for missing fields
    it("returns 400 when required signup fields are missing", async () => {
      const response = await request(app).post("/api/auth/signup").send({});

      expectValidationErrors(response, [
        "email",
        "password",
        "first_name",
        "last_name",
        "username",
        "role",
      ]);
    });

    //check for validation fail
    it("returns 400 for an invalid email and phone number", async () => {
      const response = await request(app).post("/api/auth/signup").send({
        email: "invalid-email",
        password: "Password!",
        first_name: "Test",
        last_name: "User",
        username: "test-user",
        role: "hirer",
        phone: "123",
      });

      expectValidationErrors(response, ["email", "phone"]);
    });
  });
});
