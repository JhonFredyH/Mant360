import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const NAV_ITEMS = [
  { id: "overview", icon: "dashboard", label: "Overview" },
  { id: "plants", icon: "factory", label: "Plants" },
  { id: "assets", icon: "precision_manufacturing", label: "Assets" },
  { id: "workorders", icon: "assignment", label: "Work Orders" },
  { id: "maintenance", icon: "build", label: "Maintenance" },
  { id: "reports", icon: "bar_chart", label: "Reports" },
  { id: "users", icon: "group", label: "Users" },
  { id: "settings", icon: "settings", label: "Settings" },
];

const KPI_DATA = [
  { label: "Total Assets", value: "0", unit: "", icon: "precision_manufacturing", trend: null, color: "orange" },
  { label: "Active Work Orders", value: "0", unit: "", icon: "assignment", trend: null, color: "blue" },
  { label: "Availability", value: "—", unit: "%", icon: "speed", trend: null, color: "green" },
  { label: "Critical Alerts", value: "0", unit: "", icon: "warning", trend: null, color: "red" },
];

const RECENT_ACTIVITY = [
  { type: "info", msg: "System initialized", time: "Just now", icon: "check_circle" },
  { type: "info", msg: "Database connected", time: "Just now", icon: "storage" },
  { type: "info", msg: "Awaiting first plant setup", time: "Just now", icon: "factory" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [time, setTime] = useState(new Date());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setUser({ first_name: "Admin", role: "admin" });
    setTimeout(() => setLoaded(true), 100);
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const handleLogout = () => {
    navigate("/login");
  };

  const formatTime = (d) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  const formatDate = (d) =>
    d.toLocaleDateString("en-US", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

  return (
    <div className={`dash-root${loaded ? " loaded" : ""}`}>
      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? " open" : " closed"}`}>
        <div className="sidebar-header">
          <div className="brand">
            <span className="brand-icon material-icons-outlined">hexagon</span>
            {sidebarOpen && <span className="brand-name">Metal<span>Tech</span></span>}
          </div>
          <button className="toggle-btn" onClick={() => setSidebarOpen((p) => !p)}>
            <span className="material-icons-outlined">{sidebarOpen ? "chevron_left" : "chevron_right"}</span>
          </button>
        </div>

        <div className="sidebar-section-label">{sidebarOpen && "MAIN MENU"}</div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item${activeNav === item.id ? " active" : ""}`}
              onClick={() => setActiveNav(item.id)}
              title={!sidebarOpen ? item.label : ""}
            >
              <span className="material-icons-outlined nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
              {activeNav === item.id && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="user-card">
              <div className="user-avatar">
                {user.first_name?.[0]?.toUpperCase() || "A"}
              </div>
              {sidebarOpen && (
                <div className="user-info">
                  <span className="user-name">{user.first_name}</span>
                  <span className="user-role">{user.role?.toUpperCase()}</span>
                </div>
              )}
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <span className="material-icons-outlined">logout</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dash-main">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">
              {NAV_ITEMS.find((n) => n.id === activeNav)?.label}
            </h1>
            <div className="breadcrumb">
              <span>MetalTech</span>
              <span className="material-icons-outlined">chevron_right</span>
              <span>{NAV_ITEMS.find((n) => n.id === activeNav)?.label}</span>
            </div>
          </div>
          <div className="topbar-right">
            <div className="clock-block">
              <span className="clock-time">{formatTime(time)}</span>
              <span className="clock-date">{formatDate(time)}</span>
            </div>
            <button className="icon-btn" title="Notifications">
              <span className="material-icons-outlined">notifications</span>
              <span className="notif-dot" />
            </button>
            <button className="icon-btn" title="Help">
              <span className="material-icons-outlined">help_outline</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="dash-content">
          {activeNav === "overview" && (
            <>
              {/* KPI Grid */}
              <section className="kpi-grid">
                {KPI_DATA.map((k, i) => (
                  <div className={`kpi-card kpi-${k.color}`} key={i} style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="kpi-top">
                      <span className="kpi-label">{k.label}</span>
                      <span className={`kpi-icon material-icons-outlined`}>{k.icon}</span>
                    </div>
                    <div className="kpi-value">
                      {k.value}<span className="kpi-unit">{k.unit}</span>
                    </div>
                    <div className="kpi-bar"><div className="kpi-bar-fill" /></div>
                  </div>
                ))}
              </section>

              {/* Middle row */}
              <section className="mid-grid">
                {/* Plant tree placeholder */}
                <div className="panel plant-panel">
                  <div className="panel-header">
                    <span className="panel-title">Plant Hierarchy</span>
                    <button className="panel-action">
                      <span className="material-icons-outlined">add</span>
                      Add Plant
                    </button>
                  </div>
                  <div className="empty-state">
                    <span className="material-icons-outlined empty-icon">account_tree</span>
                    <p>No plants configured yet.</p>
                    <p className="empty-sub">Start by adding your first production plant.</p>
                    <button className="cta-btn">
                      <span className="material-icons-outlined">add_circle</span>
                      Create First Plant
                    </button>
                  </div>
                </div>

                {/* Activity feed */}
                <div className="panel activity-panel">
                  <div className="panel-header">
                    <span className="panel-title">Recent Activity</span>
                    <span className="live-badge">LIVE</span>
                  </div>
                  <div className="activity-list">
                    {RECENT_ACTIVITY.map((a, i) => (
                      <div className="activity-item" key={i}>
                        <span className={`act-icon material-icons-outlined act-${a.type}`}>{a.icon}</span>
                        <div className="act-body">
                          <span className="act-msg">{a.msg}</span>
                          <span className="act-time">{a.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Status bar */}
              <section className="status-bar">
                <div className="status-item">
                  <span className="status-dot green" />
                  <span>Backend API</span>
                  <span className="status-val">Online</span>
                </div>
                <div className="status-item">
                  <span className="status-dot green" />
                  <span>Database</span>
                  <span className="status-val">Connected</span>
                </div>
                <div className="status-item">
                  <span className="status-dot orange" />
                  <span>Plants</span>
                  <span className="status-val">Not configured</span>
                </div>
                <div className="status-item">
                  <span className="status-dot orange" />
                  <span>Assets</span>
                  <span className="status-val">0 registered</span>
                </div>
              </section>
            </>
          )}

          {activeNav !== "overview" && (
            <div className="coming-soon">
              <span className="material-icons-outlined cs-icon">
                {NAV_ITEMS.find((n) => n.id === activeNav)?.icon}
              </span>
              <h2>{NAV_ITEMS.find((n) => n.id === activeNav)?.label}</h2>
              <p>This module is under development.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
