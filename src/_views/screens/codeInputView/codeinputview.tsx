import { useState, useEffect,useRef } from "react";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button";

export default function CodeInputView({prompt, onComplete, onResendClick}:{prompt:string, onComplete:()=>void, onResendClick:()=>void}){
  
  const [otp, setOtp] = useState(Array(6).fill(''));
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const [disabled, setDisabled] = useState<boolean>(true)

  const initialSeconds = 15 * 60;
  const [timeRemaining, setTimeRemaining] = useState<number>(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e:any, index:number) => {
    const value = e.target.value;
    if (value.match(/^\d*$/) && value.length <= 1) { // Allow only single digit numbers
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input if a digit is entered and it's not the last input
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e:any, index:number) => {
    // Handle backspace to clear and move to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const buttonClick = () => {
    setDisabled(true);
    onResendClick();
    setTimeRemaining(initialSeconds);
  }

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalRef.current!);
          setDisabled(false);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [disabled]);

  useEffect(()=>{
    if (disabled == false) {
      onComplete()
    }
  },[disabled])

  const formattedSeconds = String(timeRemaining % 60).padStart(2, '0'); 

  return <>
    <InputGroup className="mb-3 justify-content-center">
      {otp.map((digit, index) => (
        <Form.Control
          key={index}
          type="text" // Use 'text' to control input length and content
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(el:never) => (inputRefs.current[index] = el)}
          className="text-center"
          style={{ width: '40px', margin: "0 2px 0 1px" }} // Adjust width as needed
          name={`texbox-${index}`}
        />
      ))}
    </InputGroup>
    <div style={{textAlign: "justify", padding: "0 7px"}}>{prompt}</div>
    <div style={{marginTop:"20px", marginBottom:"10px", width: "100%", textAlign:"center"}}>
      <Button disabled={disabled} onClick={buttonClick} style={{marginBottom:"0", color: "#9c7248", fontSize:"18px", fontWeight: "bold", backgroundColor:"white", border:"none"}}>{disabled ? `${Math.floor(timeRemaining / 60)}:${formattedSeconds}`:"Resend"}</Button>
    </div>
  </>
}