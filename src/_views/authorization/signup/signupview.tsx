"use client";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";

import { ScreenNames } from "@/_utilities/datatype/Auth/types/screenNames";
import EmailInputView from "@/_views/screens/emailview/emailview";
import CodeInputView from "@/_views/screens/codeInputView/codeinputview";
import FirstnameInputView from "@/_views/screens/firstnameView/firstnameView";
import LastnameInputView from "@/_views/screens/lastnameView/lastnameView";
import DOBInputView from "@/_views/screens/dobView/dobview";
import ImagePreView from "@/_views/screens/ImagePreView/imagepreview";
import NewPasswordnputView from "@/_views/screens/passwordview/passwordview";
import ConfirmPasswordnputView from "@/_views/screens/passwordview/confirmpasswordview";
import SuccessView from "@/_views/screens/successView/successView";

import { useSignupFlow } from "@/_utilities/hooks/auth/signup/useSignupFlow";

export default function SignupView() {
  const {
    show,
    screen,
    error,
    setError,
    selectedDate,
    setSelectedDate,
    open,
    close,
    back,
    clearNonPasswordErrors,
    onResendComplete,
    onResendClick,
    setSelectedAvatar,
    signupaction,
    signuppending,
  } = useSignupFlow();

  return (
    <>
      {/* Keep your intro + button behavior */}
      <p className="mt-2" style={{ padding: "0 5px", wordSpacing: "10px" }}>
        Welcome to Big Chief Ent, the #1 Black Entertainment site around. To check out our exclusive
        content for members only please start by clicking on the button.
      </p>

      <div className="text-center mt-4">
        <Button
          onClick={open}
          type="button"
          style={{
            backgroundColor: "#9c7248",
            borderColor: "#9c7248",
            fontSize: "16px",
            height: "50px",
          }}
        >
          Lets Get Started
        </Button>
      </div>

      <Modal show={show} onHide={close} size="sm" centered>
        <Modal.Header closeButton />

        <Modal.Body>
          <Form action={signupaction} autoComplete="off" id="signup" name="signup">
            {/* ✅ KEEP EXACT BRAND BLOCK (same as ResetView) */}
            <div className="mt-2" style={{ display: "flex", justifyContent: "center" }}>
              <div>
                <p style={{ fontFamily: "exlibris", fontSize: "50px", lineHeight: "20px", color: "black" }}>
                  BIG CHIEF
                  <br />
                  <span style={{ fontFamily: "teleMarines", fontSize: "16px", fontWeight: "bold" }}>
                    enteRtainMent
                  </span>
                </p>
              </div>
            </div>
            <div>
              {error && screen != ScreenNames.new_password_screen && (
                <p className="mt-2" style={{ color: "#F2003C", padding: "0 7px", fontWeight: "600" }}>
                  {error}
                </p>
              )}
            </div>

            {screen == ScreenNames.email_screen && (
              <EmailInputView
                prompt="Thank you for rocking with us frfr.  We really appreciate you.  Lets start by entering your email above."
                removeError={clearNonPasswordErrors}
              />
            )}

            {screen == ScreenNames.code_screen && (
              <CodeInputView
                prompt="Please enter the code that you recieved in your email. After 15 minutes, your code will expire and a Resend button will appear."
                onComplete={onResendComplete}
                onResendClick={onResendClick}
              />
            )}

            {screen == ScreenNames.firstname_screen && (
              <FirstnameInputView
                prompt="We Need to Get to know you now. Lets start by getting your firstname."
                removeError={clearNonPasswordErrors}
              />
            )}

            {screen == ScreenNames.lastname_screen && (
              <LastnameInputView prompt="Lets get your lastname now." removeError={clearNonPasswordErrors} />
            )}

            {screen == ScreenNames.dob_screen && (
              <DOBInputView
                prompt="Please select the date you was born."
                setDate={setSelectedDate}
                removeError={clearNonPasswordErrors}
              />
            )}

            {screen == ScreenNames.image_screen && <ImagePreView setFile={setSelectedAvatar} />}

            {screen == ScreenNames.new_password_screen && <NewPasswordnputView error={error} removeError={setError} />}

            {screen == ScreenNames.confirm_password_screen && (
              <ConfirmPasswordnputView removeError={clearNonPasswordErrors} />
            )}

            {screen == ScreenNames.success_screen && (
              <SuccessView prompt="You have successfully signed up, please continue to support as we add on to what we are already doing.  You will have user profiles coming soon. You can now login!!!!" />
            )}
          </Form>
        </Modal.Body>

        <Modal.Footer>
          {/* Match reset footer logic: show Back only on the correct screens */}
          {screen != ScreenNames.email_screen &&
            screen != ScreenNames.firstname_screen &&
            screen != ScreenNames.success_screen && (
              <Button
                style={{
                  backgroundColor: "#9c7248",
                  borderColor: "#9c7248",
                  fontSize: "16px",
                  width: "100px",
                  height: "50px",
                  marginRight: "auto",
                }}
                onClick={back}
              >
                Back
              </Button>
            )}

          {screen != ScreenNames.success_screen && (
            <Button
              disabled={signuppending}
              form="signup"
              type="submit"
              style={{
                backgroundColor: "#9c7248",
                borderColor: "#9c7248",
                fontSize: "16px",
                width: "100px",
                height: "50px",
              }}
            >
              {signuppending ? <Spinner animation="border" role="status" size="sm" /> : "Continue"}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}