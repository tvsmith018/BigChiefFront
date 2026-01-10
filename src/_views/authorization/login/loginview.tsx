"use client"
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import { loginAction } from '../../../../_utilities/network/Authorization/actions/auth';
import { useActionState, useEffect} from 'react'
import { storeUser } from '@/_store/reducers/userReducer/userSlice';
import { useDispatch } from 'react-redux';
import { redirect } from 'next/navigation';
import { User } from '../../../../_utilities/datatype/Auth/types/user';
import ResetView from './passwordreset/resetview';

const userState:User|undefined = undefined

export default function LoginView() {
  const [loginState, loginaction, loginPending] = useActionState(loginAction, userState);
  const dispatch = useDispatch();
  
  useEffect(()=>{

    if (!loginState?.errors && !loginState?.netError && loginState != undefined) {
      dispatch(storeUser(loginState))
      redirect('/')
    }

  },[loginState, dispatch])

  return (
      <Form name="login" action={loginaction} noValidate>
        {loginState?.netError && (
          <p className="error" style={{textAlign: "center", color:"red"}}>{loginState.netError}</p>
        )}
        <Form.Control className="mb-3" type="email" placeholder="Email" name="email" autoComplete="username" style={{borderColor:""}}/>
        {loginState?.errors?.email && <p style={{color:"#F2003C"}}>-&nbsp;&nbsp;{loginState.errors.email}</p>}
        <Form.Control className="mb-3" type="password" placeholder="Password" name="password" autoComplete="current-password" style={{borderColor:""}}  />
        {loginState?.errors?.password && (
          <div>
            <p>Password must:</p>
            <div style={{lineHeight:"3px"}}>
              {loginState.errors.password.map((error:string) => (
                <p key={error} style={{color:"#F2003C"}}>-&nbsp;&nbsp;{error}</p>
             ))}
            </div>
          </div>
        )}
        <ResetView />
        <div className='text-center'>
          <Button type="submit" style={{backgroundColor:"#9c7248", borderColor:"#9c7248", fontSize:"16px", width:"100px", height:"50px"}} disabled={loginPending}>
            {!loginPending ? "Submit":<Spinner animation="border" role="status" size="sm" />}
          </Button>
        </div>
      </Form>
  )
}