import { httpClient } from "@/_network";
import { OTPResponse } from "@/_types/auth/otp/otpresponse";
import { auth_end } from "@/_network";
import { normalizeOtp } from "../auth.helpers";
import { SignupResponse } from "@/_types/auth/signup/signupresponse";

export class SignupService {
  static async requestCode(email: string) {
    const res = await httpClient.request<OTPResponse>(
      auth_end.otp,
      {
        method: "POST",
        body: { email: email.toLowerCase(), otp_type: "signup" },
      },
      { cache: "no-store" }
    );

    return normalizeOtp(res as OTPResponse);
  }

  static async submitSignup(form: FormData) {
    const res = await httpClient.request<SignupResponse>(auth_end.signup, {
      method: "POST",
      body: form,
      headers: {
        "X-Signup-Client":
          typeof window === "undefined"
            ? "next-server-multipart-v1"
            : "browser-multipart-v1",
      },
    }, { cache: "no-store" });

    return res as SignupResponse;
  }
}

export async function signupCodeResend(email: string) {
  try {
    const { code, message } = await SignupService.requestCode(email);

    if (message) return { error: [message] };
    if (!code) return { networkError: ["Unable to resend code right now. Try again."] };

    return { code };
  } catch {
    return { networkError: ["Our Server Is Down. My Bad Yall"] };
  }
}
