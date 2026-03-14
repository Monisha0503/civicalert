import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("https://civicalert-backend-bdgdb7h2aqbfdjgk.centralindia-01.azurewebsites.net/api/auth/login", {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/citizen");
      }
    } catch (err) {
      setError("❌ Invalid credentials! Try again.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.gridBg} />
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.card}>
        <div style={styles.cardGlow} />

        <div style={styles.sysTag}>
          <span style={styles.blinkDot} />
          CIVICALERT v2.0
        </div>

        <h1 style={styles.title}>
          Report.<br />
          <span style={styles.titleAccent}>Track. Resolve. ⚡</span>
        </h1>
        <p style={styles.subtitle}>
          Sign in to make your city better 🏙️
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.field}>
          <label style={styles.label}>📧 Email Address</label>
          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="you@gmail.com"
            onChange={handleChange}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>🔑 Password</label>
          <div style={styles.passwordWrap}>
            <input
              style={styles.passwordInput}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              onChange={handleChange}
            />
            <button
              style={styles.eyeBtn}
              onClick={() => setShowPassword(!showPassword)}
              type="button"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <button style={styles.button} onClick={handleSubmit}>
          ⚡ Login →
        </button>

        <p style={styles.link}>
          No account?{" "}
          <Link to="/register" style={{ color: "#00f5ff", fontWeight: 600, textDecoration: "none" }}>
            📝 Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh", width: "100%", background: "#050810",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "sans-serif", position: "relative", overflow: "hidden",
  },
  gridBg: {
    position: "absolute", inset: 0,
    backgroundImage: "linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)",
    backgroundSize: "60px 60px", pointerEvents: "none",
  },
  orb1: {
    position: "absolute", width: "500px", height: "500px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,102,255,0.12) 0%, transparent 70%)",
    top: "-100px", left: "-100px", pointerEvents: "none",
  },
  orb2: {
    position: "absolute", width: "400px", height: "400px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,245,255,0.08) 0%, transparent 70%)",
    bottom: "-100px", right: "-100px", pointerEvents: "none",
  },
  card: {
    position: "relative", zIndex: 1,
    background: "rgba(8,12,20,0.95)", border: "1px solid #1e2d4a",
    borderRadius: "16px", padding: "48px 44px", width: "440px",
    backdropFilter: "blur(20px)",
    boxShadow: "0 0 0 1px rgba(0,245,255,0.05), 0 40px 80px rgba(0,0,0,0.8)",
    display: "flex", flexDirection: "column", gap: "16px",
  },
  cardGlow: {
    position: "absolute", top: 0, left: "40px", right: "40px", height: "1px",
    background: "linear-gradient(90deg,transparent,#00f5ff,transparent)",
  },
  sysTag: {
    fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#00f5ff",
    letterSpacing: "0.15em", display: "flex", alignItems: "center", gap: "8px",
  },
  blinkDot: {
    display: "inline-block", width: "6px", height: "6px",
    background: "#00f5ff", borderRadius: "50%",
  },
  title: {
    fontFamily: "'Courier New', monospace", fontSize: "32px",
    fontWeight: 900, color: "#e8f4ff", lineHeight: 1.2, margin: 0,
  },
  titleAccent: {
    background: "linear-gradient(135deg,#00f5ff,#0066ff)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  subtitle: { color: "#4a6080", fontSize: "13px", margin: 0 },
  error: {
    background: "rgba(255,68,85,0.1)", border: "1px solid rgba(255,68,85,0.3)",
    color: "#ff4455", padding: "10px 14px", borderRadius: "8px", fontSize: "13px",
  },
  field: { display: "flex", flexDirection: "column", gap: "7px" },
  label: { fontSize: "13px", color: "#7a9ab8", fontWeight: 600 },
  input: {
    padding: "12px 16px", background: "rgba(0,245,255,0.03)",
    border: "1px solid #1e2d4a", borderRadius: "8px", color: "#e8f4ff",
    fontSize: "14px", outline: "none", fontFamily: "sans-serif",
  },
  passwordWrap: {
    display: "flex", alignItems: "center",
    background: "rgba(0,245,255,0.03)", border: "1px solid #1e2d4a",
    borderRadius: "8px", overflow: "hidden",
  },
  passwordInput: {
    flex: 1, padding: "12px 16px", background: "transparent",
    border: "none", color: "#e8f4ff", fontSize: "14px",
    outline: "none", fontFamily: "sans-serif",
  },
  eyeBtn: {
    padding: "12px 14px", background: "transparent", border: "none",
    cursor: "pointer", fontSize: "16px", color: "#4a6080",
    borderLeft: "1px solid #1e2d4a",
  },
  button: {
    padding: "14px", background: "linear-gradient(135deg,#0066ff,#00f5ff)",
    border: "none", borderRadius: "8px", color: "#000",
    fontFamily: "sans-serif", fontSize: "15px", fontWeight: 700,
    cursor: "pointer", boxShadow: "0 4px 24px rgba(0,245,255,0.3)", marginTop: "4px",
  },
  link: { textAlign: "center", color: "#4a6080", fontSize: "13px", margin: 0 },
};

export default Login;
