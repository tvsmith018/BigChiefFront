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

    const transitions: Partial<Record<ScreenNames, () => void>> = {
      [ScreenNames.code_screen]: () => {
        setEmail(undefined);
        setScreen(ScreenNames.email_screen);
      },
      [ScreenNames.lastname_screen]: () => {
        setFirstname(undefined);
        setScreen(ScreenNames.firstname_screen);
      },
      [ScreenNames.dob_screen]: () => {
        setLastname(undefined);
        setScreen(ScreenNames.lastname_screen);
      },
      [ScreenNames.image_screen]: () => {
        setSelectedDate(undefined);
        setScreen(ScreenNames.dob_screen);
      },
      [ScreenNames.new_password_screen]: () => {
        setSelectedAvatar(undefined);
        setScreen(ScreenNames.image_screen);
      },
      [ScreenNames.confirm_password_screen]: () => {
        setPassword(undefined);
        setScreen(ScreenNames.new_password_screen);
      },
    };

    transitions[screen]?.();
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

  const applySignupErrors = (state: NonNullable<typeof signupState>) => {
    if (state.errors) {
      switch (screen) {
        case ScreenNames.email_screen:
          setError(state.errors.email);
          break;
        case ScreenNames.firstname_screen:
          setError(state.errors.firstname);
          break;
        case ScreenNames.lastname_screen:
          setError(state.errors.lastname);
          break;
        case ScreenNames.dob_screen:
          setError(state.errors.dob);
          break;
        default:
          break;
      }
    }

    if (state.networkError) setError(state.networkError);
    if (state.codeError) setError(state.codeError);
    if (state.passwordError) setError(state.passwordError.password);
    if (state.confirmError) setError(state.confirmError);
  };

  const applySignupScreenTransition = (state: NonNullable<typeof signupState>) => {
    const transitions: Record<
      string,
      {
        canAdvance: (value: NonNullable<typeof signupState>) => boolean;
        advance: (value: NonNullable<typeof signupState>) => void;
      }
    > = {
      "code-screen": {
        canAdvance: (value) => !value.errors,
        advance: (value) => {
          setGeneratedID(value.gen_code);
          setEmail(value.payload?.email);
          setScreen(ScreenNames.code_screen);
        },
      },
      "firstname-screen": {
        canAdvance: (value) => !value.codeError,
        advance: () => {
          setScreen(ScreenNames.firstname_screen);
        },
      },
      "lastname-screen": {
        canAdvance: (value) => !value.errors,
        advance: (value) => {
          setFirstname(value.payload?.firstname);
          setScreen(ScreenNames.lastname_screen);
        },
      },
      "dob-screen": {
        canAdvance: (value) => !value.errors,
        advance: (value) => {
          setLastname(value.payload?.lastname);
          setScreen(ScreenNames.dob_screen);
        },
      },
      "image-screen": {
        canAdvance: (value) => !value.errors,
        advance: () => {
          setScreen(ScreenNames.image_screen);
        },
      },
      "new-password-screen": {
        canAdvance: (value) => !value.passwordError,
        advance: () => {
          setScreen(ScreenNames.new_password_screen);
        },
      },
      "confirm-password-screen": {
        canAdvance: (value) => !value.confirmError,
        advance: (value) => {
          setPassword(value.payload?.password);
          setScreen(ScreenNames.confirm_password_screen);
        },
      },
      "success-screen": {
        canAdvance: (value) => !value.networkError,
        advance: () => {
          setScreen(ScreenNames.success_screen);
          setError(undefined);
        },
      },
    };

    const transition = state.screen ? transitions[state.screen] : undefined;
    if (!transition?.canAdvance(state)) {
      return;
    }
    transition.advance(state);
  };

  useEffect(() => {
    if (!signupState) return;

    if (lastStateRef.current === signupState) return;
    lastStateRef.current = signupState;

    if ("flowVersion" in signupState && signupState.flowVersion !== flowVersion) {
      return;
    }

    applySignupErrors(signupState);
    applySignupScreenTransition(signupState);
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
