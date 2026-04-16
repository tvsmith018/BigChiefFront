"use client";

import { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import NavItem from "react-bootstrap/NavItem";
import NavLink from "react-bootstrap/NavLink";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { logoutAction } from "@/_services/auth/authactions";
import { useAppDispatch } from "@/_store/hooks/UseAppDispatch";
import { useAppSelector } from "@/_store/hooks/UseAppSelector";
import { setAuthTransitioning } from "@/_store/reducers/app/appSlice";
import { removeUser } from "@/_store/reducers/user/userSlice";

export default function UserIconView() {
  const data = useAppSelector((state) => state.user.data);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    // Make UI switch immediately.
    dispatch(setAuthTransitioning(true));
    dispatch(removeUser());
    router.replace("/");

    try {
      // Keep server in sync without blocking immediate UI transition.
      await logoutAction();
    } finally {
      dispatch(setAuthTransitioning(false));
      router.refresh();
      setIsLoggingOut(false);
    }
  };

  const GuestLinks = () => (
    <>
      <Dropdown.Item href="/auth">
        <i className="bi bi-box-arrow-in-right me-2"></i>
        Login
      </Dropdown.Item>
      <div className="border-bottom border-2 border-primary opacity-1 mx-4 my-1"></div>
      <Dropdown.Item href="/auth">
        <i className="bi bi-door-open-fill me-2"></i>
        Create Profile
      </Dropdown.Item>
    </>
  );

  const AuthLinks = () => (
    <>
      <Dropdown.Item href="/profile" role="button">
        <i className="bi bi-box-arrow-in-left me-2"></i>
        Profile
      </Dropdown.Item>
      <Dropdown.Item as="button" role="button" onClick={handleLogout} disabled={isLoggingOut}>
        <i className="bi bi-box-arrow-in-left me-2"></i>
        {isLoggingOut ? "Logging out..." : "Logout"}
      </Dropdown.Item>
    </>
  );

  return (
    <Dropdown as={NavItem}>
      <Dropdown.Toggle as={NavLink} id="dropdown-basic">
        {isAuthenticated && data?.avatar ? (
          <span
            style={{
              width: 35,
              height: 35,
              display: "inline-flex",
              borderRadius: "50%",
              overflow: "hidden",
              verticalAlign: "middle",
            }}
          >
            <Image
              src={data.avatar}
              alt={`Image of ${data.firstname ?? ""} ${data.lastname ?? ""}`}
              width={35}
              height={35}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </span>
        ) : (
          <i className="bi bi-person-circle" style={{ fontSize: "20px" }}></i>
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu>{isAuthenticated ? <AuthLinks /> : <GuestLinks />}</Dropdown.Menu>
    </Dropdown>
  );
}