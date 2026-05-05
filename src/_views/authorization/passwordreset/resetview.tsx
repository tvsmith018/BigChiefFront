"use client";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";

import { ScreenNames } from "@/_utilities/datatype/Auth/types/screenNames";
import EmailInputView from "@/_views/screens/emailview/emailview";
import CodeInputView from "@/_views/screens/codeInputView/codeinputview";
import NewPasswordnputView from "@/_views/screens/passwordview/passwordview";
import ConfirmPasswordnputView from "@/_views/screens/passwordview/confirmpasswordview";
import SuccessView from "@/_views/screens/successView/successView";
import {
  AUTH_PRIMARY_BUTTON_STYLE,
  AuthBackButton,
  AuthBrandHeader,
  AuthErrorBanner,
} from "@/_views/authorization/shared/AuthModalShared";

import { usePasswordResetFlow } from "@/_utilities/hooks/auth/passwordreset/usePasswordResetFlow";

export default function ResetView() {
  const {
    show,
    screen,
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
  } = usePasswordResetFlow();
  const submitLabel =
    screen == ScreenNames.confirm_password_screen ? "Submit" : "Continue";

  return (
    <>
      <div className="mb-4 d-flex justify-content-center">
        <button
          type="button"
          className="border-0 bg-transparent p-0 text-decoration-none shadow-none"
          style={{
            color: "#9c7248",
            cursor: "pointer",
            font: "inherit",
          }}
          onClick={open}
        >
          Forgot Password?
        </button>
      </div>

      <Modal show={show} onHide={close} size="sm" centered>
        <Modal.Header closeButton />

        <Modal.Body>
          <Form autoComplete="off" action={passwordresetaction} id="passwordreset" name="passwordreset">
            <AuthBrandHeader />
            <div>
              <AuthErrorBanner
                error={error}
                hide={screen == ScreenNames.new_password_screen}
              />
            </div>

            {screen == ScreenNames.email_screen && (
              <EmailInputView
                prompt={"Enter your email to the account you want to access to recieve code."}
                removeError={clearNonPasswordErrors}
              />
            )}

            {screen == ScreenNames.code_screen && (
              <CodeInputView
                prompt={
                  "Please enter the code that you recieved in your email. After 15 minutes, your code will expire and a Resend button will appear."
                }
                onComplete={onResendComplete}
                onResendClick={onResendClick}
              />
            )}

            {screen == ScreenNames.new_password_screen && (
              <NewPasswordnputView error={error} removeError={setError} />
            )}

            {screen == ScreenNames.confirm_password_screen && (
              <ConfirmPasswordnputView removeError={clearNonPasswordErrors} />
            )}

            {screen == ScreenNames.success_screen && (
              <SuccessView prompt="Your password was successfully changed.  You can now log in with your new password.  Please close the menu using X button." />
            )}
          </Form>
        </Modal.Body>

        {screen != ScreenNames.success_screen && (
          <Modal.Footer>
            {screen != ScreenNames.email_screen && screen != ScreenNames.new_password_screen && (
              <AuthBackButton onClick={back} />
            )}

            <Button
              form="passwordreset"
              type="submit"
              style={AUTH_PRIMARY_BUTTON_STYLE}
            >
              {passwordpending ? (
                <Spinner animation="border" role="status" size="sm" />
              ) : (
                submitLabel
              )}
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    </>
  );
}
