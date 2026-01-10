import Form from 'react-bootstrap/Form';

export default function ConfirmPasswordnputView({removeError}:{removeError:(e:React.ChangeEvent<HTMLInputElement>)=>void}){
  return <>
    <Form.Control type="text" autoComplete="username" style={{display: "none"}}/> 
    <Form.Control className="mb-3" type="password" placeholder="Confirm Password" name="confirmnewpassword" autoComplete="off" style={{borderColor:""}}  onChange={removeError}/>
    <div style={{textAlign: "justify", padding: "0 7px"}}>Please confirm new password.</div>
  </>
}