import { SignupService } from "./signupservice";
import { SignupMultipartResult } from "@/_types/auth/signup/signupmultipartResult";
import { LoginService } from "@/_services/auth/login/loginservice";
import { createSession } from "@/_navigation";
import { extractUser } from "../auth.helpers";
import {
  type SignupConfirmInput,
  validateSignupConfirmInput,
} from "./signupValidation";

export async function completeSignupWithMultipart(
  input: SignupConfirmInput
): Promise<SignupMultipartResult> {
  const validation = validateSignupConfirmInput(input);
  if (validation) return validation;

  const dob = input.dob!;

  const formDataSignup = new FormData();
  formDataSignup.append("email", input.email.toLowerCase());
  formDataSignup.append("firstname", input.firstname);
  formDataSignup.append("lastname", input.lastname);
  formDataSignup.append("dob", dob.toISOString().split("T")[0]);
  formDataSignup.append("password", input.password);
  if (input.avatar) {
    formDataSignup.append("avatar", input.avatar);
  }

  try {
    const res = await SignupService.submitSignup(formDataSignup);
    if (res?.data !== "User registered successfully") {
      return {
        networkError: [
          "We was not able to sign you up at this time please try again later",
        ],
      };
    }

    const loginResponse = await LoginService.getSession(
      input.email.toLowerCase(),
      input.password
    );
    if ("detail" in loginResponse && loginResponse.detail) {
      return {
        networkError: [`Unable to login. Our apologies! ${loginResponse.detail}`],
      };
    }

    const token = {
      refresh: loginResponse.refresh ?? "",
      access: loginResponse.access ?? "",
    };

    const [userResponse] = await Promise.all([
      LoginService.getUser(token),
      createSession(token),
    ]);

    const user = extractUser(userResponse);
    if (!user) {
      return { networkError: ["Unable to load user profile. Our apologies!"] };
    }
    
    return { ok: true, user };
  } catch {
    return { networkError: ["Our Server Is Down. My Bad Yall"] };
  }
}
