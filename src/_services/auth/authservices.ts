
import { LoginSchema, EmailSchema, PasswordSchema, FirstnameSchema, LastnameSchema, DOBSchema } from "@/_utilities/datatype/Auth/Schemas/loginFormSchema";
import { createSession, deleteSession } from "@/_navigation";
import { API_BASE_URL, resolveHttpBaseUrl } from "@/_network/config/endpoints";
import { User } from "@/_types/auth/user";
import { LoginActionResult } from "@/_types/auth/auth-state";
import { JWTToken } from "@/_utilities/datatype/Auth/types/token";
import { auth_end, httpClient } from "@/_network";
import { PasswordResetState, SignupState } from "@/_utilities/datatype/Auth/Schemas/loginFormSchema";

type GenerateOtpResponse = {
  data?: {code:string};     // support alternate shape just in case
  message?: string;
  success?: boolean;
};

type ResetPasswordResponse = {
  message?: string;
  success?: boolean;
};


type SignupResponse = {
  data?: string
  message?: string;
  success?: boolean;
};

function normalizeOtp(resp: GenerateOtpResponse) {
  const code = resp.data;
  return { code, message: resp.message };
}

function extractUser(payload: User | { data?: User } | null | undefined): User | null {
  if (!payload) return null;
  if ("data" in payload && payload.data) return payload.data;
  return payload as User;
}

function readOtp(formData: FormData) {
  let otp = "";
  for (let i = 0; i <= 5; i++) otp += String(formData.get(`texbox-${i}`) ?? "");
  return otp;
}

/**
 * 🔁 Resend code (used by CodeInputView)
 */
export async function codeResend(email: string) {
  try {
    const { code, message } = await PasswordResetService.requestCode(email);
    console.log(code)

    if (message) return { error: [message] };
    if (!code) return { networkError: ["Unable to resend code right now. Try again."] };

    return { code };
  } catch {
    return { networkError: ["Our Server Is Down. My Bad Yall"] };
  }
}

/**
 * 🔁 Resend code for SIGNUP (separate from password reset resend)
 */
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

export class PasswordResetService {

  static async requestCode(email: string) {
    const res = await httpClient.request<GenerateOtpResponse>(auth_end.otp, {
      method: "POST",
      body: { email: email.toLowerCase(), otp_type: "password-reset" },
    }, {cache:"no-store"});

    // httpClient returns res.json() directly — might not be ApiResponse<T>
    // so we treat it as unknown and normalize

    return normalizeOtp(res as GenerateOtpResponse);
  }

  static async submitNewPassword(email: string, password: string) {
    const res = await httpClient.request<ResetPasswordResponse>(auth_end.resetPassword, {
      method: "POST",
      body: { email: email.toLowerCase(), password:password },
    }, {cache:"no-store"});

    return res as ResetPasswordResponse;
  }
}

/**
 * 🔁 Server Action: multi-step password reset state machine
 * screen: email-screen -> code-screen -> new-password-screen -> confirm-password-screen -> success-screen
 */
export async function passwordResetAction(
  flowVersion: number,
  screen: string,
  genCode: string | undefined,
  emailInfo: string | undefined,
  passwordInfo: string | undefined,
  _state: PasswordResetState,
  formData: FormData
) {
  // 1) EMAIL SCREEN
  if (screen === "email-screen") {
    const validated = EmailSchema.safeParse({ email: formData.get("email") });
    if (!validated.success) {
      return { errors: validated.error.flatten().fieldErrors };
    }

    const email = String(validated.data.email);

    try {

      const { code, message } = await PasswordResetService.requestCode(email);

      if (message) {
        return { errors: { email: [message] } };
      }
      if (!code) {
        return { networkError: ["Unable to generate code right now. Try again."] };
      }

      return {
        flowVersion,
        screen: "code-screen",
        code,
        payload: { email },
      };
    } catch {
      return { networkError: ["Our Server Is Down. My Bad Yall"] };
    }
  }

  // 2) CODE SCREEN
  if (screen === "code-screen") {
    const otp = readOtp(formData);

    if (otp.length < 6) {
      return { codeError: ["There is an empty box somewhere frfr..."] };
    }

    if (!genCode || genCode !== otp) {
      return { codeError: ["Not the right code please try again"] };
    }

    return { flowVersion, screen: "new-password-screen" };
  }

  // 3) NEW PASSWORD SCREEN
  if (screen === "new-password-screen") {
    const validated = PasswordSchema.safeParse({ password: formData.get("newpassword") });
    if (!validated.success) {
      return { passwordError: validated.error.flatten().fieldErrors };
    }

    const password = String(validated.data.password);

    return {
      flowVersion,
      screen: "confirm-password-screen",
      payload: { password },
    };
  }

  // 4) CONFIRM PASSWORD SCREEN
  if (screen === "confirm-password-screen") {
    const confirm = String(formData.get("confirmnewpassword") ?? "");

    if (!confirm) return { confirmError: ["Cannot be blanked!!!"] };
    if (!passwordInfo) return { confirmError: ["Missing password state, try again."] };
    if (confirm !== passwordInfo) return { confirmError: ["Passwords are not the same!!!!"] };

    try {
      if (!emailInfo) return { networkError: ["Missing email state, try again."] };

      const res = await PasswordResetService.submitNewPassword(emailInfo, passwordInfo);

      // preserve your backend messages
      if (
        res?.message === "User Do not exist" ||
        res?.message === "Password already in use"
      ) {
        return { networkError: [res.message] };
      }

      return { flowVersion, success: "Password Successfully change", screen: "success-screen" };
    } catch {
      return { networkError: ["Our Server Is Down. My Bad Yall"] };
    }
  }

  return undefined;
}

class LoginService {
  static async getSession(email:string, password:string) {
    const res = await httpClient.request<JWTToken>("/authorized/login/", {
      method: "POST",
      body: { email: email.toLowerCase(), password:password },
    }, {cache:"no-store"});

    return res as JWTToken
  }

  static async getUser(token:{refresh:string, access:string}) {
    const res = await httpClient.request<User>("/authorized/me/",{
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.access}`,
        },
    },{cache:"no-store"})

    return res
  }
}

export async function loginAction(
  _state: LoginActionResult,
  formData: FormData
): Promise<LoginActionResult> {
  /** 1️⃣ Validate input */
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;

  try {
    const loginResponse = await LoginService.getSession(email, password)
    if (loginResponse.detail) return { netError: `${loginResponse.detail}` };
    const JWTDATA: JWTToken = loginResponse;
    const token = {
      refresh: JWTDATA.refresh ?? "",
      access: JWTDATA.access ?? ""
    }
    
    const [userResponse] = await Promise.all([
      LoginService.getUser(token),
      createSession(token)
    ]);

    return extractUser(userResponse as User | { data?: User }) ?? {
      netError: "Unable to load user profile. Our apologies!",
    }
    
  } catch {
    return {
      netError: "Unable to load user profile. Our apologies!",
    }
  }
}

export class SignupService {


  static async requestCode(email: string) {
    const res = await httpClient.request<GenerateOtpResponse>(auth_end.otp, {
      method: "POST",
      body: { email: email.toLowerCase(), otp_type: "signup" },
    }, {cache:"no-store"});

    return normalizeOtp(res as GenerateOtpResponse);
  }

  static async submitSignup(form: FormData) {
    // raw fetch because of multipart
    const res = await fetch(`${resolveHttpBaseUrl(API_BASE_URL)}${auth_end.signup}`, {
      method: "POST",
      body: form,
      credentials: "include",
    });

    const json = await res.json().catch(() => ({}));
    return json as SignupResponse;
  }
}


/**
 * 🔁 Server Action: Signup wizard
 * email-screen -> code-screen -> firstname-screen -> lastname-screen -> dob-screen -> image-screen -> new-password-screen -> confirm-password-screen -> success-screen
 */

type SignupFieldErrors = {
  email?: string[];
  firstname?: string[];
  lastname?: string[];
  dob?: string[];
};

type SignupStateTemp = {
  errors?: SignupFieldErrors;
  networkError?: string[];
  codeError?: string[];
  passwordError?: {
    password?: string[];
  };
  confirmError?: string[];
  screen?: string;
  payload?: {
    email?: string;
    firstname?: string;
    lastname?: string;
    password?: string;
  };
  gen_code?: string;
  success?: string;
  flowVersion?:number
};

export async function signupAction(
  flowVersion: number,
  screen: string,
  genCode: string | undefined,
  dob: Date | undefined,
  firstnameInfo: string | undefined,
  lastnameInfo: string | undefined,
  emailInfo: string | undefined,
  passwordInfo: string | undefined,
  avatarInfo: File | undefined,
  _state: SignupState,
  formData: FormData
):Promise<SignupStateTemp> {
  // 1) EMAIL SCREEN
  if (screen === "email-screen") {
    const validated = EmailSchema.safeParse({ email: formData.get("email") });
    if (!validated.success) {
      return { errors: validated.error.flatten().fieldErrors };
    }

    const email = String(validated.data.email);

    try {

      const { code, message } = await SignupService.requestCode(email);

      if (message) return { errors: { email: [message] } };
      if (!code) return { networkError: ["Unable to generate code right now. Try again."] };

      return {
        flowVersion,
        screen: "code-screen",
        payload: { email },
        gen_code: code.code,
      };
    } catch {
      return { networkError: ["Our Server Is Down. My Bad Yall"] };
    }
  }

  // 2) CODE SCREEN
  if (screen === "code-screen") {
    const otp = readOtp(formData);

    if (otp.length < 6) return { codeError: ["There is an empty box somewhere frfr..."] };
    if (!genCode || genCode !== otp) return { codeError: ["Not the right code please try again"] };

    return { flowVersion, screen: "firstname-screen" };
  }

  // 3) FIRSTNAME SCREEN
  if (screen === "firstname-screen") {
    const validated = FirstnameSchema.safeParse({ firstname: formData.get("firstname") });
    if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

    const firstname = String(validated.data.firstname);

    return {
      flowVersion,
      screen: "lastname-screen",
      payload: { firstname },
    };
  }

  // 4) LASTNAME SCREEN
  if (screen === "lastname-screen") {
    const validated = LastnameSchema.safeParse({ lastname: formData.get("lastname") });
    if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

    const lastname = String(validated.data.lastname);

    return {
      flowVersion,
      screen: "dob-screen",
      payload: { lastname },
    };
  }

  // 5) DOB SCREEN (dob is controlled by state, not formData)
  if (screen === "dob-screen") {
    if (!dob) return { errors: { dob: ["Please select your date of birth."] } };

    const validated = DOBSchema.safeParse({ dob: dob.toDateString() });
    if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

    return { flowVersion, screen: "image-screen" };
  }

  // 6) IMAGE SCREEN (your current flow just advances)
  if (screen === "image-screen") {
    return { flowVersion, screen: "new-password-screen" };
  }

  // 7) NEW PASSWORD SCREEN
  if (screen === "new-password-screen") {
    const validated = PasswordSchema.safeParse({ password: formData.get("newpassword") });
    if (!validated.success) return { passwordError: validated.error.flatten().fieldErrors };

    const password = String(validated.data.password);

    return {
      flowVersion,
      screen: "confirm-password-screen",
      payload: { password },
    };
  }

  // 8) CONFIRM PASSWORD SCREEN
  if (screen === "confirm-password-screen") {
    const confirm = String(formData.get("confirmnewpassword") ?? "");

    if (!confirm) return { confirmError: ["Cannot be blanked!!!"] };
    if (!passwordInfo) return { confirmError: ["Missing password state, try again."] };
    if (confirm !== passwordInfo) return { confirmError: ["Passwords are not the same!!!!"] };

    if (!emailInfo) return { networkError: ["Missing email state, try again."] };
    if (!firstnameInfo) return { networkError: ["Missing firstname state, try again."] };
    if (!lastnameInfo) return { networkError: ["Missing lastname state, try again."] };
    if (!dob) return { networkError: ["Missing dob state, try again."] };

    const birthdate = dob.toISOString().split("T")[0];

    const signupForm = new FormData();
    signupForm.append("firstname", firstnameInfo.toUpperCase());
    signupForm.append("lastname", lastnameInfo.toUpperCase());
    signupForm.append("dob", birthdate);
    signupForm.append("email", emailInfo.toLowerCase());
    signupForm.append("password", passwordInfo);

    // only append avatar if present
    if (avatarInfo) signupForm.append("avatar", avatarInfo);

    try {
      const res = await SignupService.submitSignup(signupForm);

      if (res?.data === "User registered successfully") {
        return { flowVersion, success: "Signup Successfully Completed", screen: "success-screen" };
      }

      return { networkError: ["We was not able to sign you up at this time please try again later"] };
    } catch {
      return { networkError: ["We was not able to sign you up at this time please try again later"] };
    }
  }

  return {};
}

export async function logoutAction() {
    await deleteSession();
}

