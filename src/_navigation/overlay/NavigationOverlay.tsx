"use client";
import Nav from "react-bootstrap/Nav";
import Offcanvas from "react-bootstrap/Offcanvas";
import NavigationSearchPanel from "./NavigationSearchPanel";
import NavigationMenuPanel from "./NavigationMenuPanel";
import { NavigationLink, NavigationUser } from "../../_types/navigation/navigation.types";
import { useNavigationUI } from "../context/NavigationUIContext";

interface Props {
  isAuthenticated: boolean;
  user?: NavigationUser;
  sideLinks: NavigationLink[];
}

export default function NavigationOverlay({
  isAuthenticated,
  user,
  sideLinks,
}: Props) {
  const {
    isSearchOpen,
    isMenuOpen,
    openSearch,
    closeSearch,
    openMenu,
    closeMenu,
  } = useNavigationUI();

  return (
    <>
      <Nav className="d-flex align-items-center w-75">
        <Nav.Item className="ms-auto" onClick={openSearch}>
          <Nav.Link className="py-0 ps-0 pe-0">
            <i className="bi bi-search fs-4" />
          </Nav.Link>
        </Nav.Item>

        <Nav.Item onClick={openMenu}>
          <Nav.Link className="py-0 ps-2">
            <i className="bi bi-text-right rtl-flip fs-4" />
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <Offcanvas show={isSearchOpen} onHide={closeSearch} placement="end" backdrop={true} scroll={false}>
        <Offcanvas.Header closeButton></Offcanvas.Header>
        <Offcanvas.Body>
          <NavigationSearchPanel/>
        </Offcanvas.Body>
      </Offcanvas>

      <Offcanvas show={isMenuOpen} onHide={closeMenu} placement="start" backdrop={true} scroll={false}>
        <Offcanvas.Header closeButton></Offcanvas.Header>
        <Offcanvas.Body>
          <NavigationMenuPanel
            sideLinks={sideLinks}
          />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
