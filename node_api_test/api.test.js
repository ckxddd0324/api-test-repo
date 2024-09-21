const request = require("supertest");

const apiUrl = "http://localhost:8000"; // Replace with your FastAPI URL

describe("Test FastAPI endpoints", () => {
  it("should return all items", async () => {
    const res = await request(apiUrl).get("/items/");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it("should create a new item", async () => {
    const newItem = { id: 1, name: "Test Item", price: 100 };
    const res = await request(apiUrl).post("/items/").send(newItem);
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual("Test Item");
  });

  it("should get id by id", async () => {
    const res = await request(apiUrl).get("/items/1");
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(1);
  });
});
