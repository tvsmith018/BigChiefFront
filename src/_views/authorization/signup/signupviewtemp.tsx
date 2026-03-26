"use client"
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import { useState, useActionState, useEffect } from "react";

import { signupAction, codeResend } from '../../../../_utilities/network/Authorization/actions/auth';

import { ScreenNames } from '../../../../_utilities/datatype/Auth/types/screenNames';
import EmailInputView from '@/_views/screens/emailview/emailview';
import CodeInputView from '@/_views/screens/codeInputView/codeinputview';
import FirstnameInputView from '@/_views/screens/firstnameView/firstnameView';
import LastnameInputView from '@/_views/screens/lastnameView/lastnameView';
import DOBInputView from '@/_views/screens/dobView/dobview';
import ImagePreView from '@/_views/screens/ImagePreView/imagepreview';
import NewPasswordnputView from '@/_views/screens/passwordview/passwordview';
import ConfirmPasswordnputView from '@/_views/screens/passwordview/confirmpasswordview';
import SuccessView from '@/_views/screens/successView/successView';

export default function SignupView(){
    const [show, setShow] = useState(false);
    const [screen, setScreen] = useState<ScreenNames>(ScreenNames.email_screen);
    const [email, setEmail] = useState<string|undefined>(undefined);
    const [password, setPassword] = useState<string|undefined>(undefined);
    const [firstname, setFirstname] = useState<string|undefined>(undefined);
    const [lastname, setLastname] = useState<string|undefined>(undefined);
    const [selectedDate, setSelectedDate] = useState<Date|undefined>(undefined);
    const [generatedID, setGeneratedID] = useState<string|undefined>(undefined);
    const [error, setError] = useState<string[]|undefined>(undefined);
    const [selectedAvatar, setSelectedAvatar] = useState<File|undefined>(undefined);

    const boundedSignupAction = signupAction.bind(null, screen.toString(), generatedID, selectedDate,firstname, lastname, email,password, selectedAvatar);
    const [signupState, signupaction, signuppending] = useActionState(boundedSignupAction, undefined);

    const handleClick = () => setShow(true);
    const handleClose = () => {
        setShow(false);
        setTimeout(()=>{
            setEmail(undefined);
            setFirstname(undefined);
            setLastname(undefined);
            setSelectedDate(undefined);
            setGeneratedID(undefined);
            setError(undefined);
            setSelectedAvatar(undefined);
            setPassword(undefined);
            setScreen(ScreenNames.email_screen);
        },500)
    }

    const onMenuBackButtonClick = () => {
        setError(undefined)
        if (screen == ScreenNames.code_screen) {
            setEmail(undefined)
            setScreen(ScreenNames.email_screen);
        }

        if (screen == ScreenNames.lastname_screen){
            setFirstname(undefined);
            setScreen(ScreenNames.firstname_screen);
        }

        if (screen == ScreenNames.dob_screen) {
            setLastname(undefined)
            setScreen(ScreenNames.lastname_screen);
        }

        if (screen == ScreenNames.image_screen){
            setSelectedDate(undefined)
            setScreen(ScreenNames.dob_screen)
        }

        if (screen == ScreenNames.new_password_screen){
            setSelectedAvatar(undefined)
            setScreen(ScreenNames.image_screen)
        }

        if (screen == ScreenNames.confirm_password_screen){
            setPassword(undefined)
            setScreen(ScreenNames.new_password_screen)
        }
    }

    const handleErrorRemove = () => {
        setError(undefined)
    }

    const onResendComplete = async () => {
        setGeneratedID(undefined)
    }

    const resendClick = async () => {
        const data = await codeResend(email!)
        
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

        if (signupState?.errors && screen == ScreenNames.email_screen){
            setError(signupState.errors.email)
        }

        if (signupState?.errors && screen == ScreenNames.firstname_screen){
            setError(signupState.errors.firstname)
        }

        if (signupState?.errors && screen == ScreenNames.lastname_screen){
            setError(signupState.errors.lastname)
        }

        if (signupState?.errors && screen == ScreenNames.dob_screen){
            setError(signupState.errors.dob)
        }

        if (signupState?.networkError){
            setError(signupState.networkError)
        }

        if (signupState?.codeError) {
            setError(signupState.codeError)
        }

        if (signupState?.passwordError) {
            setError(signupState.passwordError.password)
        }

        if (signupState?.confirmError){
            setError(signupState.confirmError)
        }

        if(signupState?.screen == "code-screen" && !error) {
            setGeneratedID(signupState.gen_code)
            setEmail(signupState.payload?.email)
            setScreen(ScreenNames.code_screen)
        }

        if (signupState?.screen == "firstname-screen" && !signupState.codeError){
            setScreen(ScreenNames.firstname_screen)
        }

        if (signupState?.screen == "lastname-screen" && !signupState.errors){
            setFirstname(signupState.payload?.firstname)
            setScreen(ScreenNames.lastname_screen)
        }

        if (signupState?.screen == "dob-screen" && !signupState.errors){
            setLastname(signupState.payload?.lastname)
            setScreen(ScreenNames.dob_screen)
        }

        if (signupState?.screen == "image-screen" && !signupState.errors){
            setScreen(ScreenNames.image_screen)
        }

        if (signupState?.screen == "new-password-screen" && !signupState.passwordError){
            setScreen(ScreenNames.new_password_screen)
        }

        if (signupState?.screen == "confirm-password-screen" && !signupState.confirmError){
            setPassword(signupState.payload?.password)
            setScreen(ScreenNames.confirm_password_screen)
        }

        if (signupState?.screen == "success-screen" && !signupState?.networkError){
            setScreen(ScreenNames.success_screen)
        }

    },[signupState])

    return <>
        <p className='mt-2' style={{padding: "0 5px", wordSpacing:"10px"}}>Welcome to Big Chief Ent, the #1 Black Entertainment site around. To check out our exclusive content for members only please start by clicking on the button.</p>
        <div className='text-center mt-4'>
            <Button onClick={handleClick} type="submit" style={{backgroundColor:"#9c7248", borderColor:"#9c7248", fontSize:"16px", height:"50px"}}>
                Lets Get Started
            </Button>
        </div>
        <Modal show={show} onHide={handleClose} size="sm" centered>
            <Modal.Header closeButton></Modal.Header>
            <Modal.Body>
                <Form action={signupaction} autoComplete="off" id="signup" name="signup">
                    <div className="mt-2" style={{display:"flex", justifyContent:"center"}}>
                        <div>
                            <p style={{fontFamily: 'exlibris', fontSize:"50px", lineHeight:"20px", color:"black"}}>BIG CHIEF<br/><span style={{fontFamily:"teleMarines" , fontSize:"16px", fontWeight:"bold"}}>enteRtainMent</span></p>
                        </div>
                    </div>
                    {error && screen != ScreenNames.new_password_screen && <p className="mt-2" style={{color:"#F2003C", padding: "0 7px", fontWeight:"600"}}>{error}</p>}
                    {screen == ScreenNames.email_screen && <EmailInputView prompt='Thank you for rocking with us frfr.  We really appreciate you.  Lets start by entering your email above.' removeError={handleErrorRemove}/>}
                    {screen == ScreenNames.code_screen && <CodeInputView prompt={"Please enter the code that you recieved in your email. After 15 minutes, your code will expire and a Resend button will appear."} onComplete={onResendComplete} onResendClick={resendClick}/>}
                    {screen == ScreenNames.firstname_screen && <FirstnameInputView prompt='We Need to Get to know you now. Lets start by getting your firstname.' removeError={handleErrorRemove}/>}
                    {screen == ScreenNames.lastname_screen && <LastnameInputView prompt='Lets get your lastname now.' removeError={handleErrorRemove}/>}
                    {screen == ScreenNames.dob_screen && <DOBInputView prompt={"Please select the date you was born."} setDate={setSelectedDate} removeError={handleErrorRemove}/>}
                    {screen == ScreenNames.image_screen && <ImagePreView setFile={setSelectedAvatar}/>}
                    {screen == ScreenNames.new_password_screen && <NewPasswordnputView error={error} removeError={setError}/>}
                    {screen == ScreenNames.confirm_password_screen && < ConfirmPasswordnputView removeError={handleErrorRemove}/>}
                    {screen == ScreenNames.success_screen && <SuccessView prompt="You have successfully signed up, please continue to support as we add on to what we are already doing.  You will have user profiles coming soon. You can now login!!!!"/>}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                {screen != ScreenNames.email_screen && screen != ScreenNames.firstname_screen && screen != ScreenNames.success_screen && <Button style={{backgroundColor:"#9c7248", borderColor:"#9c7248", fontSize:"16px", width:"100px", height:"50px", marginRight: "auto"}} onClick={onMenuBackButtonClick}>
                    Back
                </Button>}
                {screen != ScreenNames.success_screen && <Button disabled={signuppending} form="signup" type="submit" style={{backgroundColor:"#9c7248", borderColor:"#9c7248", fontSize:"16px", width:"100px", height:"50px"}}>
                    {signuppending ? <Spinner animation="border" role="status" size="sm"/>:"Continue"}
                </Button>}
            </Modal.Footer>
        </Modal>
    </>
}