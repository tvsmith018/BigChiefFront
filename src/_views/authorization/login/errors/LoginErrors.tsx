"use client";

interface LoginErrorsProps {
  errors?: {
    email?: string[];
    password?: string[];
  };
  netError?: string;
}

export function LoginErrors({ errors, netError }: Readonly<LoginErrorsProps>) {
  if (!errors && !netError) return null;

  return (
    <>
      {netError && (
        <p className="text-danger text-center">{netError}</p>
      )}

      {errors?.email && (
        <p className="text-danger">- {errors.email.join(", ")}</p>
      )}

      {errors?.password && (
        <>
          <p>Password must:</p>
          {errors.password.map((err) => (
            <p key={err} className="text-danger">
              - {err}
            </p>
          ))}
        </>
      )}
    </>
  );
}
