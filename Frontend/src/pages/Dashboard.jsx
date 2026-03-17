import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SIDEBAR_ITEMS } from "../data/dataItems";
import Plants from "./Plants";
import WorkOrders from "./WorkOrders";

import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [time, setTime] = useState(new Date());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const formatTime = (d) =>
    d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  const formatDate = (d) =>
    d
      .toLocaleDateString("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase();

  const renderContent = () => {
    switch (activeNav) {
      case "plants":
        return <Plants />;
      case "workorders":
        return <WorkOrders />;
      case "assets":
        return <Assets />;
      default:
        return (
          <div className="coming-soon">
            <span className="material-icons-outlined cs-icon">
              {SIDEBAR_ITEMS.find((n) => n.id === activeNav)?.icon}
            </span>
            <h2>{SIDEBAR_ITEMS.find((n) => n.id === activeNav)?.label}</h2>
            <p>Módulo en desarrollo.</p>
          </div>
        );
    }
  };

  return (
    <div className={`dash-root${loaded ? " loaded" : ""}`}>
      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? " open" : " closed"}`}>
        <div className="sidebar-header">
          <div className="brand">
            {sidebarOpen && (
              <span className="brand-name">
                Metal<span>Tech</span>
              </span>
            )}
          </div>
          <button
            className="toggle-btn"
            onClick={() => setSidebarOpen((p) => !p)}
          >
            <span className="material-icons-outlined">
              {sidebarOpen ? "chevron_left" : "chevron_right"}
            </span>
          </button>
        </div>

        {sidebarOpen && <div className="sidebar-section-label">MAIN MENU</div>}

        <nav className="sidebar-nav">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item${activeNav === item.id ? " active" : ""}`}
              onClick={() => setActiveNav(item.id)}
              title={!sidebarOpen ? item.label : ""}
            >
              <span className="material-icons-outlined nav-icon">
                {item.icon}
              </span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
              {activeNav === item.id && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="logout-btn"
            onClick={() => navigate("/login")}
            title="Logout"
          >
            <span className="material-icons-outlined">logout</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dash-main">
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">
              {SIDEBAR_ITEMS.find((n) => n.id === activeNav)?.label}
            </h1>
            <div className="breadcrumb">
              <span>MetalTech</span>
              <span className="material-icons-outlined">chevron_right</span>
              <span>{SIDEBAR_ITEMS.find((n) => n.id === activeNav)?.label}</span>
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

        <div className="dash-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
