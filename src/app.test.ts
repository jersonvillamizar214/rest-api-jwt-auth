import request from "supertest";
import { createApp } from "./app";

const app = createApp();

// These tests exercise routing, validation and auth middleware only —
// no database connection is required (paths that hit the DB are avoided).
describe("app (no-DB routes)", () => {
  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/does-not-exist");
    expect(res.status).toBe(404);
  });

  it("rejects registration with an invalid body (400 + details)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "A", email: "not-an-email", password: "short" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
    expect(res.body.details).toHaveProperty("email");
    expect(res.body.details).toHaveProperty("password");
    expect(res.body.details).toHaveProperty("name");
  });

  it("blocks protected route without a token (401)", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.status).toBe(401);
  });

  it("blocks protected route with a malformed token (401)", async () => {
    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", "Bearer garbage");
    expect(res.status).toBe(401);
  });
});
