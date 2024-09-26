import axios from "axios";
import { readUsers, createUser } from "../api/Users";

// Configure axios for the local server
const api = axios.create({
  baseURL: process.env.API_BASE_URL || "http://localhost:8000",
  validateStatus: function (status) {
    return status < 500; // Resolve only if the status code is less than 500
  },
});

describe("Users API", () => {
  describe("readUsers", () => {
    it("fetches users successfully", async () => {
      const response = await readUsers(api);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      // Add more specific assertions based on your API's response structure
    });
  });

  describe("createUser", () => {
    it("creates a user successfully", async () => {
      const newUser = {
        id: Date.now(), // or some unique integer
        username: "TestUser",
        email: `testuser_${Date.now()}@example.com`,
        full_name: "Test User",
      };

      const response = await createUser(api, { body: newUser });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("id");
      expect(response.data.name).toBe(newUser.name);
      expect(response.data.email).toBe(newUser.email);
      // The password should not be returned in the response
      expect(response.data).not.toHaveProperty("password");
    });

    it("handles validation error when creating user", async () => {
      const invalidUser = { name: "Invalid User" }; // Missing email and password

      try {
        await createUser(api, { body: invalidUser });
      } catch (error) {
        expect(error.response.status).toBe(422);
        expect(error.response.data).toHaveProperty("detail");
        // Add more specific assertions based on your API's error response structure
      }
    });
  });
});
