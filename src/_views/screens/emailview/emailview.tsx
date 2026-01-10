import FormControl from "react-bootstrap/FormControl"

export default function EmailInputView({prompt,removeError}:{prompt: string,removeError:(e:React.ChangeEvent<HTMLInputElement>)=>void}){
  return <>
    <FormControl className="mb-3" type="email" placeholder="Email" name="email" autoComplete="off" style={{borderColor:""}} onChange={removeError}/>
    <div style={{textAlign: "justify", padding: "0 7px"}}>{prompt}</div>
  </>
}