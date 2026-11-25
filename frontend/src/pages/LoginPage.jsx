import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Enter your email address.");
      return;
    }
    if (e.currentTarget.elements.email.validity.typeMismatch) {
      setError("Enter a valid email address, like name@example.com.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }

    setSubmitting(true);
    try {
      await login(cleanEmail, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.message === "Invalid email or password."
          ? "That email and password don't match. Check them and try again."
          : err.message
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">

     

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>Log In</h1>

        {error && <p className="form-error" role="alert" aria-live="polite">{error}</p>}

        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          name="email"
          autoComplete="email"
          spellCheck={false}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          name="current-password"
          autoComplete="current-password"
          spellCheck={false}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Logging in…" : "Log In"}
        </button>

        <p className="auth-switch">
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
