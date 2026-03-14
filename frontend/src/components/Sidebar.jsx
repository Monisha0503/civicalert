 import { useNavigate, useLocation } from "react-router-dom";

function Sidebar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const citizenNav = [
    { icon: "📊", label: "Dashboard", path: "/citizen" },
    { icon: "📋", label: "My Issues", path: "/citizen" },
    { icon: "🗺️", label: "Live Map", path: "/citizen" },
    { icon: "🔔", label: "Notifications", path: "/citizen" },
    { icon: "⚙️", label: "Settings", path: "/citizen" },
  ];

  const adminNav = [
    { icon: "📊", label: "Overview", path: "/admin" },
    { icon: "🗂️", label: "All Issues", path: "/admin" },
    { icon: "⏳", label: "In Progress", path: "/admin" },
    { icon: "✅", label: "Resolved", path: "/admin" },
    { icon: "👥", label: "Citizens", path: "/admin" },
    { icon: "📈", label: "Analytics", path: "/admin" },
    { icon: "📥", label: "Export Data", path: "/admin" },
  ];

  const user = JSON.parse(localStorage.getItem("user"));
  const navItems = role === "admin" ? adminNav : citizenNav;

  return (
    <div style={styles.sidebar}>
      {/* Top glow line */}
      <div style={styles.glowLine} />

      {/* Logo */}
      <div style={styles.logoWrap}>
        <div style={styles.logoText}>
          <span style={styles.logoCyan}>CIVIC</span>
          <span style={styles.logoWhite}>ALERT</span>
        </div>
        <div style={styles.logoTag}>
          {role === "admin" ? "⚡ ADMIN CONTROL" : "🏙️ SMART CITY"}
        </div>
      </div>

      {/* User pill */}
      <div style={styles.userPill}>
        <div style={{
          ...styles.avatar,
          background: role === "admin"
            ? "linear-gradient(135deg,#7c3aed,#a78bfa)"
            : "linear-gradient(135deg,#0066ff,#00f5ff)"
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={styles.userName}>{user?.name}</div>
          <div style={{
            ...styles.userRole,
            color: role === "admin" ? "#a78bfa" : "#00f5ff"
          }}>
            {role === "admin" ? "MUNICIPALITY" : "CITIZEN"}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={styles.navSection}>
        <div style={styles.navLabel}>
          {role === "admin" ? "⚙️ CONTROL PANEL" : "📡 MAIN MENU"}
        </div>
        {navItems.map((item, i) => (
          <div
            key={i}
            style={{
              ...styles.navItem,
              ...(i === 0 ? styles.navItemActive : {})
            }}
            onClick={() => navigate(item.path)}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.logoutBtn} onClick={handleLogout}>
          <span>⏻</span>
          <span>LOGOUT</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "240px",
    minHeight: "100vh",
    background: "#080c14",
    borderRight: "1px solid #1a2540",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flexShrink: 0,
  },
  glowLine: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: "1px",
    background: "linear-gradient(90deg,transparent,#00f5ff,transparent)",
  },
  logoWrap: {
    padding: "24px 20px 16px",
    borderBottom: "1px solid #1a2540",
  },
  logoText: {
    fontFamily: "'Orbitron',monospace",
    fontWeight: 900,
    fontSize: "18px",
    letterSpacing: "0.05em",
  },
  logoCyan: { color: "#00f5ff" },
  logoWhite: { color: "#e8f4ff" },
  logoTag: {
    fontSize: "9px",
    color: "#4a6080",
    fontFamily: "'Orbitron',monospace",
    letterSpacing: "0.1em",
    marginTop: "4px",
  },
  userPill: {
    margin: "14px 12px",
    background: "rgba(0,245,255,0.04)",
    border: "1px solid #1e2d4a",
    borderRadius: "10px",
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "34px", height: "34px",
    borderRadius: "8px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 800, fontSize: "14px", color: "#000", flexShrink: 0,
  },
  userName: { fontSize: "13px", fontWeight: 600, color: "#e8f4ff" },
  userRole: {
    fontSize: "9px",
    fontFamily: "'Orbitron',monospace",
    letterSpacing: "0.08em",
    marginTop: "2px",
  },
  navSection: { padding: "8px 12px", flex: 1 },
  navLabel: {
    fontSize: "9px",
    color: "#4a6080",
    fontFamily: "'Orbitron',monospace",
    letterSpacing: "0.15em",
    padding: "10px 8px 8px",
  },
  navItem: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "9px 12px", borderRadius: "8px", cursor: "pointer",
    color: "#4a6080", fontSize: "13px", fontWeight: 500,
    transition: "all 0.2s", marginBottom: "2px",
    border: "1px solid transparent",
  },
  navItemActive: {
    color: "#00f5ff",
    background: "rgba(0,245,255,0.08)",
    border: "1px solid rgba(0,245,255,0.15)",
  },
  navIcon: { fontSize: "16px" },
  footer: {
    padding: "16px 12px",
    borderTop: "1px solid #1a2540",
  },
  logoutBtn: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "9px 12px", borderRadius: "8px", cursor: "pointer",
    color: "#ff4455", fontSize: "13px", fontWeight: 600,
    border: "1px solid rgba(255,68,85,0.2)",
    fontFamily: "'Orbitron',monospace", letterSpacing: "0.05em",
    transition: "all 0.2s",
  },
};

export default Sidebar;
