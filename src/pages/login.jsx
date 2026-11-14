import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { FiArrowLeft, FiLock } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const auth = getAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(location.state?.from || "/apps", { replace: true });
    } catch {
      setError("Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <div className="login-mark"><FiLock aria-hidden="true" /></div>
        <h2>Welcome back</h2>
        <p className="login-subtitle">Log in to manage your apps and favorites.</p>

        {error && <p className="login-error" role="alert">{error}</p>}

        <label className="login-field">
          <span>Email address</span>
          <input type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label className="login-field">
          <span>Password</span>
          <input type="password" placeholder="Enter your password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        <button className="login-btn" type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </button>
        <button className="login-back" type="button" onClick={() => navigate(-1)}>
          <FiArrowLeft aria-hidden="true" /> Back
        </button>
      </form>
    </div>
  );
}
