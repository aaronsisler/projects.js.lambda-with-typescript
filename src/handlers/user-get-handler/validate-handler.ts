import { HandlerResponse } from "../../models/handler-response";
import { responseBodyBuilder } from "../../utils/response-body-builder";
import { AuthService } from "../../services/auth-service";
import { TOKEN_HEADER } from "../../config";

const validate = async (event: any, _context: any, callback: any) => {
  let token: string;

  try {
    token = event.headers[TOKEN_HEADER];

    const authService = new AuthService();
    await authService.validateToken(token);
  } catch (error) {
    const response: HandlerResponse = responseBodyBuilder({
      statusCode: 401,
      body: "Unauthorized"
    });

    return callback(null, response);
  }

  const response: HandlerResponse = responseBodyBuilder({
    statusCode: 200,
    body: "OAuthToken validated!"
  });

  return callback(null, response);
};

export { validate };
