"use client";

import { useFormState } from "react-dom";
import { login } from "../actions";

export default function LoginPage() {
  const [state, action] = useFormState(login, undefined);

  return (
    <form action={action} className="card narrow">
      <h1>Sign in</h1>
      <label>
        Email
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state?.error && <p className="error">{state.error}</p>}
      <button className="primary" type="submit">
        Sign in
      </button>
    </form>
  );
}
