import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Image from "next/image";
import NavbarBrand from "react-bootstrap/NavbarBrand";
import logo from "../../../public/images/newlogo.jpg";
import NavigationOverlay from "../overlay/NavigationOverlay";
import { NavigationLink, NavigationUser } from "../../_types/navigation/navigation.types";

interface Props {
  isAuthenticated: boolean;
  user?: NavigationUser;
  sideLinks: NavigationLink[];
}

export default function NavigationPrimary({
  isAuthenticated,
  user,
  sideLinks,
}: Props) {

  return (
    <Navbar>
      <Container style={{ height: "80px" }}>
        <NavbarBrand href="/">
          <Image
            src={logo}
            alt="Big Chief Ent Logo"
            width={65}
            height={65 }
            priority
          />
        </NavbarBrand>

        <NavigationOverlay
          isAuthenticated={isAuthenticated}
          user={user}
          sideLinks={sideLinks}
        />
      </Container>
    </Navbar>
  );
}