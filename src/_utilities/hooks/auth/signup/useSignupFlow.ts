"use client";

import { useEffect, useMemo, useState, useActionState, useRef } from "react";
import { ScreenNames } from "@/_utilities/datatype/Auth/types/screenNames";
import { signupAction, signupCodeResend } from "@/_services/auth/authservices";

/**
 * Mirrors usePasswordResetFlow:
 * - local wizard state
 * - bind server action with current wizard state
 * - small helpers for UI (open/close/back/resend)
 */
export function useSignupFlow() {
  const [show, setShow] = useState(false);
  const [flowVersion, setFlowVersion] = useState(0);

  const [screen, setScreen] = useState<ScreenNames>(ScreenNames.email_screen);
  const [generatedID, setGeneratedID] = useState<string | undefined>(undefined);

  const [email, setEmail] = useState<string | undefined>(undefined);
  const [firstname, setFirstname] = useState<string | undefined>(undefined);
  const [lastname, setLastname] = useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedAvatar, setSelectedAvatar] = useState<File | undefined>(undefined);
  const [password, setPassword] = useState<string | undefined>(undefined);

  const [error, setError] = useState<string[] | undefined>(undefined);

  const boundAction = useMemo(() => {
    return signupAction.bind(
      null,
      flowVersion, 
      screen.toString(),
      generatedID,
      selectedDate,
      firstname,
      lastname,
      email,
      password,
      selectedAvatar
    );
  }, [screen, generatedID, selectedDate, firstname, lastname, email, password, selectedAvatar]);

  const [signupState, signupaction, signuppending] = useActionState(boundAction, undefined);
   const lastStateRef = useRef<typeof signupState>(undefined)

  const open = () => setShow(true);

  const close = () => {
    setShow(false);
    setFlowVersion((v) => v + 1);
    setTimeout(() => {
      setScreen(ScreenNames.email_screen);
      setGeneratedID(undefined);
      setEmail(undefined);
      setFirstname(undefined);
      setLastname(undefined);
      setSelectedDate(undefined);
      setSelectedAvatar(undefined);
      setPassword(undefined);
      setError(undefined);
    }, 500);
  };

  const back = () => {
    setError(undefined);
    setFlowVersion((v) => v + 1);

    if (screen === ScreenNames.code_screen) {
      setEmail(undefined);
      setScreen(ScreenNames.email_screen);
      return;
    }

    if (screen === ScreenNames.lastname_screen) {
      setFirstname(undefined);
      setScreen(ScreenNames.firstname_screen);
      return;
    }

    if (screen === ScreenNames.dob_screen) {
      setLastname(undefined);
      setScreen(ScreenNames.lastname_screen);
      return;
    }

    if (screen === ScreenNames.image_screen) {
      setSelectedDate(undefined);
      setScreen(ScreenNames.dob_screen);
      return;
    }

    if (screen === ScreenNames.new_password_screen) {
      setSelectedAvatar(undefined);
      setScreen(ScreenNames.image_screen);
      return;
    }

    if (screen === ScreenNames.confirm_password_screen) {
      setPassword(undefined);
      setScreen(ScreenNames.new_password_screen);
      return;
    }
  };

  const clearNonPasswordErrors = () => setError(undefined);

  const onResendComplete = async () => {
    setGeneratedID(undefined);
  };

  const onResendClick = async () => {
    if (!email) return;
    const data = await signupCodeResend(email);

    if (data.error) setError(data.error);
    if (data.networkError) setError(data.networkError);

    // align to your PasswordResetFlow style (data.code?.code)
    if (data.code) setGeneratedID(data.code.code);
  };

  useEffect(() => {
    if (!signupState) return;

    if (lastStateRef.current === signupState) return;
    lastStateRef.current = signupState;

    if ("flowVersion" in signupState && signupState.flowVersion !== flowVersion) {
      return;
    }

    // errors
    if (signupState.errors && screen === ScreenNames.email_screen) setError(signupState.errors.email);
    if (signupState.errors && screen === ScreenNames.firstname_screen) setError(signupState.errors.firstname);
    if (signupState.errors && screen === ScreenNames.lastname_screen) setError(signupState.errors.lastname);
    if (signupState.errors && screen === ScreenNames.dob_screen) setError(signupState.errors.dob);

    if (signupState.networkError) setError(signupState.networkError);
    if (signupState.codeError) setError(signupState.codeError);
    if (signupState.passwordError) setError(signupState.passwordError.password);
    if (signupState.confirmError) setError(signupState.confirmError);

    // advance screens (same logic you had, but organized)
    if (signupState.screen === "code-screen" && !signupState.errors) {
      setGeneratedID(signupState.gen_code);
      setEmail(signupState.payload?.email);
      setScreen(ScreenNames.code_screen);
    }

    if (signupState.screen === "firstname-screen" && !signupState.codeError) {
      setScreen(ScreenNames.firstname_screen);
    }

    if (signupState.screen === "lastname-screen" && !signupState.errors) {
      setFirstname(signupState.payload?.firstname);
      setScreen(ScreenNames.lastname_screen);
    }

    if (signupState.screen === "dob-screen" && !signupState.errors) {
      setLastname(signupState.payload?.lastname);
      setScreen(ScreenNames.dob_screen);
    }

    if (signupState.screen === "image-screen" && !signupState.errors) {
      setScreen(ScreenNames.image_screen);
    }

    if (signupState.screen === "new-password-screen" && !signupState.passwordError) {
      setScreen(ScreenNames.new_password_screen);
    }

    if (signupState.screen === "confirm-password-screen" && !signupState.confirmError) {
      setPassword(signupState.payload?.password);
      setScreen(ScreenNames.confirm_password_screen);
    }

    if (signupState.screen === "success-screen" && !signupState.networkError) {
      setScreen(ScreenNames.success_screen);
    }
  }, [signupState]);

  return {
    show,
    screen,
    error,
    setError,

    selectedDate,
    setSelectedDate,
    setSelectedAvatar,

    open,
    close,
    back,
    clearNonPasswordErrors,
    onResendComplete,
    onResendClick,

    signupaction,
    signuppending,
  };
}