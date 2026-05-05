import FormControl from "react-bootstrap/FormControl"

export default function FirstnameInputView({
  prompt,
  removeError,
}: Readonly<{prompt: string, removeError:(e:React.ChangeEvent<HTMLInputElement>)=>void}>){
  return <>
    <FormControl className="mb-3" type="firstname" placeholder="Firstname" name="firstname" autoComplete="off" style={{borderColor:""}} onChange={removeError}/>
    <div style={{textAlign: "justify", padding: "0 7px"}}>{prompt}</div>
  </>
}