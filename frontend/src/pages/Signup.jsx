import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.phone);
      navigate("/restaurants");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Sign up to start ordering from restaurants near you."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="qb-auth-link">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="qb-auth-fields">
        {error && <p className="qb-auth-error">{error}</p>}

        <label>Full name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />

        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <label>Phone number</label>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

        <label>Password</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          minLength={6}
        />

        <label>Confirm password</label>
        <input
          type="password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          required
          minLength={6}
        />

        <p className="qb-auth-terms">
          By signing up, you agree to QuickBite's <a href="#terms">Terms of Service</a> and{" "}
          <a href="#privacy">Privacy Policy</a>.
        </p>

        <button disabled={loading} className="primary-btn full">
          {loading ? "Creating account…" : "Create account"}
        </button>

        <button type="button" className="qb-auth-google">
          <span>G</span> Sign up with Google
        </button>
      </form>
    </AuthLayout>
  );
}
