import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      const data = await forgotPassword(email.trim());
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>Reset Password</h1>
        <p className="field-hint">
          Enter your account email. If it is registered, we’ll email you a reset link.
        </p>

        {error && <p className="form-error" role="alert" aria-live="polite">{error}</p>}
        {message && <p className="form-success" role="status" aria-live="polite">{message}</p>}

        <label htmlFor="forgot-email">Email</label>
        <input
          id="forgot-email"
          type="email"
          name="email"
          autoComplete="email"
          spellCheck={false}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Sending…" : "Send Reset Link"}
        </button>

        <p className="auth-switch">
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}

export default ForgotPasswordPage;
