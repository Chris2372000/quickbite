import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    // No backend password-reset endpoint yet — this simulates the request/response
    // so the flow is complete; wire it to a real /auth/forgot-password call when ready.
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 700);
  }

  if (sent) {
    return (
      <AuthLayout title="Check your email">
        <div className="qb-auth-success">
          <span>✉️</span>
          <p>
            If an account exists for <b>{email}</b>, we've sent a link to reset your password.
          </p>
          <Link to="/login" className="primary-btn full" style={{ display: "block", textAlign: "center" }}>
            Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter the email on your account and we'll send you a reset link."
      footer={
        <Link to="/login" className="qb-auth-link">
          ← Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="qb-auth-fields">
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <button disabled={loading} className="primary-btn full">
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthLayout>
  );
}
