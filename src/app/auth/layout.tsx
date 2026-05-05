import Container from "react-bootstrap/Container";
import TabViews from "../../_views/tabView/tabview";
import Image from "next/image";
import logo from "../../../public/images/newlogo.jpg";
import type { ReactNode } from "react";

import { requireGuest } from "@/_services/auth/authproxy";

interface AuthLayoutProps {
  login: ReactNode;
  signup: ReactNode;
}

export default async function Layout(props: Readonly<AuthLayoutProps>) {
  await requireGuest("/profile");

  return (
    <Container style={{ maxWidth: "500px", height: "auto" }}>
      <Image
        className="img-fluid"
        src={logo}
        alt="A Chief that has 100's in hand counting with ring on and smoking a cigar (not bad ppl do way worse I know yal see that up there when ranking so please dont hold it against me, feeding family) which is our Logo"
        priority
        placeholder="blur"
      />
      <TabViews defaultKey="Login" keys={["Login", "Signup"]}>
        {props.login}
        {props.signup}
      </TabViews>
    </Container>
  );
}