import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateProfile, changePassword } from "../api/auth";

function ProfilePage() {
  const { user, token, updateUser } = useAuth();

  const [email, setEmail] = useState(user.email);
  const [displayName, setDisplayName] = useState(user.display_name);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setSavingProfile(true);
    try {
      const updated = await updateProfile(token, {
        email: email.trim(),
        display_name: displayName.trim(),
      });
      updateUser(updated);
      setProfileSuccess("Profile updated.");
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setSavingPassword(true);
    try {
      await changePassword(token, currentPassword, newPassword);
      setPasswordSuccess("Password changed.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="page">
      <div className="app">
        <div className="profile-header">
          <h1>Profile</h1>
          <Link to="/">Back to tasks</Link>
        </div>

        <form className="task-form profile-form" onSubmit={handleProfileSubmit} noValidate>
          <h2>Account details</h2>
          {profileError && <p className="form-error" role="alert" aria-live="polite">{profileError}</p>}
          {profileSuccess && <p className="form-success" role="status" aria-live="polite">{profileSuccess}</p>}

          <label htmlFor="profile-name">Display name</label>
          <input
            id="profile-name"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />

          <label htmlFor="profile-email">Email</label>
          <input
            id="profile-email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" disabled={savingProfile}>
            {savingProfile ? "Saving…" : "Save Changes"}
          </button>
        </form>

        <form className="task-form profile-form" onSubmit={handlePasswordSubmit} noValidate>
          <h2>Change password</h2>
          {passwordError && <p className="form-error" role="alert" aria-live="polite">{passwordError}</p>}
          {passwordSuccess && <p className="form-success" role="status" aria-live="polite">{passwordSuccess}</p>}

          <label htmlFor="current-password">Current password</label>
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            spellCheck={false}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <label htmlFor="new-password-profile">New password</label>
          <input
            id="new-password-profile"
            type="password"
            autoComplete="new-password"
            spellCheck={false}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={savingPassword}>
            {savingPassword ? "Saving…" : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;