"use client";

import { useEffect, useMemo, useState, useActionState, useRef } from "react";
import { ScreenNames } from "@/_utilities/datatype/Auth/types/screenNames";
import { passwordResetAction } from "@/_services/auth/authactions";
import { codeResend } from "@/_services/auth/passwordreset/passwordresetservice";

export function usePasswordResetFlow() {
  const [show, setShow] = useState(false);
  const [flowVersion, setFlowVersion] = useState(0);

  const [screen, setScreen] = useState<ScreenNames>(ScreenNames.email_screen);
  const [generatedID, setGeneratedID] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string[] | undefined>(undefined);

  const boundAction = useMemo(() => {
    return passwordResetAction.bind(null, flowVersion, screen.toString(), generatedID, email, password);
  }, [email, flowVersion, generatedID, password, screen]);

  const [passwordState, passwordresetaction, passwordpending] = useActionState(boundAction, undefined);
  const lastStateRef = useRef<typeof passwordState>(undefined);

  const open = () => setShow(true);

  const close = () => {
    setShow(false);
    setFlowVersion((v) => v + 1);
    setTimeout(() => {
      setScreen(ScreenNames.email_screen);
      setEmail("");
      setPassword("");
      setGeneratedID(undefined);
      setError(undefined);
    }, 500);
  };

  const back = () => {
    setError(undefined);
    setFlowVersion((v) => v + 1);
    if (screen === ScreenNames.code_screen) {
      setScreen(ScreenNames.email_screen);
      setEmail("");
      setError(undefined);
      return;
    }

    if (screen === ScreenNames.confirm_password_screen) {
      setScreen(ScreenNames.new_password_screen);
      setPassword("");
      setError(undefined);
      return;
    }
  };

  const clearNonPasswordErrors = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name !== "newpassword" && error) setError(undefined);
  };

  const onResendComplete = async () => {
    setGeneratedID(undefined);
  };

  const onResendClick = async () => {
    const data = await codeResend(email);

    if (data.error) setError(data.error);
    if (data.networkError) setError(data.networkError);
    if (data.code) setGeneratedID(data.code.code);
  };

  const applyPasswordResetErrors = (state: NonNullable<typeof passwordState>) => {
    if (state.errors && screen === ScreenNames.email_screen) setError(state.errors.email);
    if (state.networkError) setError(state.networkError);
    if (state.codeError) setError(state.codeError);
    if (state.passwordError) setError(state.passwordError.password);
    if (state.confirmError) setError(state.confirmError);
  };

  const applyPasswordResetScreenTransition = (state: NonNullable<typeof passwordState>) => {
    if (state.screen === "code-screen" && !state.errors) {
      if (state.payload?.email) setEmail(state.payload.email);
      setGeneratedID(state.code?.code);
      setScreen(ScreenNames.code_screen);
      return;
    }

    if (state.screen === "new-password-screen" && !state.codeError) {
      setScreen(ScreenNames.new_password_screen);
      return;
    }

    if (state.screen === "confirm-password-screen" && !state.passwordError) {
      if (state.payload?.password) setPassword(state.payload.password);
      setScreen(ScreenNames.confirm_password_screen);
      return;
    }

    if (state.screen === "success-screen" && !state.networkError) {
      setScreen(ScreenNames.success_screen);
    }
  };

  useEffect(() => {
    if (!passwordState) return;

    if (lastStateRef.current === passwordState) return;
    lastStateRef.current = passwordState;

    if ("flowVersion" in passwordState && passwordState.flowVersion !== flowVersion) {
      return;
    }

    applyPasswordResetErrors(passwordState);
    applyPasswordResetScreenTransition(passwordState);
  }, [flowVersion, passwordState, screen]);

  return {
    show,
    screen,
    email,
    error,
    setError,
    open,
    close,
    back,
    clearNonPasswordErrors,
    onResendComplete,
    onResendClick,
    passwordresetaction,
    passwordpending,
  };
}
