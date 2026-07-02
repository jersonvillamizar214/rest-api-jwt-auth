import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  TokenPayload,
} from "./jwt";

const payload: TokenPayload = {
  sub: "user-123",
  email: "user@example.com",
  role: "USER",
};

describe("jwt utils", () => {
  it("signs and verifies an access token round-trip", () => {
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it("signs and verifies a refresh token round-trip", () => {
    const token = signRefreshToken(payload);
    const decoded = verifyRefreshToken(token);
    expect(decoded.sub).toBe(payload.sub);
  });

  it("rejects an access token verified with the refresh secret", () => {
    const token = signAccessToken(payload);
    expect(() => verifyRefreshToken(token)).toThrow();
  });

  it("rejects a tampered token", () => {
    const token = signAccessToken(payload);
    expect(() => verifyAccessToken(token + "tampered")).toThrow();
  });
});
