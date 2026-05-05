"use client";

import { useEffect, useMemo, useState, useActionState, useRef, useCallback } from "react";
import { ScreenNames } from "@/_utilities/datatype/Auth/types/screenNames";
import { signupAction } from "@/_services/auth/authactions";
import { signupCodeResend } from "@/_services/auth/signup/signupservice";
import { completeSignupWithMultipart } from "@/_services/auth/signup/completeSignupWithMultipart";
import { storeUser } from "@/_store/reducers/user/userSlice";
import { useAppDispatch } from "@/_store/hooks/UseAppDispatch";
import { setAuthTransitioning } from "@/_store/reducers/app/appSlice";
import { useRouter } from "next/navigation";  

function getFormStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function useSignupFlow() {
  const dispatch = useAppDispatch();
  const router = useRouter();
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
  const [finalSubmitPending, setFinalSubmitPending] = useState(false);

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
      password
    );
  }, [
    email,
    firstname,
    flowVersion,
    generatedID,
    lastname,
    password,
    screen,
    selectedDate,
  ]);

  const handleConfirmSignup = useCallback(
    async (formData: FormData) => {
      setFinalSubmitPending(true);
      setError(undefined);
      try {
        const result = await completeSignupWithMultipart({
          confirmPassword: getFormStringValue(formData, "confirmnewpassword"),
          password: password ?? "",
          email: email ?? "",
          firstname: firstname ?? "",
          lastname: lastname ?? "",
          dob: selectedDate,
          avatar: selectedAvatar,
        });

        if ("ok" in result && result.ok) {
          setError(undefined);
          dispatch(setAuthTransitioning(true));
          dispatch(storeUser(result.user));
          router.replace("/profile");
          router.refresh();
          globalThis.window.setTimeout(() => {
            dispatch(setAuthTransitioning(false));
          }, 1500);
          return;
        }
        if ("confirmError" in result) setError(result.confirmError);
        if ("networkError" in result) setError(result.networkError);
      } finally {
        setFinalSubmitPending(false);
      }
    },
    [dispatch, router, email, firstname, lastname, password, selectedAvatar, selectedDate]
  );

  const [signupState, signupaction, signuppending] = useActionState(boundAction, undefined);
  const lastStateRef = useRef<typeof signupState>(undefined);

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

    if (data.code) setGeneratedID(data.code.code);
  };

  useEffect(() => {
    if (!signupState) return;

    if (lastStateRef.current === signupState) return;
    lastStateRef.current = signupState;

    if ("flowVersion" in signupState && signupState.flowVersion !== flowVersion) {
      return;
    }

    if (signupState.errors) {
      switch (screen) {
        case ScreenNames.email_screen:
          setError(signupState.errors.email);
          break;
        case ScreenNames.firstname_screen:
          setError(signupState.errors.firstname);
          break;
        case ScreenNames.lastname_screen:
          setError(signupState.errors.lastname);
          break;
        case ScreenNames.dob_screen:
          setError(signupState.errors.dob);
          break;
        default:
          break;
      }
    }

    if (signupState.networkError) setError(signupState.networkError);
    if (signupState.codeError) setError(signupState.codeError);
    if (signupState.passwordError) setError(signupState.passwordError.password);
    if (signupState.confirmError) setError(signupState.confirmError);

    switch (signupState.screen) {
      case "code-screen":
        if (!signupState.errors) {
          setGeneratedID(signupState.gen_code);
          setEmail(signupState.payload?.email);
          setScreen(ScreenNames.code_screen);
        }
        break;
      case "firstname-screen":
        if (!signupState.codeError) {
          setScreen(ScreenNames.firstname_screen);
        }
        break;
      case "lastname-screen":
        if (!signupState.errors) {
          setFirstname(signupState.payload?.firstname);
          setScreen(ScreenNames.lastname_screen);
        }
        break;
      case "dob-screen":
        if (!signupState.errors) {
          setLastname(signupState.payload?.lastname);
          setScreen(ScreenNames.dob_screen);
        }
        break;
      case "image-screen":
        if (!signupState.errors) {
          setScreen(ScreenNames.image_screen);
        }
        break;
      case "new-password-screen":
        if (!signupState.passwordError) {
          setScreen(ScreenNames.new_password_screen);
        }
        break;
      case "confirm-password-screen":
        if (!signupState.confirmError) {
          setPassword(signupState.payload?.password);
          setScreen(ScreenNames.confirm_password_screen);
        }
        break;
      case "success-screen":
        if (!signupState.networkError) {
          setScreen(ScreenNames.success_screen);
          setError(undefined);
        }
        break;
      default:
        break;
    }
  }, [flowVersion, screen, signupState]);

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
    handleConfirmSignup,
    signuppending: signuppending || finalSubmitPending,
  };
}
