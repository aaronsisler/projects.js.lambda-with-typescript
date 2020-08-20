import { handler } from "./index";
import { responseBodyBuilder } from "../../utils/response-body-builder";
import { TOKEN_HEADER } from "../../config";

let mockValidateToken: jest.Mock;

jest.mock("../../services/auth-service", () => {
  return {
    AuthService: jest.fn(() => ({
      validateToken: mockValidateToken
    }))
  };
});

jest.mock("../../utils/response-body-builder", () => {
  return { responseBodyBuilder: jest.fn(() => "mock-body-built-response") };
});

describe("handlers/validate", () => {
  let callback: Function;
  let event: object = { headers: { [TOKEN_HEADER]: "mock-token" } };

  beforeEach(async () => {
    callback = jest.fn();
  });

  describe("when authentication is NOT successful", () => {
    const expectedResponse = {
      statusCode: 401,
      body: "Unauthorized"
    };

    beforeEach(async () => {
      mockValidateToken = jest.fn().mockRejectedValue({});
      await handler(event, undefined, callback);
    });

    it("should call the auth service with correct event", () => {
      expect(mockValidateToken).toHaveBeenCalledWith("mock-token");
    });

    it("should call the response body builder with the correct parameters", () => {
      expect(responseBodyBuilder).toHaveBeenCalledWith(expectedResponse);
    });

    it("should invoke the callback with the correct response", () => {
      expect(callback).toHaveBeenCalledWith(null, "mock-body-built-response");
    });
  });

  describe("when authentication is successful", () => {
    beforeEach(async () => {
      mockValidateToken = jest.fn().mockResolvedValue({});
      await handler(event, undefined, callback);
    });

    it("should call the response body builder with the correct parameters", () => {
      expect(responseBodyBuilder).toHaveBeenCalledWith({
        statusCode: 200,
        body: "OAuthToken validated!"
      });
    });

    it("should invoke the callback with the correct response", () => {
      expect(callback).toHaveBeenCalledWith(null, "mock-body-built-response");
    });
  });
});
