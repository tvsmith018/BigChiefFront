"use client";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";

import { LoginErrors } from "../errors/LoginErrors";
import ResetView from "@/_views/authorization/passwordreset/resetview";

interface LoginFormProps {
  action: (payload: FormData) => void;
  pending: boolean;
  errors?: {
    email?: string[];
    password?: string[];
  };
  netError?: string;
}

export function LoginForm({
  action,
  pending,
  errors,
  netError,
}: LoginFormProps) {
  return (
    <Form name="login" action={action} noValidate>
      <LoginErrors errors={errors} netError={netError} />

      <Form.Control
        className="mb-3"
        type="email"
        name="email"
        placeholder="Email"
        autoComplete="username"
      />

      <Form.Control
        className="mb-3"
        type="password"
        name="password"
        placeholder="Password"
        autoComplete="current-password"
      />

      <ResetView />

      <div className="text-center">
        <Button
          type="submit"
          disabled={pending}
          style={{
            backgroundColor: "#9c7248",
            borderColor: "#9c7248",
            width: "100px",
            height: "50px",
          }}
        >
          {pending ? (
            <Spinner animation="border" size="sm" />
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </Form>
  );
}
