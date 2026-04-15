import { LoginSchema, EmailSchema, PasswordSchema, FirstnameSchema, LastnameSchema, DOBSchema } from "@/_utilities/datatype/Auth/Schemas/loginFormSchema";
import { createSession, deleteSession } from "@/_navigation";
import { User } from "@/_types/auth/user";
import { LoginActionResult } from "@/_types/auth/auth-state";
import { JWTToken } from "@/_utilities/datatype/Auth/types/token";
import { PasswordResetState, SignupState } from "@/_utilities/datatype/Auth/Schemas/loginFormSchema";
import { extractUser } from "./auth.helpers";
import { readOtp } from "./auth.helpers";
import { PasswordResetService } from "./passwordreset/passwordresetservice";
import { SignupService } from "./signup/signupservice";
import { LoginService } from "./login/loginservice";
import { SignupFieldErrors, SignupStateUserFields } from "@/_types/auth/signup/signupresponse";

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
    const loginResponse = await LoginService.getSession(email, password);
    if (loginResponse.detail) return { netError: `${loginResponse.detail}` };
    const JWTDATA: JWTToken = loginResponse;
    const token = {
      refresh: JWTDATA.refresh ?? "",
      access: JWTDATA.access ?? "",
    };

    const [userResponse] = await Promise.all([
      LoginService.getUser(token),
      createSession(token)
    ]);

    return (
      extractUser(userResponse as User | { data?: User }) ?? {
        netError: "Unable to load user profile. Our apologies!",
      }
    );
  } catch {
    return {
      netError: "Unable to load user profile. Our apologies!",
    }
  }
}

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
  flowVersion?: number;
} & SignupStateUserFields;

export async function signupAction(
  flowVersion: number,
  screen: string,
  genCode: string | undefined,
  dob: Date | undefined,
  firstnameInfo: string | undefined,
  lastnameInfo: string | undefined,
  emailInfo: string | undefined,
  passwordInfo: string | undefined,
  _state: SignupState,
  formData: FormData
): Promise<SignupStateTemp> {
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

  return {};
}

export async function logoutAction() {
  await deleteSession();
}
