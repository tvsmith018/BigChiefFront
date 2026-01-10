import { useState, useActionState, useEffect } from "react";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import { passwordResetAction, codeResend } from "../../../../../_utilities/network/Authorization/actions/auth";
import { ScreenNames } from '../../../../../_utilities/datatype/Auth/types/screenNames';
import EmailInputView from "@/_views/screens/emailview/emailview";
import CodeInputView from "@/_views/screens/codeInputView/codeinputview";
import NewPasswordnputView from "@/_views/screens/passwordview/passwordview";
import ConfirmPasswordnputView from "@/_views/screens/passwordview/confirmpasswordview";
import SuccessView from "@/_views/screens/successView/successView";

export default function ResetView() {

  const [show, setShow] = useState(false);

  const [screen, setScreen] = useState<ScreenNames>(ScreenNames.email_screen)
  const [generatedID, setGeneratedID] = useState<string|undefined>(undefined)
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string[]|undefined>(undefined)

  const boundedPasswordResetAction = passwordResetAction.bind(null, screen.toString(), generatedID, email, password);
  const [passwordState, passwordresetaction, passwordpending] = useActionState(boundedPasswordResetAction, undefined);

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setTimeout(()=>{
      setScreen(ScreenNames.email_screen);
      setEmail("");
      setPassword("");
      setError(undefined);
    },500)
  };

  const handleBack = () => {
    if (screen == ScreenNames.code_screen) {
      setScreen(ScreenNames.email_screen)
      setError(undefined);
      setEmail("");
    }

    if (screen == ScreenNames.confirm_password_screen) {
      setScreen(ScreenNames.new_password_screen)
      setPassword("");
      setError(undefined);
    }
  }

  const handleErrorRemove = (e:React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    
    if (name != "newpassword") {
      if (error != undefined) {
        setError(undefined)
      }
    }
  }

  const onResendComplete = async () => {
    setGeneratedID(undefined)
  }

  const resendClick = async () => {
    const data = await codeResend(email)
    
    if(data.error){
      setError(data.error)
    }

    if (data.networkError) {
      setError(data.networkError)
    }

    if (data.code) {
      setGeneratedID(data.code)
    }
  }

  useEffect(()=>{
    if (passwordState?.errors){
      if (screen == ScreenNames.email_screen){
        setError(passwordState.errors?.email)
      }
    }

    if (passwordState?.networkError) {
      setError(passwordState.networkError)
    }

    if (passwordState?.codeError) {
      setError(passwordState?.codeError)
    }

    if (passwordState?.passwordError) {
      setError(passwordState?.passwordError.password)
    }

    if (passwordState?.confirmError){
      setError(passwordState.confirmError)
    }

    if (passwordState?.screen == "code-screen" && !passwordState?.errors) {
      if (passwordState.payload?.email) {
        setEmail(passwordState.payload.email)
      }
      setGeneratedID(passwordState.code)
      setScreen(ScreenNames.code_screen)
    }

    if (passwordState?.screen == "new-password-screen" && !passwordState.codeError){
      setScreen(ScreenNames.new_password_screen)
    }

    if (passwordState?.screen == "confirm-password-screen" && !passwordState.passwordError){
      if (passwordState.payload?.password){
        setPassword(passwordState.payload.password)
      }
      setScreen(ScreenNames.confirm_password_screen)
    }

    if (passwordState?.screen == "success-screen" && !passwordState?.networkError){
      setScreen(ScreenNames.success_screen)
    }

  },[passwordState])

  return <>
    <div className="mb-4 d-flex justify-content-center">
      <a style={{color:"#9c7248", cursor:"pointer"}} onClick={handleShow}>Forgot Password?</a>
    </div>
    <Modal show={show} onHide={handleClose} size="sm" centered>
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body>
        <Form autoComplete="off" action={passwordresetaction} id="passwordreset" name="passwordreset">
          <div className="mt-2" style={{display:"flex", justifyContent:"center"}}>
            <div>
              <p style={{fontFamily: 'exlibris', fontSize:"50px", lineHeight:"20px", color:"black"}}>BIG CHIEF<br/><span style={{fontFamily:"teleMarines" , fontSize:"16px", fontWeight:"bold"}}>enteRtainMent</span></p>
            </div>
          </div>
          <div>
            {error && screen != ScreenNames.new_password_screen && <p className="mt-2" style={{color:"#F2003C", padding: "0 7px", fontWeight:"600"}}>{error}</p>}
          </div>
          {screen == ScreenNames.email_screen && <EmailInputView prompt={"Enter your email to the account you want to access to recieve code."} removeError={handleErrorRemove}/>}
          {screen == ScreenNames.code_screen && <CodeInputView prompt={"Please enter the code that you recieved in your email. After 15 minutes, your code will expire and a Resend button will appear."} onComplete={onResendComplete} onResendClick={resendClick}/>}
          {screen == ScreenNames.new_password_screen && <NewPasswordnputView error={error} removeError={setError}/>}
          {screen == ScreenNames.confirm_password_screen && <ConfirmPasswordnputView removeError={handleErrorRemove}/>}
          {screen == ScreenNames.success_screen && <SuccessView prompt="Your password was successfully changed.  You can now log in with your new password.  Please close the menu using X button."/>}
        </Form>
      </Modal.Body>
      {screen != ScreenNames.success_screen && <Modal.Footer>
        {screen != ScreenNames.email_screen && screen != ScreenNames.new_password_screen && <Button  style={{backgroundColor:"#9c7248", borderColor:"#9c7248", fontSize:"16px", width:"100px", height:"50px", marginRight: "auto"}} onClick={handleBack}>
          Back
        </Button>}
        <Button form="passwordreset" type="submit" style={{backgroundColor:"#9c7248", borderColor:"#9c7248", fontSize:"16px", width:"100px", height:"50px"}}>
          {passwordpending ? <Spinner animation="border" role="status" size="sm" />:screen == ScreenNames.confirm_password_screen ? "Submit":"Continue"}
        </Button>
      
      </Modal.Footer>}
    </Modal>
  </>
}