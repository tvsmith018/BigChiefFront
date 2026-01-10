import Form from 'react-bootstrap/Form';
import { useState } from 'react';

export default function NewPasswordnputView({error, removeError}:{error?:string[], removeError?:any}){
    const handleChange = async (e:any)=>{
        const value:string = e.target.value;
        
        if (error){
            if (value.length>=8 && error.includes("Must be 8 characters long.")) {
                const newError = error.filter(error => error !== "Must be 8 characters long.")
                removeError(newError)
            }

            if (/[a-zA-Z]/.test(value) && error.includes("Contain at least one letter.")) {
                const newError = error.filter(error => error !== "Contain at least one letter.")
                removeError(newError)
            }

            if (/[0-9]/.test(value) && error.includes("Contain at least one number.")) {
                const newError = error.filter(error => error !== "Contain at least one number.")
                removeError(newError)
            }

            if (/[^a-zA-Z0-9]/.test(value) && error.includes("Contain at least one special character.")) {
                const newError = error.filter(error => error !== "Contain at least one special character.")
                removeError(newError)
            }
        }
        
    }
        
  return <>
    <Form.Control type="text" autoComplete="username" style={{display: "none"}}/>
    <Form.Control className="mb-3" type="password" placeholder="New Password" name="newpassword" autoComplete="off" style={{borderColor:""}} onChange={handleChange}/>
    <div style={{textAlign: "justify", padding: "0 7px"}}>Please enter a new password. Please use the guide below when creating new password.</div>
    <ul style={{marginTop:"20px", marginBottom:"10px", paddingLeft:"27px"}}>
      <li style={{color: error?.includes("Must be 8 characters long.") ? "red":"black"}}>Must be 8 characters long.</li>
      <li style={{color: error?.includes("Contain at least one letter.") ? "red":"black"}}>Contain at least one letter.</li>
      <li style={{color: error?.includes("Contain at least one number.") ? "red":"black"}}>Contain at least one number.</li>
      <li style={{color: error?.includes("Contain at least one special character.") ? "red":"black"}}>Contain at least one special character.</li>
    </ul>
  </>
}