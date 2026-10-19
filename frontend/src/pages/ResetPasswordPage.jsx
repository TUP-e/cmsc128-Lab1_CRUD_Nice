import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../api/auth";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-form">
          <h1>Reset Password</h1>
          <p className="form-error">This reset link is missing its token. Request a new one.</p>
          <p className="auth-switch"><Link to="/forgot-password">Request reset link</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>Set New Password</h1>

        {error && <p className="form-error" role="alert" aria-live="polite">{error}</p>}
        {success && (
          <p className="form-success" role="status" aria-live="polite">
            Password updated. Redirecting to login…
          </p>
        )}

        <label htmlFor="new-password">New password</label>
        <input
          id="new-password"
          type="password"
          name="new-password"
          autoComplete="new-password"
          spellCheck={false}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          disabled={success}
        />
        <p className="field-hint">At least 8 characters, with one letter and one number.</p>

        <button type="submit" disabled={submitting || success}>
          {submitting ? "Saving…" : "Set New Password"}
        </button>
      </form>
    </div>
  );
}

export default ResetPasswordPage;