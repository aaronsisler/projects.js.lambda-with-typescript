import axios from "axios";

import { TOKEN_VALIDATION_URL } from "../../config";

class AuthService {
  constructor() {}

  async validateToken(token: string): Promise<any> {
    let rawToken: string;

    if (!token) {
      throw new Error("No token found in headers");
    }

    try {
      [, rawToken] = token.split(" ");

      if (!rawToken) {
        throw new Error();
      }
    } catch (error) {
      throw new Error("No token found in headers");
    }

    let status: number;
    try {
      const response = await axios.get(TOKEN_VALIDATION_URL, {
        params: {
          id_token: rawToken
        }
      });
      status = response.status;
    } catch (error) {
      throw new Error("Validation call failed");
    }

    if (status !== 200) {
      throw new Error("Unauthorized");
    }
  }
}

export { AuthService };
