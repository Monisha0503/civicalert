import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const ANTHROPIC_API_KEY = "";

function CitizenDashboard() {
  const [issues, setIssues] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", category: "pothole", location: "" });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [activeNav, setActiveNav] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [aiPriority, setAiPriority] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "bot", text: "Hi! I am CivicBot 🤖 Ask me anything about CivicAlert, civic issues, or general topics! 😊" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  useEffect(() => { fetchIssues(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const fetchIssues = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/issues/myissues", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIssues(res.data);
    } catch (err) { console.log(err); }
  };

  const detectAIPriority = async (title, category, location) => {
    if (!title || title.length < 3) { setAiPriority(null); return; }
    setAiLoading(true);
    const t = title.toLowerCase();
    await new Promise(r => setTimeout(r, 600));
    if (t.includes("hospital") || t.includes("school") || t.includes("flood") ||
        t.includes("fire") || t.includes("accident") || t.includes("dangerous") ||
        t.includes("emergency") || t.includes("injury"))
      setAiPriority({ priority: "HIGH", reason: "Safety critical — immediate attention needed", color: "#ff4455" });
    else if (t.includes("streetlight") || t.includes("garbage") || t.includes("broken") ||
             t.includes("leak") || t.includes("blocked") || t.includes("pothole") ||
             t.includes("crack") || t.includes("noise"))
      setAiPriority({ priority: "MEDIUM", reason: "Common civic issue — needs attention", color: "#ffcc00" });
    else
      setAiPriority({ priority: "LOW", reason: "Minor issue — can be scheduled", color: "#00ff88" });
    setAiLoading(false);
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);

    await new Promise(r => setTimeout(r, 800));

    const t = userMsg.toLowerCase();
    let reply = "";

    if (t.includes("report") || t.includes("how to"))
      reply = "📍 To report an issue: Click 'Report Issue' in the sidebar → Fill title, location, category → Upload photo → Submit! ✅";
    else if (t.includes("status") || t.includes("track"))
      reply = "📋 Check your issue status in 'My Issues' tab! 🔴 Open = waiting | ⏳ Active = being fixed | ✅ Closed = resolved!";
    else if (t.includes("priority") || t.includes("ai"))
      reply = "🤖 AI Priority Detection automatically classifies your issue as HIGH 🔴, MEDIUM 🟡, or LOW 🟢 based on the title you type!";
    else if (t.includes("upvote"))
      reply = "👍 Go to 'My Issues' → Click 'Upvote' button on any open issue to show it's important to the community!";
    else if (t.includes("map"))
      reply = "🗺️ Click 'Live Map' in sidebar to see all reported issues on an interactive Chennai map powered by OpenStreetMap!";
    else if (t.includes("joke"))
      reply = "😄 Why did the pothole go to school? Because it wanted to be filled with knowledge! 🕳️📚";
    else if (t.includes("tamil") || t.includes("தமிழ்"))
      reply = "வணக்கம்! 🙏 நான் CivicBot! உங்கள் civic issues report பண்ண உதவுவேன்! என்ன help வேணும்?";
    else if (t.includes("hello") || t.includes("hi") || t.includes("hey") || t.includes("helo"))
      reply = "Hi there! 👋 I'm CivicBot! Ask me anything about CivicAlert — reporting issues, tracking status, or how the app works! 🏙️";
    else if (t.includes("category") || t.includes("type"))
      reply = "🏷️ CivicAlert has 4 categories: 🕳️ Pothole | 💡 Street Light | 🗑️ Garbage | 💧 Water Leak";
    else if (t.includes("delete"))
      reply = "🗑️ Go to 'My Issues' → Click the red Delete button on any of your reported issues!";
    else if (t.includes("login") || t.includes("register"))
      reply = "🔐 Register with name, email, password → Login → You'll reach this dashboard automatically!";
    else if (t.includes("admin"))
      reply = "👨‍💼 Admin can view ALL issues, update status, export PDF/CSV, and manage all citizens!";
    else if (t.includes("photo") || t.includes("image"))
      reply = "📸 Upload a photo when reporting an issue! Also change your profile photo in Settings or sidebar!";
    else if (t.includes("notification"))
      reply = "🔔 Check Notifications tab to see updates on your reported issues like status changes and upvotes!";
    else if (t.includes("pdf") || t.includes("export") || t.includes("csv"))
      reply = "📄 Admins can export all issues as PDF or CSV from the Admin Dashboard → Export Data section!";
    else if (t.includes("what is civicalert") || t.includes("about"))
      reply = "🏙️ CivicAlert is a Smart City platform where citizens report civic issues like potholes, garbage, broken streetlights to municipal authorities!";
    else if (t.includes("pothole"))
      reply = "🕳️ Pothole is a road damage category! Report it with location + photo. AI will detect priority automatically!";
    else if (t.includes("streetlight") || t.includes("light"))
      reply = "💡 Broken streetlights are a safety issue! Report under 'Street Light' category with exact location!";
    else if (t.includes("garbage") || t.includes("waste"))
      reply = "🗑️ Report garbage overflow under 'Garbage' category! Include the exact street/area location!";
    else if (t.includes("water") || t.includes("leak"))
      reply = "💧 Water leak is urgent! Report under 'Water Leak' category — it may get HIGH priority if near school/hospital!";
    else if (t.includes("thank") || t.includes("thanks"))
      reply = "You're welcome! 😊 Happy to help! Report any civic issues you see — together we make our city better! 🏙️⚡";
    else if (t.includes("bye") || t.includes("ok") || t.includes("okay"))
      reply = "Take care! 👋 Come back anytime if you need help with CivicAlert! 🤖🏙️";
    else
      reply = "🤖 I'm CivicBot! I can help with: \n📍 How to report issues \n📋 Checking issue status \n👍 Upvoting \n🗺️ Live map \n🤖 AI priority \n\nWhat do you need help with? 😊";

    setChatMessages(prev => [...prev, { role: "bot", text: reply }]);
    setChatLoading(false);
  };

  const handleProfileUpload = async (file) => {
    setProfileUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await axios.post("http://localhost:5000/api/auth/profile/photo", formData, {
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

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("location", form.location);
      if (photo) formData.append("photo", photo);
      await axios.post("http://localhost:5000/api/issues/report", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setMessage("✅ Issue reported successfully!");
      setForm({ title: "", description: "", category: "pothole", location: "" });
      setPhoto(null); setPhotoPreview(null); setAiPriority(null);
      fetchIssues(); setActiveNav("issues");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) { setMessage("❌ Error reporting issue!"); }
  };

  const handleUpvote = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/issues/upvote/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchIssues();
    } catch (err) { console.log(err); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/issues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchIssues();
    } catch (err) { console.log(err); }
  };

  const categories = [
    { value: "pothole", label: "Pothole", icon: "🕳️" },
    { value: "streetlight", label: "Street Light", icon: "💡" },
    { value: "garbage", label: "Garbage", icon: "🗑️" },
    { value: "waterleak", label: "Water Leak", icon: "💧" },
  ];

  const getCategoryIcon = (cat) => categories.find(c => c.value === cat)?.icon || "🔧";

  const getStatusStyle = (status) => {
    if (status === "open") return { label: "🔴 Open", color: "#ff4455", bg: "rgba(255,68,85,0.1)", border: "rgba(255,68,85,0.3)" };
    if (status === "inprogress") return { label: "⏳ Active", color: "#ffcc00", bg: "rgba(255,204,0,0.1)", border: "rgba(255,204,0,0.3)" };
    if (status === "resolved") return { label: "✅ Closed", color: "#00ff88", bg: "rgba(0,255,136,0.1)", border: "rgba(0,255,136,0.3)" };
    return { label: status, color: "#fff", bg: "#333", border: "#555" };
  };

  const filteredIssues = issues.filter(i => {
    const matchFilter = filter === "all" || i.status === filter;
    const matchSearch = i.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.location?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const openCount = issues.filter(i => i.status === "open").length;
  const progressCount = issues.filter(i => i.status === "inprogress").length;
  const resolvedCount = issues.filter(i => i.status === "resolved").length;
  const totalUpvotes = issues.reduce((sum, i) => sum + (i.upvotes || 0), 0);

  const navItems = [
    { key: "dashboard", icon: "📊", label: "Dashboard" },
    { key: "report", icon: "📍", label: "Report Issue" },
    { key: "issues", icon: "📋", label: "My Issues" },
    { key: "map", icon: "🗺️", label: "Live Map" },
    { key: "civicbot", icon: "🤖", label: "CivicBot AI" },
    { key: "notifications", icon: "🔔", label: "Notifications" },
    { key: "settings", icon: "⚙️", label: "Settings" },
  ];

  const sampleCoords = [
    [13.0827, 80.2707], [13.0569, 80.2425],
    [13.1067, 80.2206], [13.0012, 80.2565], [13.0878, 80.2785],
  ];

  const avatarSrc = user?.photo ? `http://localhost:5000/uploads/${user.photo}` : null;

  const quickQuestions = [
    "How to report an issue?",
    "What is AI priority?",
    "How to check issue status?",
    "Tell me a joke 😄",
  ];

  return (
    <div style={styles.container}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.glowLine} />
        <div style={styles.logoWrap}>
          <div style={styles.logoText}>
            <span style={{ color: "#00f5ff" }}>CIVIC</span>
            <span style={{ color: "#e8f4ff" }}>ALERT</span>
          </div>
          <div style={styles.logoTag}>🏙️ Smart City Platform</div>
        </div>

        <div style={styles.userPill}>
          <div style={{ ...styles.avatar, cursor: "pointer", overflow: "hidden" }}
            onClick={() => document.getElementById("sidebarPhotoInput").click()}
            title="Click to change photo">
            {avatarSrc
              ? <img src={avatarSrc} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
              : user?.name?.charAt(0).toUpperCase()}
          </div>
          <input id="sidebarPhotoInput" type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => { if (e.target.files[0]) handleProfileUpload(e.target.files[0]); }} />
          <div>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userRole}>⚡ Citizen</div>
          </div>
        </div>

        <div style={styles.navSection}>
          <div style={styles.navLabel}>Main Menu</div>
          {navItems.map((item) => (
            <div key={item.key}
              style={{ ...styles.navItem, ...(activeNav === item.key ? styles.navItemActive : {}) }}
              onClick={() => setActiveNav(item.key)}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.key === "issues" && issues.length > 0 && (
                <span style={styles.navBadge}>{issues.length}</span>
              )}
              {item.key === "notifications" && (
                <span style={{ ...styles.navBadge, background: "#ffcc00", color: "#000" }}>2</span>
              )}
              {item.key === "civicbot" && (
                <span style={{ ...styles.navBadge, background: "#a78bfa", color: "#000" }}>AI</span>
              )}
            </div>
          ))}
        </div>

        <div style={styles.sidebarFooter}>
          <div style={styles.logoutBtn}
            onClick={() => { localStorage.clear(); window.location.href = "/"; }}>
            <span>⏻</span><span>Logout</span>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>
              {activeNav === "dashboard" && "📊 Dashboard"}
              {activeNav === "report" && "📍 Report Issue"}
              {activeNav === "issues" && "📋 My Issues"}
              {activeNav === "map" && "🗺️ Live Map"}
              {activeNav === "civicbot" && "🤖 CivicBot AI"}
              {activeNav === "notifications" && "🔔 Notifications"}
              {activeNav === "settings" && "⚙️ Settings"}
            </h1>
            <p style={styles.headerSub}>Track and manage your civic reports</p>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.ghostBtn} onClick={() => setActiveNav("civicbot")}>🤖 CivicBot</button>
            <button style={styles.primaryBtn} onClick={() => setActiveNav("report")}>⚡ New Report</button>
          </div>
        </div>

        <div style={styles.body}>

          {/* DASHBOARD */}
          {activeNav === "dashboard" && (
            <div>
              <div style={styles.statsGrid}>
                <div style={{ ...styles.statCard, borderTop: "2px solid #00f5ff" }}>
                  <div style={{ ...styles.statNum, color: "#00f5ff" }}>{issues.length}</div>
                  <div style={styles.statLbl}>📋 Total Reports</div>
                </div>
                <div style={{ ...styles.statCard, borderTop: "2px solid #ffcc00" }}>
                  <div style={{ ...styles.statNum, color: "#ffcc00" }}>{progressCount}</div>
                  <div style={styles.statLbl}>⏳ In Progress</div>
                </div>
                <div style={{ ...styles.statCard, borderTop: "2px solid #00ff88" }}>
                  <div style={{ ...styles.statNum, color: "#00ff88" }}>{resolvedCount}</div>
                  <div style={styles.statLbl}>✅ Resolved</div>
                </div>
                <div style={{ ...styles.statCard, borderTop: "2px solid #a78bfa" }}>
                  <div style={{ ...styles.statNum, color: "#a78bfa" }}>{totalUpvotes}</div>
                  <div style={styles.statLbl}>👍 Upvotes</div>
                </div>
              </div>
              <div style={styles.panel}>
                <div style={styles.panelTitle}>🕐 Recent Activity</div>
                {issues.length === 0 && (
                  <div style={{ color: "#4a6080", textAlign: "center", padding: "24px" }}>
                    🚀 No reports yet! Click New Report to start.
                  </div>
                )}
                {issues.slice(0, 4).map((issue) => {
                  const s = getStatusStyle(issue.status);
                  return (
                    <div key={issue._id} style={styles.activityItem}>
                      <div style={styles.actIcon}>{getCategoryIcon(issue.category)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#e8f4ff", fontSize: "13px", fontWeight: 600 }}>{issue.title}</div>
                        <div style={{ color: "#4a6080", fontSize: "11px" }}>📍 {issue.location}</div>
                      </div>
                      <span style={{ ...styles.badge, color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* REPORT ISSUE */}
          {activeNav === "report" && (
            <div style={styles.panel}>
              <div style={styles.panelTitle}>📍 New Issue Report</div>
              {message && (
                <div style={{
                  padding: "10px 14px", borderRadius: "8px", fontSize: "13px",
                  color: message.includes("✅") ? "#00ff88" : "#ff4455",
                  background: message.includes("✅") ? "rgba(0,255,136,0.08)" : "rgba(255,68,85,0.08)",
                  border: `1px solid ${message.includes("✅") ? "rgba(0,255,136,0.3)" : "rgba(255,68,85,0.3)"}`,
                }}>{message}</div>
              )}
              <div style={styles.formGrid}>
                <div style={styles.field}>
                  <label style={styles.flabel}>📝 Issue Title</label>
                  <input style={styles.cinput} placeholder="Describe the issue..."
                    value={form.title}
                    onChange={(e) => {
                      setForm({ ...form, title: e.target.value });
                      clearTimeout(window.aiTimer);
                      window.aiTimer = setTimeout(() => {
                        detectAIPriority(e.target.value, form.category, form.location);
                      }, 800);
                    }} />
                </div>
                <div style={styles.field}>
                  <label style={styles.flabel}>📍 Location</label>
                  <input style={styles.cinput} placeholder="Street, Area, City..."
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>

              {aiLoading && (
                <div style={styles.aiBox}>
                  <span style={{ fontSize: "18px" }}>🤖</span>
                  <span style={{ color: "#00f5ff", fontSize: "13px" }}>AI analyzing priority...</span>
                </div>
              )}
              {aiPriority && !aiLoading && (
                <div style={{ ...styles.aiBox, borderColor: aiPriority.color, background: `${aiPriority.color}18` }}>
                  <span style={{ fontSize: "22px" }}>🤖</span>
                  <div>
                    <div style={{ color: aiPriority.color, fontWeight: 700, fontSize: "14px" }}>
                      AI Priority: {aiPriority.priority}
                    </div>
                    <div style={{ color: "#7a9ab8", fontSize: "12px", marginTop: "2px" }}>{aiPriority.reason}</div>
                  </div>
                  <div style={{
                    marginLeft: "auto", padding: "4px 12px", borderRadius: "20px", fontSize: "11px",
                    fontWeight: 700, background: `${aiPriority.color}20`,
                    border: `1px solid ${aiPriority.color}50`, color: aiPriority.color
                  }}>
                    {aiPriority.priority === "HIGH" ? "🔴" : aiPriority.priority === "MEDIUM" ? "🟡" : "🟢"} {aiPriority.priority}
                  </div>
                </div>
              )}

              <div style={styles.field}>
                <label style={styles.flabel}>🏷️ Category</label>
                <div style={styles.catGrid}>
                  {categories.map((cat) => (
                    <button key={cat.value}
                      style={{ ...styles.catBtn, ...(form.category === cat.value ? styles.catBtnActive : {}) }}
                      onClick={() => setForm({ ...form, category: cat.value })}>
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.flabel}>📸 Photo Upload</label>
                <div style={styles.uploadBox} onClick={() => document.getElementById("photoInput").click()}>
                  {photoPreview
                    ? <img src={photoPreview} alt="preview" style={{ width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "8px" }} />
                    : <><div style={{ fontSize: "28px", marginBottom: "8px" }}>📷</div><div style={{ color: "#4a6080", fontSize: "13px" }}>Click to upload photo</div></>
                  }
                </div>
                <input id="photoInput" type="file" accept="image/*" style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) { setPhoto(file); setPhotoPreview(URL.createObjectURL(file)); }
                  }} />
              </div>

              <div style={styles.field}>
                <label style={styles.flabel}>📄 Description</label>
                <input style={styles.cinput} placeholder="Additional details..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <button style={styles.submitBtn} onClick={handleSubmit}>⚡ Submit Report →</button>
            </div>
          )}

          {/* MY ISSUES */}
          {activeNav === "issues" && (
            <div style={styles.panel}>
              <div style={styles.panelTitle}>📋 My Reported Issues</div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <input style={{ ...styles.cinput, flex: 1, minWidth: "200px" }}
                  placeholder="🔍 Search issues..." value={search}
                  onChange={(e) => setSearch(e.target.value)} />
                <div style={{ display: "flex", gap: "6px" }}>
                  {[{ key: "all", label: "All" }, { key: "open", label: "🔴 Open" }, { key: "inprogress", label: "⏳ Active" }, { key: "resolved", label: "✅ Closed" }].map((f) => (
                    <button key={f.key} style={{ ...styles.fbtn, ...(filter === f.key ? styles.fbtnActive : {}) }}
                      onClick={() => setFilter(f.key)}>{f.label}</button>
                  ))}
                </div>
              </div>
              {filteredIssues.length === 0 && <div style={{ color: "#4a6080", textAlign: "center", padding: "32px" }}>🚀 No issues found!</div>}
              {filteredIssues.map((issue) => {
                const s = getStatusStyle(issue.status);
                return (
                  <div key={issue._id} style={{ ...styles.issueCard, borderLeft: `3px solid ${s.color}` }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <div style={styles.issueIcon}>
                        {issue.photo
                          ? <img src={`http://localhost:5000/uploads/${issue.photo}`} alt="issue" style={{ width: "42px", height: "42px", borderRadius: "8px", objectFit: "cover" }} />
                          : getCategoryIcon(issue.category)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <strong style={{ color: "#e8f4ff", fontSize: "14px" }}>{issue.title}</strong>
                          <span style={{ ...styles.badge, color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>{s.label}</span>
                        </div>
                        <div style={{ color: "#4a6080", fontSize: "12px", marginBottom: "8px" }}>📍 {issue.location}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          <span style={{ color: "#4a6080", fontSize: "11px" }}>👍 {issue.upvotes || 0} upvotes</span>
                          {issue.status === "open" && <button style={styles.upvoteBtn} onClick={() => handleUpvote(issue._id)}>⬆ Upvote</button>}
                          <button style={styles.deleteBtn} onClick={() => handleDelete(issue._id)}>🗑️ Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MAP */}
          {activeNav === "map" && (
            <div style={styles.panel}>
              <div style={styles.panelTitle}>🗺️ Live Issue Map — Chennai</div>
              <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #1a2540", height: "420px" }}>
                <MapContainer center={[13.0827, 80.2707]} zoom={12} style={{ height: "100%", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                  {issues.map((issue, i) => (
                    <Marker key={issue._id} position={sampleCoords[i % sampleCoords.length]}>
                      <Popup>
                        <strong>{issue.title}</strong><br />
                        📍 {issue.location}<br />
                        🏷️ {issue.category}<br />
                        Status: <b>{issue.status}</b><br />
                        👍 {issue.upvotes || 0} upvotes
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div style={styles.mapStat}><div style={{ color: "#ff4455", fontSize: "24px", fontWeight: 900 }}>{openCount}</div><div style={{ color: "#4a6080", fontSize: "11px" }}>🔴 Open</div></div>
                <div style={styles.mapStat}><div style={{ color: "#ffcc00", fontSize: "24px", fontWeight: 900 }}>{progressCount}</div><div style={{ color: "#4a6080", fontSize: "11px" }}>⏳ Active</div></div>
                <div style={styles.mapStat}><div style={{ color: "#00ff88", fontSize: "24px", fontWeight: 900 }}>{resolvedCount}</div><div style={{ color: "#4a6080", fontSize: "11px" }}>✅ Resolved</div></div>
              </div>
            </div>
          )}

          {/* CIVICBOT */}
          {activeNav === "civicbot" && (
            <div style={styles.panel}>
              <div style={styles.panelTitle}>🤖 CivicBot AI — Ask Me Anything!</div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {quickQuestions.map((q, i) => (
                  <button key={i}
                    style={{ padding: "6px 14px", background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", color: "#a78bfa", borderRadius: "20px", fontSize: "12px", cursor: "pointer" }}
                    onClick={() => setChatInput(q)}>
                    {q}
                  </button>
                ))}
              </div>

              <div style={{
                height: "400px", overflowY: "auto", display: "flex",
                flexDirection: "column", gap: "12px", padding: "12px",
                background: "#080c14", borderRadius: "10px", border: "1px solid #1a2540"
              }}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: "8px" }}>
                    {msg.role === "bot" && <div style={{ fontSize: "24px", flexShrink: 0 }}>🤖</div>}
                    <div style={{
                      maxWidth: "72%", padding: "10px 14px", borderRadius: "12px",
                      fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-line",
                      background: msg.role === "user" ? "linear-gradient(135deg,#0066ff,#00f5ff)" : "#0c1120",
                      color: msg.role === "user" ? "#000" : "#e8f4ff",
                      border: msg.role === "bot" ? "1px solid #1a2540" : "none",
                      fontWeight: msg.role === "user" ? 600 : 400,
                    }}>
                      {msg.text}
                    </div>
                    {msg.role === "user" && (
                      <div style={{ flexShrink: 0, width: "28px", height: "28px", borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg,#0066ff,#00f5ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800, color: "#000" }}>
                        {avatarSrc
                          ? <img src={avatarSrc} alt="u" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ fontSize: "24px" }}>🤖</div>
                    <div style={{ padding: "10px 16px", background: "#0c1120", border: "1px solid #1a2540", borderRadius: "12px", color: "#a78bfa", fontSize: "13px" }}>
                      Thinking... 💭
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  style={{ ...styles.cinput, flex: 1 }}
                  placeholder="Ask anything... 💬 Press Enter to send"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleChatSend(); }}
                />
                <button
                  style={{ padding: "11px 22px", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", border: "none", borderRadius: "8px", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
                  onClick={handleChatSend}>
                  Send ➤
                </button>
              </div>
              <div style={{ color: "#4a6080", fontSize: "11px", textAlign: "center" }}>
                🤖 CivicBot — Powered by AI | Ask anything in Tamil or English!
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeNav === "notifications" && (
            <div style={styles.panel}>
              <div style={styles.panelTitle}>🔔 Notifications</div>
              {[
                { icon: "✅", text: "Your issue 'Street light' has been resolved!", time: "2 hrs ago", color: "#00ff88" },
                { icon: "⏳", text: "Your issue 'Pothole' is now in progress!", time: "5 hrs ago", color: "#ffcc00" },
                { icon: "👍", text: "Someone upvoted your report!", time: "1 day ago", color: "#00f5ff" },
              ].map((n, i) => (
                <div key={i} style={{ ...styles.activityItem, borderLeft: `3px solid ${n.color}` }}>
                  <div style={{ fontSize: "22px" }}>{n.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#e8f4ff", fontSize: "13px" }}>{n.text}</div>
                    <div style={{ color: "#4a6080", fontSize: "11px", marginTop: "3px" }}>🕐 {n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SETTINGS */}
          {activeNav === "settings" && (
            <div style={styles.panel}>
              <div style={styles.panelTitle}>⚙️ Account Settings</div>
              {message && (
                <div style={{
                  padding: "10px 14px", borderRadius: "8px", fontSize: "13px",
                  color: message.includes("✅") ? "#00ff88" : "#ff4455",
                  background: message.includes("✅") ? "rgba(0,255,136,0.08)" : "rgba(255,68,85,0.08)",
                  border: `1px solid ${message.includes("✅") ? "rgba(0,255,136,0.3)" : "rgba(255,68,85,0.3)"}`,
                }}>{message}</div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "20px", padding: "16px", background: "#101828", borderRadius: "12px", border: "1px solid #1a2540" }}>
                <div style={{ width: "72px", height: "72px", borderRadius: "12px", background: "linear-gradient(135deg,#0066ff,#00f5ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: 900, color: "#000", overflow: "hidden", flexShrink: 0 }}>
                  {avatarSrc ? <img src={avatarSrc} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#e8f4ff", fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>{user?.name}</div>
                  <div style={{ color: "#4a6080", fontSize: "12px", marginBottom: "10px" }}>{user?.email}</div>
                  <button
                    style={{ padding: "7px 16px", background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.2)", color: "#00f5ff", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
                    onClick={() => document.getElementById("settingsPhotoInput").click()}>
                    {profileUploading ? "Uploading..." : "📸 Change Photo"}
                  </button>
                  <input id="settingsPhotoInput" type="file" accept="image/*" style={{ display: "none" }}
                    onChange={(e) => { if (e.target.files[0]) handleProfileUpload(e.target.files[0]); }} />
                </div>
              </div>
              {[{ label: "👤 Name", val: user?.name }, { label: "📧 Email", val: user?.email }, { label: "🎭 Role", val: "Citizen" }].map((s, i) => (
                <div key={i} style={styles.field}>
                  <label style={styles.flabel}>{s.label}</label>
                  <input style={{ ...styles.cinput, opacity: 0.6 }} value={s.val} readOnly />
                </div>
              ))}
              <button
                style={{ padding: "13px", width: "100%", background: "rgba(255,68,85,0.1)", color: "#ff4455", border: "1px solid rgba(255,68,85,0.3)", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
                onClick={() => { localStorage.clear(); window.location.href = "/"; }}>
                ⏻ Logout
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
  glowLine: { position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg,transparent,#00f5ff,transparent)" },
  logoWrap: { padding: "24px 20px 16px", borderBottom: "1px solid #1a2540" },
  logoText: { fontFamily: "'Courier New',monospace", fontWeight: 900, fontSize: "18px", letterSpacing: "0.05em" },
  logoTag: { fontSize: "11px", color: "#4a6080", marginTop: "4px" },
  userPill: { margin: "14px 12px", background: "rgba(0,245,255,0.04)", border: "1px solid #1e2d4a", borderRadius: "10px", padding: "10px 12px", display: "flex", alignItems: "center", gap: "10px" },
  avatar: { width: "34px", height: "34px", borderRadius: "8px", background: "linear-gradient(135deg,#0066ff,#00f5ff)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "14px", color: "#000", flexShrink: 0 },
  userName: { fontSize: "13px", fontWeight: 600, color: "#e8f4ff" },
  userRole: { fontSize: "11px", color: "#00f5ff", marginTop: "2px" },
  navSection: { padding: "8px 12px", flex: 1 },
  navLabel: { fontSize: "11px", color: "#4a6080", padding: "10px 8px 8px", fontWeight: 600 },
  navItem: { display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", cursor: "pointer", color: "#4a6080", fontSize: "13px", fontWeight: 500, marginBottom: "2px", border: "1px solid transparent" },
  navItemActive: { color: "#00f5ff", background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.15)" },
  navBadge: { marginLeft: "auto", background: "#ff4455", color: "white", fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "10px" },
  sidebarFooter: { padding: "16px 12px", borderTop: "1px solid #1a2540" },
  logoutBtn: { display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", cursor: "pointer", color: "#ff4455", fontSize: "13px", fontWeight: 600, border: "1px solid rgba(255,68,85,0.2)" },
  main: { flex: 1, overflow: "auto", minWidth: 0 },
  header: { padding: "24px 32px 20px", borderBottom: "1px solid #1a2540", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "28px" },
headerTitle: { fontSize: "22px", fontWeight: 900, margin: 0, color: "#FFFFFF" },
  headerSub: { color: "#8ab4d4", fontSize: "13px", marginTop: "4px" },
  headerActions: { display: "flex", gap: "10px" },
  ghostBtn: { padding: "8px 18px", background: "transparent", border: "1px solid #1e2d4a", color: "#7a9ab8", borderRadius: "8px", cursor: "pointer", fontSize: "13px" },
  primaryBtn: { padding: "8px 18px", background: "linear-gradient(135deg,#0066ff,#00f5ff)", border: "none", color: "#000", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 700 },
  body: { padding: "0 32px 32px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "24px" },
  statCard: { background: "#0c1120", border: "1px solid #1a2540", borderRadius: "12px", padding: "18px" },
  statNum: { fontFamily: "'Courier New',monospace", fontSize: "34px", fontWeight: 900, lineHeight: 1 },
  statLbl: { color: "#4a6080", fontSize: "11px", marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.05em" },
  panel: { background: "#0c1120", border: "1px solid #1a2540", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" },
  panelTitle: { fontSize: "15px", fontWeight: 700, color: "#e8f4ff", paddingBottom: "12px", borderBottom: "1px solid #1a2540" },
  activityItem: { display: "flex", gap: "12px", alignItems: "center", padding: "12px", background: "#101828", borderRadius: "8px", border: "1px solid #1a2540" },
  actIcon: { width: "36px", height: "36px", background: "rgba(0,245,255,0.07)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 },
  badge: { padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  field: { display: "flex", flexDirection: "column", gap: "7px" },
  flabel: { fontSize: "13px", color: "#7a9ab8", fontWeight: 600 },
  cinput: { padding: "11px 14px", background: "rgba(0,245,255,0.03)", border: "1px solid #1e2d4a", borderRadius: "8px", color: "#e8f4ff", fontSize: "13px", outline: "none", fontFamily: "sans-serif" },
  catGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
  catBtn: { padding: "10px", borderRadius: "8px", border: "1px solid #1e2d4a", background: "transparent", color: "#4a6080", fontSize: "12px", cursor: "pointer", fontFamily: "sans-serif", fontWeight: 500 },
  catBtnActive: { border: "1px solid #00f5ff", color: "#00f5ff", background: "rgba(0,245,255,0.07)" },
  uploadBox: { border: "1px dashed #1e2d4a", borderRadius: "8px", padding: "20px", textAlign: "center", cursor: "pointer", background: "rgba(0,245,255,0.02)" },
  submitBtn: { padding: "13px", background: "linear-gradient(135deg,#0066ff,#00f5ff)", border: "none", borderRadius: "8px", color: "#000", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,245,255,0.25)" },
  fbtn: { padding: "6px 14px", borderRadius: "20px", border: "1px solid #1e2d4a", background: "transparent", color: "#4a6080", fontSize: "12px", cursor: "pointer", fontWeight: 600 },
  fbtnActive: { border: "1px solid #00f5ff", color: "#00f5ff", background: "rgba(0,245,255,0.07)" },
  issueCard: { border: "1px solid #1a2540", borderRadius: "10px", padding: "14px", background: "#101828" },
  issueIcon: { width: "42px", height: "42px", borderRadius: "8px", background: "rgba(0,245,255,0.07)", border: "1px solid rgba(0,245,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 },
  upvoteBtn: { padding: "4px 12px", background: "rgba(0,245,255,0.07)", border: "1px solid rgba(0,245,255,0.2)", color: "#00f5ff", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: 600 },
  deleteBtn: { padding: "4px 12px", background: "rgba(255,68,85,0.07)", border: "1px solid rgba(255,68,85,0.2)", color: "#ff4455", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: 600 },
  mapStat: { background: "#101828", border: "1px solid #1a2540", borderRadius: "8px", padding: "14px", textAlign: "center" },
  aiBox: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.2)", borderRadius: "10px" },
};

export default CitizenDashboard;
