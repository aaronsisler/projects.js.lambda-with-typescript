import axios from "axios";
import { AuthService } from "./index";

jest.mock("../../config", () => ({
  TOKEN_VALIDATION_URL: "mock-token-validation-url"
}));

jest.mock("axios", () => ({ get: jest.fn() }));

describe("services/AuthService", () => {
  let authService: AuthService;
  const mockRequest = { headers: { "mock-token-header": "mock-token" } };

  beforeEach(() => {
    authService = new AuthService();
  });

  it("should be a class", () => {
    expect(typeof AuthService).toEqual("function");
    expect(typeof authService).toEqual("object");
  });

  describe("when token validation is invoked", () => {
    describe("and token is empty", () => {
      it("should throw the correct error", async () => {
        expect.assertions(1);
        try {
          authService = new AuthService();
          await authService.validateToken(undefined);
        } catch (error) {
          expect(error.message).toBe("No token found in headers");
        }
      });
    });

    describe("and token is NOT correct", () => {
      it("should throw the correct error", async () => {
        expect.assertions(1);
        try {
          authService = new AuthService();
          await authService.validateToken("No-bearer-token");
        } catch (error) {
          expect(error.message).toBe("No token found in headers");
        }
      });
    });

    describe("and token is correct", () => {
      const validToken = "Bearer mock-valid-token";

      describe("and call is successful", () => {
        it("should call the validation endpoint with correct parameter", async () => {
          axios.get = jest.fn().mockResolvedValue({ status: 200 });
          authService = new AuthService();
          await authService.validateToken(validToken);

          expect(axios.get).toHaveBeenCalledWith("mock-token-validation-url", {
            params: { id_token: "mock-valid-token" }
          });
        });

        describe("when returned status is NOT 200", () => {
          it("should throw the correct error", async () => {
            axios.get = jest.fn().mockResolvedValue({ status: 403, data: {} });

            try {
              authService = new AuthService();
              await authService.validateToken(validToken);
            } catch (error) {
              expect(error.message).toBe("Unauthorized");
            }
          });
        });
      });

      describe("and call is NOT successful", () => {
        const expectedError = "mock-error";

        beforeEach(() => {
          axios.get = jest.fn().mockRejectedValue(expectedError);
          authService = new AuthService();
        });

        it("should call the validation endpoint with correct parameter", async () => {
          expect.assertions(1);
          try {
            authService = new AuthService();
            await authService.validateToken(validToken);
          } catch (error) {
            expect(axios.get).toHaveBeenCalledWith(
              "mock-token-validation-url",
              {
                params: { id_token: "mock-valid-token" }
              }
            );
          }
        });

        it("should throw the correct error", async () => {
          try {
            authService = new AuthService();
            await authService.validateToken(validToken);
          } catch (error) {
            expect(error.message).toBe("Validation call failed");
          }
        });
      });
    });
  });
});
