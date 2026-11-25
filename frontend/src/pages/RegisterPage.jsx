import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const cleanName = displayName.trim();
    const cleanEmail = email.trim();
    if (!cleanName) {
      setError("Enter your display name.");
      return;
    }
    if (cleanName.length > 50) {
      setError("Keep your display name to 50 characters or fewer.");
      return;
    }
    if (!cleanEmail) {
      setError("Enter your email address.");
      return;
    }
    if (e.currentTarget.elements.email.validity.typeMismatch) {
      setError("Enter a valid email address, like name@example.com.");
      return;
    }
    if (password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    if (password.length > 64) {
      setError("Keep your password to 64 characters or fewer.");
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Add at least one letter and one number to your password.");
      return;
    }
    if (!confirmPassword) {
      setError("Confirm your password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Those passwords don't match. Try again.");
      return;
    }

    setSubmitting(true);
    try {
      await register(cleanEmail, cleanName, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.message === "An account with this email already exists."
          ? "That email already has an account. Try logging in instead."
          : err.message
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>Create Account</h1>

        {error && <p className="form-error" role="alert" aria-live="polite">{error}</p>}

        <label htmlFor="reg-name">Display name</label>
        <input
          id="reg-name"
          type="text"
          name="name"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />

        <label htmlFor="reg-email">Email</label>
        <input
          id="reg-email"
          type="email"
          name="email"
          autoComplete="email"
          spellCheck={false}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="reg-password">Password</label>
        <input
          id="reg-password"
          type="password"
          name="new-password"
          autoComplete="new-password"
          spellCheck={false}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <p className="field-hint">At least 8 characters, with one letter and one number.</p>

        <label htmlFor="reg-confirm-password">Confirm password</label>
        <input
          id="reg-confirm-password"
          type="password"
          name="confirm-password"
          autoComplete="new-password"
          spellCheck={false}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Sign Up"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
