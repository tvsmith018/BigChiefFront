import FormControl from "react-bootstrap/FormControl"

export default function LastnameInputView({
  prompt,
  removeError,
}: Readonly<{prompt: string, removeError:(e:React.ChangeEvent<HTMLInputElement>)=>void}>){
  return <>
    <FormControl className="mb-3" type="lastname" placeholder="lastname" name="lastname" autoComplete="off" style={{borderColor:""}} onChange={removeError}/>
    <div style={{textAlign: "justify", padding: "0 7px"}}>{prompt}</div>
  </>
}