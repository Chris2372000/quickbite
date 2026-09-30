import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "staff" || user.role === "admin" ? "/admin" : "/restaurants");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to reorder your favorites and track deliveries."
      footer={
        <>
          No account yet?{" "}
          <Link to="/signup" className="qb-auth-link">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="qb-auth-fields">
        {error && <p className="qb-auth-error">{error}</p>}

        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <div className="qb-auth-row">
          <label className="qb-auth-checkbox">
            <input type="checkbox" checked={remember} onChange={() => setRemember((r) => !r)} />
            Remember me
          </label>
          <Link to="/forgot-password" className="qb-auth-link">
            Forgot password?
          </Link>
        </div>

        <button disabled={loading} className="primary-btn full">
          {loading ? "Logging in…" : "Log In"}
        </button>

        <button type="button" className="qb-auth-google">
          <span>G</span> Continue with Google
        </button>
      </form>
    </AuthLayout>
  );
}
