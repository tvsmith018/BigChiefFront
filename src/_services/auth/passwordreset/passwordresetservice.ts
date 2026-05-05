import { auth_end, httpClient } from "@/_network";
import { OTPResponse } from "@/_types/auth/otp/otpresponse";
import { normalizeOtp } from "../auth.helpers";
import { ResetPasswordResponse } from "@/_types/auth/passwordrest/resetpasswordresponse";

export class PasswordResetService {

    static async requestCode(email: string) {
      const res = await httpClient.request<OTPResponse>(auth_end.otp, {
        method: "POST",
        body: { email: email.toLowerCase(), otp_type: "password-reset" },
      }, {cache:"no-store"});
  
      return normalizeOtp(res);
    }
  
    static async submitNewPassword(email: string, password: string) {
      const res = await httpClient.request<ResetPasswordResponse>(auth_end.resetPassword, {
        method: "POST",
        body: { email: email.toLowerCase(), password:password },
      }, {cache:"no-store"});
  
      return res;
    }
  }

  export async function codeResend(email: string) {
    try {
      const { code, message } = await PasswordResetService.requestCode(email);
  
      if (message) return { error: [message] };
      if (!code) return { networkError: ["Unable to resend code right now. Try again."] };
  
      return { code };
    } catch {
      return { networkError: ["Our Server Is Down. My Bad Yall"] };
    }
  }