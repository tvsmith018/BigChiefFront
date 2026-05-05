import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Image from "next/image";
import NavbarBrand from "react-bootstrap/NavbarBrand";
import logo from "../../../public/images/newlogo.jpg";
import NavigationOverlay from "../overlay/NavigationOverlay";
import { NavigationLink } from "../../_types/navigation/navigation.types";

interface Props {
  sideLinks: NavigationLink[];
}

export default function NavigationPrimary({
  sideLinks,
}: Readonly<Props>) {

  return (
    <Navbar>
      <Container style={{ height: "80px" }}>
        <NavbarBrand href="/">
          <Image
            src={logo}
            alt="Big Chief Ent Logo"
            width={65}
            height={65}
            style={{ height: "auto" }}
            priority
          />
        </NavbarBrand>

        <NavigationOverlay
          sideLinks={sideLinks}
        />
      </Container>
    </Navbar>
  );
}
