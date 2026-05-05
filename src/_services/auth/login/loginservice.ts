import { httpClient } from "@/_network";
import { JWTToken } from "@/_utilities/datatype/Auth/types/token";
import { User } from "@/_types/auth/user";

export class LoginService {
  static async getSession(email: string, password: string) {
    const res = await httpClient.request<JWTToken>(
      "/authorized/login/",
      {
        method: "POST",
        body: { email: email.toLowerCase(), password },
      },
      { cache: "no-store" }
    );

    return res;
  }

  static async getUser(token: { refresh: string; access: string }) {
    const res = await httpClient.request<User>(
      "/authorized/me/",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.access}`,
        },
      },
      { cache: "no-store" }
    );

    return res;
  }
}
