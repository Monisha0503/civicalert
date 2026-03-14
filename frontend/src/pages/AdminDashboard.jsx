import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";

function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [activeNav, setActiveNav] = useState("overview");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [profileUploading, setProfileUploading] = useState(false);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  useEffect(() => { fetchIssues(); }, []);
const fetchIssues = async () => {
    try {
      const res = await axios.get("http://https://civicalert-backend-bdgdb7h2aqbfdjgk.centralindia-01.azurewebsites.net/api/issues/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIssues(res.data);
    } catch (err) { console.log(err); }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://https://civicalert-backend-bdgdb7h2aqbfdjgk.centralindia-01.azurewebsites.net/api/issues/status/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchIssues();
    } catch (err) { console.log(err); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://https://civicalert-backend-bdgdb7h2aqbfdjgk.centralindia-01.azurewebsites.net/api/issues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchIssues();
    } catch (err) { console.log(err); }
  };

  const handleProfileUpload = async (file) => {
    setProfileUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await axios.post("http://https://civicalert-backend-bdgdb7h2aqbfdjgk.centralindia-01.azurewebsites.net/api/auth/profile/photo", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      const updatedUser = { ...user, photo: res.data.photo };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setMessage("✅ Profile photo updated!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) { setMessage("❌ Photo upload failed!"); }
    setProfileUploading(false);
  };

  const openCount = issues.filter(i => i.status === "open").length;
  const progressCount = issues.filter(i => i.status === "inprogress").length;
  const resolvedCount = issues.filter(i => i.status === "resolved").length;
  const highPriority = issues.filter(i => (i.upvotes || 0) >= 5).length;

  const handleExport = (type) => {
    if (type === "csv") {
      const csv = [
        ["Title", "Category", "Location", "Status", "Upvotes", "Reporter"],
        ...issues.map(i => [i.title, i.category, i.location, i.status, i.upvotes || 0, i.reportedBy?.name])
      ].map(row => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "civicalert_issues.csv"; a.click();
    }

    if (type === "pdf") {
      const doc = new jsPDF();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, "F");
      doc.setFillColor(0, 82, 204);
      doc.rect(0, 0, 210, 38, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("CIVICALERT", 14, 16);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(180, 210, 255);
      doc.text("Municipality Issue Report", 14, 24);
      doc.text("Generated: " + new Date().toLocaleString(), 14, 31);
      doc.text(`Total Issues: ${issues.length}`, 168, 31);
      doc.setFillColor(240, 245, 255);
      doc.rect(10, 44, 190, 28, "F");
      doc.setDrawColor(200, 215, 240);
      doc.setLineWidth(0.3);
      doc.rect(10, 44, 190, 28);
      const stats = [
        { label: "OPEN", value: openCount, color: [220, 50, 50] },
        { label: "IN PROGRESS", value: progressCount, color: [200, 140, 0] },
        { label: "RESOLVED", value: resolvedCount, color: [0, 160, 80] },
        { label: "HIGH PRIORITY", value: highPriority, color: [100, 50, 200] },
      ];
      stats.forEach((s, i) => {
        const x = 20 + i * 48;
        doc.setFontSize(7); doc.setFont("helvetica", "bold");
        doc.setTextColor(...s.color); doc.text(s.label, x, 53);
        doc.setFontSize(16); doc.text(String(s.value), x, 66);
      });
      let y = 84;
      doc.setFillColor(0, 82, 204); doc.rect(10, y - 6, 190, 10, "F");
      doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
      doc.text("TITLE", 14, y); doc.text("CATEGORY", 72, y);
      doc.text("LOCATION", 105, y); doc.text("STATUS", 150, y); doc.text("VOTES", 182, y);
      doc.setFont("helvetica", "normal");
      issues.forEach((issue, i) => {
        y += 12;
        if (y > 270) { doc.addPage(); doc.setFillColor(255,255,255); doc.rect(0,0,210,297,"F"); y = 20; }
        if (i % 2 === 0) { doc.setFillColor(245, 248, 255); doc.rect(10, y - 7, 190, 11, "F"); }
        doc.setDrawColor(220, 228, 245); doc.setLineWidth(0.2); doc.line(10, y + 4, 200, y + 4);
        doc.setFontSize(8.5); doc.setTextColor(20, 30, 60);
        doc.text((issue.title || "").substring(0, 26), 14, y);
        doc.setTextColor(80, 100, 140);
        doc.text((issue.category || ""), 72, y);
        doc.text((issue.location || "").substring(0, 16), 105, y);
        if (issue.status === "open") doc.setTextColor(200, 40, 40);
        else if (issue.status === "inprogress") doc.setTextColor(180, 120, 0);
        else doc.setTextColor(0, 140, 70);
        doc.setFont("helvetica", "bold"); doc.text(issue.status || "", 150, y);
        doc.setFont("helvetica", "normal"); doc.setTextColor(80, 60, 180);
        doc.text(String(issue.upvotes || 0), 184, y);
      });
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(0, 82, 204); doc.rect(0, 287, 210, 10, "F");
        doc.setFontSize(7); doc.setTextColor(180, 210, 255);
        doc.text("CivicAlert v2.0 — Municipality Admin Report", 14, 293);
        doc.text(`Page ${i} of ${pageCount}`, 183, 293);
      }
      doc.save("civicalert_report.pdf");
    }
  };

  const getPriority = (upvotes) => {
    if (upvotes >= 5) return { label: "🔴 HIGH", color: "#ff4455" };
    if (upvotes >= 2) return { label: "🟡 MED", color: "#ffcc00" };
    return { label: "🟢 LOW", color: "#00ff88" };
  };

  const getStatusStyle = (status) => {
    if (status === "open") return { label: "🔴 OPEN", color: "#ff4455", bg: "rgba(255,68,85,0.1)", border: "rgba(255,68,85,0.3)" };
    if (status === "inprogress") return { label: "⏳ ACTIVE", color: "#ffcc00", bg: "rgba(255,204,0,0.1)", border: "rgba(255,204,0,0.3)" };
    if (status === "resolved") return { label: "✅ CLOSED", color: "#00ff88", bg: "rgba(0,255,136,0.1)", border: "rgba(0,255,136,0.3)" };
    return { label: status, color: "#fff", bg: "#333", border: "#555" };
  };

  const getCategoryIcon = (cat) => {
    if (cat === "pothole") return "🕳️";
    if (cat === "streetlight") return "💡";
    if (cat === "garbage") return "🗑️";
    if (cat === "waterleak") return "💧";
    return "🔧";
  };

  const filteredIssues = issues.filter(i => {
    const matchFilter = filter === "all" ? true : i.status === filter;
    const matchSearch = i.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.location?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const navItems = [
    { key: "overview", icon: "📊", label: "Overview" },
    { key: "issues", icon: "🗂️", label: "All Issues" },
    { key: "inprogress", icon: "⏳", label: "In Progress" },
    { key: "resolved", icon: "✅", label: "Resolved" },
    { key: "citizens", icon: "👥", label: "Citizens" },
    { key: "analytics", icon: "📈", label: "Analytics" },
    { key: "export", icon: "📥", label: "Export Data" },
    { key: "settings", icon: "⚙️", label: "Settings" },
  ];

  const navBadges = { issues: issues.length, inprogress: progressCount, resolved: resolvedCount };
  const avatarSrc = user?.photo ? `http://https://civicalert-backend-bdgdb7h2aqbfdjgk.centralindia-01.azurewebsites.net/uploads/${user.photo}` : null;

  return (
    <div style={styles.container}>

      {/* ===== SIDEBAR ===== */}
      <div style={styles.sidebar}>
        <div style={styles.glowLine} />
        <div style={styles.logoWrap}>
          <div style={styles.logoText}>
            <span style={{ color: "#a78bfa" }}>CIVIC</span>
            <span style={{ color: "#e8f4ff" }}>ALERT</span>
          </div>
          <div style={styles.logoTag}>⚡ ADMIN CONTROL</div>
        </div>

        <div style={styles.userPill}>
          <div
            style={{ ...styles.avatar, cursor: "pointer", overflow: "hidden" }}
            onClick={() => document.getElementById("adminSidebarPhoto").click()}
            title="Click to change photo"
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt="profile"
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
            ) : user?.name?.charAt(0).toUpperCase()}
          </div>
          <input id="adminSidebarPhoto" type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => { if (e.target.files[0]) handleProfileUpload(e.target.files[0]); }} />
          <div>
            <div style={styles.userName}>{user?.name}</div>
            <div style={{ ...styles.userRole, color: "#a78bfa" }}>🏛️ MUNICIPALITY</div>
          </div>
        </div>

        <div style={styles.navSection}>
          <div style={styles.navLabel}>⚙️ CONTROL PANEL</div>
          {navItems.map((item) => (
            <div key={item.key}
              style={{ ...styles.navItem, ...(activeNav === item.key ? styles.navItemActive : {}) }}
              onClick={() => {
                setActiveNav(item.key);
                if (item.key === "inprogress") setFilter("inprogress");
                else if (item.key === "resolved") setFilter("resolved");
                else if (item.key === "issues") setFilter("all");
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {navBadges[item.key] > 0 && (
                <span style={{
                  ...styles.navBadge,
                  background: item.key === "inprogress" ? "#ffcc00" : item.key === "resolved" ? "#00ff88" : "#ff4455",
                  color: item.key === "issues" ? "white" : "#000",
                }}>
                  {navBadges[item.key]}
                </span>
              )}
            </div>
          ))}
        </div>

        <div style={styles.sidebarFooter}>
          <div style={styles.logoutBtn} onClick={() => { localStorage.clear(); window.location.href = "/"; }}>
            <span>⏻</span><span>LOGOUT</span>
          </div>
        </div>
      </div>

      {/* ===== MAIN ===== */}
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>
              {activeNav === "overview" && "📊 OVERVIEW"}
              {activeNav === "issues" && "🗂️ ALL ISSUES"}
              {activeNav === "inprogress" && "⏳ IN PROGRESS"}
              {activeNav === "resolved" && "✅ RESOLVED"}
              {activeNav === "citizens" && "👥 CITIZENS"}
              {activeNav === "analytics" && "📈 ANALYTICS"}
              {activeNav === "export" && "📥 EXPORT DATA"}
              {activeNav === "settings" && "⚙️ SETTINGS"}
            </h1>
            <p style={styles.headerSub}>Municipality Admin Control Panel</p>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.ghostBtn} onClick={() => setActiveNav("export")}>📥 Export</button>
            <button style={styles.primaryBtn} onClick={() => setActiveNav("issues")}>🗂️ VIEW ALL</button>
          </div>
        </div>

        <div style={styles.body}>

          {/* ===== OVERVIEW ===== */}
          {activeNav === "overview" && (
            <div>
              <div style={styles.statsGrid}>
                {[
                  { num: openCount, label: "🔴 Open Issues", color: "#ff4455" },
                  { num: progressCount, label: "⏳ In Progress", color: "#ffcc00" },
                  { num: resolvedCount, label: "✅ Resolved", color: "#00ff88" },
                  { num: issues.length, label: "📋 Total Issues", color: "#00f5ff" },
                  { num: highPriority, label: "🔥 High Priority", color: "#ff4455" },
                  { num: issues.reduce((s, i) => s + (i.upvotes || 0), 0), label: "👍 Total Upvotes", color: "#a78bfa" },
                  { num: [...new Set(issues.map(i => i.reportedBy?._id))].length, label: "👥 Active Citizens", color: "#00f5ff" },
                  { num: issues.filter(i => i.category === "pothole").length, label: "🕳️ Potholes", color: "#ffcc00" },
                ].map((s, i) => (
                  <div key={i} style={{ ...styles.statCard, borderTop: `2px solid ${s.color}` }}>
                    <div style={{ ...styles.statNum, color: s.color }}>{s.num}</div>
                    <div style={styles.statLbl}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={styles.panel}>
                <div style={styles.panelTitle}>🕐 RECENT REPORTS</div>
                {issues.slice(0, 5).map((issue) => {
                  const s = getStatusStyle(issue.status);
                  const p = getPriority(issue.upvotes || 0);
                  return (
                    <div key={issue._id} style={styles.recentItem}>
                      <div style={styles.recentIcon}>{getCategoryIcon(issue.category)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#e8f4ff", fontSize: "13px", fontWeight: 600 }}>{issue.title}</div>
                        <div style={{ color: "#4a6080", fontSize: "11px" }}>👤 {issue.reportedBy?.name} · 📍 {issue.location}</div>
                      </div>
                      <span style={{ color: p.color, fontSize: "11px", fontWeight: 700, marginRight: "8px" }}>{p.label}</span>
                      <span style={{ ...styles.badge, color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>{s.label}</span>
                    </div>
                  );
                })}
                {issues.length === 0 && <div style={{ color: "#4a6080", textAlign: "center", padding: "24px" }}>🚀 No issues yet!</div>}
              </div>
            </div>
          )}

          {/* ===== ISSUES TABLE ===== */}
          {(activeNav === "issues" || activeNav === "inprogress" || activeNav === "resolved") && (
            <div style={styles.panel}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div style={styles.panelTitle}>🗂️ ISSUE REPORTS</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {[{ key: "all", label: "ALL" }, { key: "open", label: "🔴 OPEN" }, { key: "inprogress", label: "⏳ ACTIVE" }, { key: "resolved", label: "✅ CLOSED" }].map(f => (
                    <button key={f.key} style={{ ...styles.fbtn, ...(filter === f.key ? styles.fbtnActive : {}) }} onClick={() => setFilter(f.key)}>{f.label}</button>
                  ))}
                </div>
              </div>
              <input style={styles.cinput} placeholder="🔍 Search issues, locations..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <div style={styles.tableHeader}>
                {["ISSUE", "CATEGORY", "LOCATION", "PRIORITY", "STATUS", "ACTIONS"].map(h => (
                  <span key={h} style={styles.colHead}>{h}</span>
                ))}
              </div>
              {filteredIssues.length === 0 && <div style={{ color: "#4a6080", textAlign: "center", padding: "32px" }}>🚀 No issues found!</div>}
              {filteredIssues.map((issue) => {
                const s = getStatusStyle(issue.status);
                const p = getPriority(issue.upvotes || 0);
                return (
                  <div key={issue._id} style={styles.tableRow}>
                    <div>
                      <div style={styles.rowTitle}>{issue.title}</div>
                      <div style={styles.rowMeta}>👤 {issue.reportedBy?.name}</div>
                    </div>
                    <div style={styles.catCell}>{getCategoryIcon(issue.category)} {issue.category}</div>
                    <div style={styles.locCell}>📍 {issue.location}</div>
                    <div style={{ color: p.color, fontSize: "12px", fontWeight: 700 }}>{p.label} ({issue.upvotes || 0}v)</div>
                    <div><span style={{ ...styles.badge, color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>{s.label}</span></div>
                    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                      {issue.status !== "inprogress" && issue.status !== "resolved" && (
                        <button style={styles.btnProgress} onClick={() => updateStatus(issue._id, "inprogress")}>⏳ Active</button>
                      )}
                      {issue.status !== "resolved" && (
                        <button style={styles.btnResolve} onClick={() => updateStatus(issue._id, "resolved")}>✅ Done</button>
                      )}
                      <button style={styles.btnDelete} onClick={() => handleDelete(issue._id)}>🗑️ Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== CITIZENS ===== */}
          {activeNav === "citizens" && (
            <div style={styles.panel}>
              <div style={styles.panelTitle}>👥 CITIZEN REPORTERS</div>
              {[...new Map(issues.map(i => [i.reportedBy?._id, i.reportedBy])).values()].filter(Boolean).map((citizen, i) => {
                const citizenIssues = issues.filter(is => is.reportedBy?._id === citizen._id);
                return (
                  <div key={i} style={styles.citizenCard}>
                    <div style={styles.citizenAvatar}>{citizen.name?.charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#e8f4ff", fontSize: "14px", fontWeight: 600 }}>👤 {citizen.name}</div>
                      <div style={{ color: "#4a6080", fontSize: "11px" }}>📧 {citizen.email}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#a78bfa", fontSize: "20px", fontWeight: 900 }}>{citizenIssues.length}</div>
                      <div style={{ color: "#4a6080", fontSize: "10px" }}>REPORTS</div>
                    </div>
                  </div>
                );
              })}
              {issues.length === 0 && <div style={{ color: "#4a6080", textAlign: "center", padding: "24px" }}>👥 No citizens yet!</div>}
            </div>
          )}

          {/* ===== ANALYTICS ===== */}
          {activeNav === "analytics" && (
            <div>
              <div style={styles.statsGrid}>
                {[
                  { num: `${issues.length > 0 ? Math.round((resolvedCount / issues.length) * 100) : 0}%`, label: "✅ Resolution Rate", color: "#00ff88" },
                  { num: `${issues.length > 0 ? Math.round((progressCount / issues.length) * 100) : 0}%`, label: "⏳ Active Rate", color: "#ffcc00" },
                  { num: issues.reduce((s, i) => s + (i.upvotes || 0), 0), label: "👍 Total Upvotes", color: "#a78bfa" },
                  { num: highPriority, label: "🔥 High Priority", color: "#ff4455" },
                ].map((s, i) => (
                  <div key={i} style={{ ...styles.statCard, borderTop: `2px solid ${s.color}` }}>
                    <div style={{ ...styles.statNum, color: s.color }}>{s.num}</div>
                    <div style={styles.statLbl}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={styles.panel}>
                <div style={styles.panelTitle}>📊 CATEGORY BREAKDOWN</div>
                {["pothole", "streetlight", "garbage", "waterleak"].map(cat => {
                  const count = issues.filter(i => i.category === cat).length;
                  const pct = issues.length > 0 ? Math.round((count / issues.length) * 100) : 0;
                  return (
                    <div key={cat} style={{ marginBottom: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ color: "#e8f4ff", fontSize: "13px" }}>{getCategoryIcon(cat)} {cat}</span>
                        <span style={{ color: "#a78bfa", fontSize: "13px", fontWeight: 700 }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ background: "#1a2540", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#7c3aed,#a78bfa)", borderRadius: "4px" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== EXPORT ===== */}
          {activeNav === "export" && (
            <div style={styles.panel}>
              <div style={styles.panelTitle}>📥 EXPORT DATA</div>
              <p style={{ color: "#4a6080", fontSize: "13px" }}>Download all civic issue data in your preferred format</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div style={styles.exportCard} onClick={() => handleExport("csv")}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>📊</div>
                  <div style={{ color: "#00ff88", fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>Excel / CSV</div>
                  <div style={{ color: "#4a6080", fontSize: "12px" }}>Open in Excel, Google Sheets</div>
                  <div style={{ ...styles.exportBtn, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", color: "#00ff88", marginTop: "16px" }}>⬇ DOWNLOAD CSV</div>
                </div>
                <div style={styles.exportCard} onClick={() => handleExport("pdf")}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>📄</div>
                  <div style={{ color: "#4d9fff", fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>PDF Report</div>
                  <div style={{ color: "#4a6080", fontSize: "12px" }}>Professional white report</div>
                  <div style={{ ...styles.exportBtn, background: "rgba(0,82,204,0.1)", border: "1px solid rgba(0,82,204,0.3)", color: "#4d9fff", marginTop: "16px" }}>⬇ DOWNLOAD PDF</div>
                </div>
              </div>
              <div style={{ ...styles.panelTitle, marginTop: "8px" }}>⚡ QUICK EXPORT</div>
              {[
                { icon: "🔴", label: "Open Issues Only", sub: `${openCount} open issues`, f: "open" },
                { icon: "⏳", label: "In Progress Only", sub: `${progressCount} active issues`, f: "inprogress" },
                { icon: "✅", label: "Resolved Only", sub: `${resolvedCount} resolved issues`, f: "resolved" },
                { icon: "📋", label: "All Issues", sub: `${issues.length} total issues`, f: "all" },
              ].map((opt, i) => (
                <div key={i} style={styles.exportOption} onClick={() => { setFilter(opt.f); setActiveNav("issues"); }}>
                  <div style={{ fontSize: "24px" }}>{opt.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#e8f4ff", fontSize: "13px", fontWeight: 600 }}>{opt.label}</div>
                    <div style={{ color: "#4a6080", fontSize: "11px", marginTop: "2px" }}>{opt.sub}</div>
                  </div>
                  <span style={{ color: "#a78bfa", fontSize: "16px" }}>→</span>
                </div>
              ))}
            </div>
          )}

          {/* ===== SETTINGS ===== */}
          {activeNav === "settings" && (
            <div style={styles.panel}>
              <div style={styles.panelTitle}>⚙️ ADMIN SETTINGS</div>

              {message && (
                <div style={{
                  padding: "10px 14px", borderRadius: "8px", fontSize: "13px",
                  color: message.includes("✅") ? "#00ff88" : "#ff4455",
                  background: message.includes("✅") ? "rgba(0,255,136,0.08)" : "rgba(255,68,85,0.08)",
                  border: `1px solid ${message.includes("✅") ? "rgba(0,255,136,0.3)" : "rgba(255,68,85,0.3)"}`,
                }}>{message}</div>
              )}

              {/* Profile Photo */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px", padding: "16px", background: "#101828", borderRadius: "12px", border: "1px solid #1a2540" }}>
                <div style={{ width: "72px", height: "72px", borderRadius: "12px", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: 900, color: "#fff", overflow: "hidden", flexShrink: 0 }}>
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#e8f4ff", fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>{user?.name}</div>
                  <div style={{ color: "#4a6080", fontSize: "12px", marginBottom: "10px" }}>{user?.email}</div>
                  <button
                    style={{ padding: "7px 16px", background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", color: "#a78bfa", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
                    onClick={() => document.getElementById("adminSettingsPhoto").click()}
                  >
                    {profileUploading ? "Uploading..." : "📸 Change Photo"}
                  </button>
                  <input id="adminSettingsPhoto" type="file" accept="image/*" style={{ display: "none" }}
                    onChange={(e) => { if (e.target.files[0]) handleProfileUpload(e.target.files[0]); }} />
                </div>
              </div>

              {[
                { label: "👤 Admin Name", val: user?.name },
                { label: "📧 Email", val: user?.email },
                { label: "🎭 Role", val: "Municipality Admin" },
                { label: "🏙️ System", val: "CivicAlert v2.0" },
              ].map((s, i) => (
                <div key={i} style={styles.field}>
                  <label style={styles.flabel}>{s.label}</label>
                  <input style={{ ...styles.cinput, opacity: 0.6 }} value={s.val} readOnly />
                </div>
              ))}
              <button
                style={{ padding: "13px", width: "100%", background: "rgba(255,68,85,0.1)", color: "#ff4455", border: "1px solid rgba(255,68,85,0.3)", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
                onClick={() => { localStorage.clear(); window.location.href = "/"; }}>
                ⏻ LOGOUT
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh", width: "100%", background: "#050810", fontFamily: "sans-serif", color: "#e8f4ff" },
  sidebar: { width: "240px", minHeight: "100vh", background: "#080c14", borderRight: "1px solid #1a2540", display: "flex", flexDirection: "column", flexShrink: 0, position: "relative" },
  glowLine: { position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg,transparent,#a78bfa,transparent)" },
  logoWrap: { padding: "24px 20px 16px", borderBottom: "1px solid #1a2540" },
  logoText: { fontFamily: "'Courier New',monospace", fontWeight: 900, fontSize: "18px", letterSpacing: "0.05em" },
  logoTag: { fontSize: "9px", color: "#4a6080", fontFamily: "'Courier New',monospace", letterSpacing: "0.08em", marginTop: "4px" },
  userPill: { margin: "14px 12px", background: "rgba(167,139,250,0.05)", border: "1px solid #1e2d4a", borderRadius: "10px", padding: "10px 12px", display: "flex", alignItems: "center", gap: "10px" },
  avatar: { width: "34px", height: "34px", borderRadius: "8px", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "14px", color: "#fff", flexShrink: 0 },
  userName: { fontSize: "13px", fontWeight: 600, color: "#e8f4ff" },
  userRole: { fontSize: "9px", fontFamily: "'Courier New',monospace", letterSpacing: "0.08em", marginTop: "2px" },
  navSection: { padding: "8px 12px", flex: 1 },
  navLabel: { fontSize: "9px", color: "#4a6080", fontFamily: "'Courier New',monospace", letterSpacing: "0.15em", padding: "10px 8px 8px" },
  navItem: { display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", cursor: "pointer", color: "#4a6080", fontSize: "13px", fontWeight: 500, marginBottom: "2px", border: "1px solid transparent" },
  navItemActive: { color: "#a78bfa", background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)" },
  navBadge: { marginLeft: "auto", fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "10px" },
  sidebarFooter: { padding: "16px 12px", borderTop: "1px solid #1a2540" },
  logoutBtn: { display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", cursor: "pointer", color: "#ff4455", fontSize: "13px", fontWeight: 600, border: "1px solid rgba(255,68,85,0.2)", fontFamily: "'Courier New',monospace", letterSpacing: "0.05em" },
  main: { flex: 1, overflow: "auto", minWidth: 0 },
  header: { padding: "24px 32px 20px", borderBottom: "1px solid #1a2540", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "28px" },
  headerTitle: { fontFamily: "'Courier New',monospace", fontSize: "20px", fontWeight: 900, margin: 0, color: "#FFFFFF" },
 headerSub: { color: "#8ab4d4", fontSize: "13px", marginTop: "4px" },
  headerActions: { display: "flex", gap: "10px" },
  ghostBtn: { padding: "8px 18px", background: "transparent", border: "1px solid #1e2d4a", color: "#7a9ab8", borderRadius: "8px", cursor: "pointer", fontSize: "13px" },
  primaryBtn: { padding: "8px 18px", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 700, fontFamily: "'Courier New',monospace" },
  body: { padding: "0 32px 32px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "24px" },
  statCard: { background: "#0c1120", border: "1px solid #1a2540", borderRadius: "12px", padding: "18px" },
  statNum: { fontFamily: "'Courier New',monospace", fontSize: "32px", fontWeight: 900, lineHeight: 1 },
  statLbl: { color: "#4a6080", fontSize: "11px", marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.05em" },
  panel: { background: "#0c1120", border: "1px solid #1a2540", borderRadius: "12px", padding: "22px", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" },
  panelTitle: { fontFamily: "'Courier New',monospace", fontSize: "12px", fontWeight: 700, color: "#a78bfa", letterSpacing: "0.1em", paddingBottom: "12px", borderBottom: "1px solid #1a2540" },
  recentItem: { display: "flex", gap: "12px", alignItems: "center", padding: "12px", background: "#101828", borderRadius: "8px", border: "1px solid #1a2540" },
  recentIcon: { width: "36px", height: "36px", background: "rgba(167,139,250,0.08)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 },
  badge: { padding: "3px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 700, whiteSpace: "nowrap", fontFamily: "'Courier New',monospace", letterSpacing: "0.05em" },
  tableHeader: { display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 1fr 0.9fr 1.2fr", padding: "10px 12px", background: "#101828", borderRadius: "8px", border: "1px solid #1a2540" },
  colHead: { color: "#8ab4d4", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", fontFamily: "'Courier New',monospace" },
  tableRow: { display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 1fr 0.9fr 1.2fr", padding: "13px 12px", borderBottom: "1px solid #1a2540", alignItems: "center", gap: "8px" },
  rowTitle: { fontSize: "13px", fontWeight: 600, color: "#e8f4ff" },
  rowMeta: { color: "#4a6080", fontSize: "10px", marginTop: "2px", fontFamily: "'Courier New',monospace" },
  catCell: { color: "#7a9ab8", fontSize: "12px" },
  locCell: { color: "#7a9ab8", fontSize: "12px" },
  btnProgress: { padding: "5px 10px", background: "rgba(255,204,0,0.1)", border: "1px solid rgba(255,204,0,0.3)", color: "#ffcc00", borderRadius: "5px", fontSize: "12px", cursor: "pointer" },
  btnResolve: { padding: "5px 10px", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", color: "#00ff88", borderRadius: "5px", fontSize: "12px", cursor: "pointer" },
  btnDelete: { padding: "5px 10px", background: "rgba(255,68,85,0.1)", border: "1px solid rgba(255,68,85,0.3)", color: "#ff4455", borderRadius: "5px", fontSize: "12px", cursor: "pointer" },
  citizenCard: { display: "flex", gap: "12px", alignItems: "center", padding: "14px", background: "#101828", borderRadius: "10px", border: "1px solid #1a2540" },
  citizenAvatar: { width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "16px", color: "#fff", flexShrink: 0 },
  exportCard: { background: "#101828", border: "1px solid #1a2540", borderRadius: "12px", padding: "24px", cursor: "pointer", textAlign: "center" },
  exportBtn: { padding: "10px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, fontFamily: "'Courier New',monospace", letterSpacing: "0.08em", textAlign: "center" },
  exportOption: { display: "flex", gap: "16px", alignItems: "center", padding: "14px", background: "#101828", borderRadius: "10px", border: "1px solid #1a2540", cursor: "pointer" },
  field: { display: "flex", flexDirection: "column", gap: "7px" },
  flabel: { fontSize: "13px", color: "#7a9ab8", fontWeight: 600 },
  cinput: { padding: "11px 14px", background: "rgba(0,245,255,0.03)", border: "1px solid #1e2d4a", borderRadius: "8px", color: "#e8f4ff", fontSize: "13px", outline: "none", fontFamily: "sans-serif" },
  fbtn: { padding: "5px 12px", borderRadius: "20px", border: "1px solid #1e2d4a", background: "transparent", color: "#4a6080", fontSize: "11px", cursor: "pointer", fontWeight: 600 },
  fbtnActive: { border: "1px solid #a78bfa", color: "#a78bfa", background: "rgba(167,139,250,0.07)" },
};

export default AdminDashboard;
