import Container from 'react-bootstrap/Container'
import TabViews from '../../_views/tabView/tabview';
import Image from 'next/image';
import logo from "../../../public/images/newlogo.jpg"
import type { ReactNode } from "react";
import { AuthGate } from '@/_services/auth/authGate';


export default async function Layout(props: { login: ReactNode, signup:ReactNode }) {
  return (
    <AuthGate mode='guest'>
      <Container style={{maxWidth:"500px", height:"auto", }}>
        <Image className='img-fluid' src={logo} 
          alt="A Chief that has 100's in hand counting with ring on and smoking a cigar (not bad ppl do way worse I know yal see that up there when ranking so please dont hold it against me, feeding family) which is our Logo" 
          priority
          placeholder='blur'
        />
        <TabViews defaultKey='Login' keys={["Login","Signup"]}>
            {props.login}
            {props.signup}
        </TabViews>
      </Container>
    </AuthGate>
  );
}