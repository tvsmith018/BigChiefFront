"use server";

import {
  LoginSchema,
  EmailSchema,
  PasswordSchema,
  FirstnameSchema,
  LastnameSchema,
  DOBSchema,
  PasswordResetState,
  SignupState,
} from "@/_utilities/datatype/Auth/Schemas/loginFormSchema";
import { createSession, deleteSession } from "@/_navigation";
import { User } from "@/_types/auth/user";
import { LoginActionResult } from "@/_types/auth/auth-state";
import { JWTToken } from "@/_utilities/datatype/Auth/types/token";
import { extractUser, readOtp } from "./auth.helpers";
import { PasswordResetService } from "./passwordreset/passwordresetservice";
import { SignupService } from "./signup/signupservice";
import { LoginService } from "./login/loginservice";
import { SignupFieldErrors, SignupStateUserFields } from "@/_types/auth/signup/signupresponse";

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

type PasswordResetActionState = {
  flowVersion?: number;
  screen?: string;
  code?: { code?: string };
  payload?: {
    email?: string;
    password?: string;
  };
  errors?: {
    email?: string[];
    password?: string[];
  };
  networkError?: string[];
  codeError?: string[];
  passwordError?: {
    password?: string[];
  };
  confirmError?: string[];
  success?: string;
};

type SignupActionArgs = [
  flowVersion: number,
  screen: string,
  genCode: string | undefined,
  dob: Date | undefined,
  firstnameInfo: string | undefined,
  lastnameInfo: string | undefined,
  emailInfo: string | undefined,
  passwordInfo: string | undefined,
  _state: SignupState,
  formData: FormData,
];

function getFormStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function handlePasswordResetEmailScreen(flowVersion: number, formData: FormData) {
  const validated = EmailSchema.safeParse({ email: formData.get("email") });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const email = String(validated.data.email);
  try {
    const { code, message } = await PasswordResetService.requestCode(email);

    if (message) return { errors: { email: [message] } };
    if (!code) return { networkError: ["Unable to generate code right now. Try again."] };

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

function handlePasswordResetCodeScreen(flowVersion: number, genCode: string | undefined, formData: FormData) {
  const otp = readOtp(formData);
  if (otp.length < 6) return { codeError: ["There is an empty box somewhere frfr..."] };
  if (!genCode || genCode !== otp) return { codeError: ["Not the right code please try again"] };
  return { flowVersion, screen: "new-password-screen" };
}

function handlePasswordResetNewPasswordScreen(flowVersion: number, formData: FormData) {
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

async function handlePasswordResetConfirmScreen(
  flowVersion: number,
  emailInfo: string | undefined,
  passwordInfo: string | undefined,
  formData: FormData,
) {
  const confirm = getFormStringValue(formData, "confirmnewpassword");
  if (!confirm) return { confirmError: ["Cannot be blanked!!!"] };
  if (!passwordInfo) return { confirmError: ["Missing password state, try again."] };
  if (confirm !== passwordInfo) return { confirmError: ["Passwords are not the same!!!!"] };

  try {
    if (!emailInfo) return { networkError: ["Missing email state, try again."] };
    const res = await PasswordResetService.submitNewPassword(emailInfo, passwordInfo);

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

function handleSignupCodeScreen(flowVersion: number, genCode: string | undefined, formData: FormData): SignupStateTemp {
  const otp = readOtp(formData);
  if (otp.length < 6) return { codeError: ["There is an empty box somewhere frfr..."] };
  if (!genCode || genCode !== otp) return { codeError: ["Not the right code please try again"] };
  return { flowVersion, screen: "firstname-screen" };
}

function handleSignupFirstnameScreen(flowVersion: number, formData: FormData): SignupStateTemp {
  const validated = FirstnameSchema.safeParse({ firstname: formData.get("firstname") });
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };
  return {
    flowVersion,
    screen: "lastname-screen",
    payload: { firstname: String(validated.data.firstname) },
  };
}

function handleSignupLastnameScreen(flowVersion: number, formData: FormData): SignupStateTemp {
  const validated = LastnameSchema.safeParse({ lastname: formData.get("lastname") });
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };
  return {
    flowVersion,
    screen: "dob-screen",
    payload: { lastname: String(validated.data.lastname) },
  };
}

function handleSignupDobScreen(flowVersion: number, dob: Date | undefined): SignupStateTemp {
  if (!dob) return { errors: { dob: ["Please select your date of birth."] } };

  const validated = DOBSchema.safeParse({ dob: dob.toDateString() });
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };
  return { flowVersion, screen: "image-screen" };
}

function handleSignupPasswordScreen(flowVersion: number, formData: FormData): SignupStateTemp {
  const validated = PasswordSchema.safeParse({ password: formData.get("newpassword") });
  if (!validated.success) return { passwordError: validated.error.flatten().fieldErrors };
  return {
    flowVersion,
    screen: "confirm-password-screen",
    payload: { password: String(validated.data.password) },
  };
}

export async function passwordResetAction(
  flowVersion: number,
  screen: string,
  genCode: string | undefined,
  emailInfo: string | undefined,
  passwordInfo: string | undefined,
  _state: PasswordResetState | PasswordResetActionState,
  formData: FormData,
): Promise<PasswordResetActionState | undefined> {
  switch (screen) {
    case "email-screen":
      return handlePasswordResetEmailScreen(flowVersion, formData);
    case "code-screen":
      return handlePasswordResetCodeScreen(flowVersion, genCode, formData);
    case "new-password-screen":
      return handlePasswordResetNewPasswordScreen(flowVersion, formData);
    case "confirm-password-screen":
      return handlePasswordResetConfirmScreen(flowVersion, emailInfo, passwordInfo, formData);
    default:
      return undefined;
  }
}

export async function loginAction(
  _state: LoginActionResult,
  formData: FormData,
): Promise<LoginActionResult> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
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

    await createSession(token);
    const userResponse = await LoginService.getUser(token);

    return (
      extractUser(userResponse as User | { data?: User }) ?? {
        netError: "Unable to load user profile. Our apologies!",
      }
    );
  } catch {
    return { netError: "Unable to load user profile. Our apologies!" };
  }
}

export async function signupAction(...args: SignupActionArgs): Promise<SignupStateTemp> {
  const [flowVersion, screen, genCode, dob, _firstnameInfo, _lastnameInfo, _emailInfo, _passwordInfo, _state, formData] = args;

  switch (screen) {
    case "email-screen": {
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
    case "code-screen":
      return handleSignupCodeScreen(flowVersion, genCode, formData);
    case "firstname-screen":
      return handleSignupFirstnameScreen(flowVersion, formData);
    case "lastname-screen":
      return handleSignupLastnameScreen(flowVersion, formData);
    case "dob-screen":
      return handleSignupDobScreen(flowVersion, dob);
    case "image-screen":
      return { flowVersion, screen: "new-password-screen" };
    case "new-password-screen":
      return handleSignupPasswordScreen(flowVersion, formData);
    default:
      return {};
  }
}

export async function logoutAction() {
  await deleteSession();
}
