"use client";

import Button from "react-bootstrap/Button";

export const AUTH_PRIMARY_BUTTON_STYLE = {
  backgroundColor: "#9c7248",
  borderColor: "#9c7248",
  fontSize: "16px",
  width: "100px",
  height: "50px",
};

export const AUTH_BACK_BUTTON_STYLE = {
  ...AUTH_PRIMARY_BUTTON_STYLE,
  marginRight: "auto",
};

export function AuthBrandHeader() {
  return (
    <div className="mt-2" style={{ display: "flex", justifyContent: "center" }}>
      <div>
        <p style={{ fontFamily: "exlibris", fontSize: "50px", lineHeight: "20px", color: "black" }}>
          BIG CHIEF
          <br />
          <span style={{ fontFamily: "teleMarines", fontSize: "16px", fontWeight: "bold" }}>
            enteRtainMent
          </span>
        </p>
      </div>
    </div>
  );
}

export function AuthErrorBanner({
  error,
  hide,
}: Readonly<{ error?: string[]; hide: boolean }>) {
  if (!error || hide) {
    return null;
  }

  return (
    <p className="mt-2" style={{ color: "#F2003C", padding: "0 7px", fontWeight: "600" }}>
      {error}
    </p>
  );
}

export function AuthBackButton({
  onClick,
}: Readonly<{ onClick: () => void }>) {
  return (
    <Button style={AUTH_BACK_BUTTON_STYLE} onClick={onClick}>
      Back
    </Button>
  );
}
