import { useState } from "react";
import "./WorkOrders.css";

const INITIAL_ORDERS = {
  pending: [
    { id: "WO-10234", priority: "high",   type: "emergency",  title: "Reparación urgente: Falla en sistema hidráulico", asset: "Robot Soldador 01",        date: "Vence ayer",    overdue: true,  assignee: "CR" },
    { id: "WO-10235", priority: "medium", type: "corrective", title: "Cambio de rodamientos motor principal",           asset: "Prensa Hidráulica P-05",    date: "Mar 18, 2026",  overdue: false, assignee: "MG" },
    { id: "WO-10236", priority: "low",    type: "preventive", title: "Lubricación semanal - Línea de ensamble",         asset: "Cinta Transportadora CT-02", date: "Mar 20, 2026",  overdue: false, assignee: "JP" },
  ],
  progress: [
    { id: "WO-10230", priority: "high",   type: "corrective", title: "Calibración de sensores de posición",   asset: "CNC Máquina 03",            date: "Hoy, 14:00",    overdue: false, assignee: "CR" },
    { id: "WO-10231", priority: "medium", type: "preventive", title: "Inspección mensual de seguridad",       asset: "Planta Ensamble Medellín",   date: "Mar 19, 2026",  overdue: false, assignee: "AL" },
  ],
  completed: [
    { id: "WO-10225", priority: "medium", type: "preventive", title: "Cambio de filtros de aire",             asset: "Sistema HVAC Principal",     date: "Completado hoy", overdue: false, assignee: "JP" },
    { id: "WO-10224", priority: "low",    type: "corrective", title: "Ajuste de banda transportadora",        asset: "Línea Soldadura L-01",       date: "Ayer",           overdue: false, assignee: "CR" },
  ],
  cancelled: [
    { id: "WO-10215", priority: "low",    type: "preventive", title: "Mantenimiento postergado por cierre",   asset: "Almacén Principal",          date: "Cancelado",      overdue: false, assignee: "--" },
  ],
};

const TYPE_LABEL = { emergency: "Emergencia", corrective: "Correctivo", preventive: "Preventivo" };
const COL_CONFIG = {
  pending:   { label: "Pendientes",  icon: "schedule",     cls: "col-pending"   },
  progress:  { label: "En Progreso", icon: "engineering",  cls: "col-progress"  },
  completed: { label: "Completadas", icon: "check_circle", cls: "col-completed" },
  cancelled: { label: "Canceladas",  icon: "cancel",       cls: "col-cancelled" },
};

function WOCard({ order, onDragStart, onDragEnd }) {
  return (
    <div
      className={`wo-card priority-${order.priority}`}
      draggable
      onDragStart={(e) => onDragStart(e, order.id)}
      onDragEnd={onDragEnd}
    >
      <div className={`wo-prio-bar prio-${order.priority}`} />
      <div className="wo-card-head">
        <span className="wo-id">{order.id}</span>
        <span className={`wo-type type-${order.type}`}>{TYPE_LABEL[order.type]}</span>
      </div>
      <p className="wo-title">{order.title}</p>
      <div className="wo-asset">
        <span className="material-icons-outlined" style={{ fontSize: 13 }}>precision_manufacturing</span>
        {order.asset}
      </div>
      <div className="wo-footer">
        <div className={`wo-date${order.overdue ? " overdue" : ""}`}>
          <span className="material-icons-outlined" style={{ fontSize: 12 }}>event</span>
          {order.date}
        </div>
        <div className="wo-avatar">{order.assignee}</div>
      </div>
    </div>
  );
}

export default function WorkOrders() {
  const [view, setView]           = useState("kanban");
  const [orders, setOrders]       = useState(INITIAL_ORDERS);
  const [modalOpen, setModalOpen] = useState(false);

  const handleDragStart = (e, id) => e.dataTransfer.setData("text/plain", id);
  const handleDragEnd   = () => {};
  const handleDragOver  = (e) => e.preventDefault();

  const handleDrop = (e, target) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    let moved = null, source = null;
    Object.keys(orders).forEach((col) => {
      const found = orders[col].find((o) => o.id === id);
      if (found) { moved = { ...found }; source = col; }
    });
    if (moved && source !== target) {
      setOrders((p) => ({
        ...p,
        [source]: p[source].filter((o) => o.id !== id),
        [target]: [...p[target], moved],
      }));
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    alert("Work Order creada exitosamente");
  };

  const allOrders = Object.values(orders).flat();

  return (
    <div className="wo-page">

      {/* Page header */}
      <div className="wo-page-header">
        <div>
          <h1 className="wo-page-title">Work Orders</h1>
          <p className="wo-page-sub">Gestiona y da seguimiento a las órdenes de trabajo</p>
        </div>
        <button className="wo-btn-primary" onClick={() => setModalOpen(true)}>
          <span className="material-icons-outlined" style={{ fontSize: 18 }}>add</span>
          Nueva Work Order
        </button>
      </div>

      {/* KPIs */}
      <div className="wo-stats">
        {[
          { label: "Pendientes",  val: orders.pending.length,   color: "#f5a623", icon: "schedule",     trend: "+2 esta semana" },
          { label: "En Progreso", val: orders.progress.length,  color: "#3b82f6", icon: "engineering",  trend: "↑ 85% eficiencia" },
          { label: "Completadas", val: orders.completed.length, color: "#22c55e", icon: "check_circle", trend: "+12 este mes" },
          { label: "Vencidas",    val: 3,                        color: "#ef4444", icon: "warning",      trend: "Requiere atención" },
        ].map((s) => (
          <div className="wo-stat-card" key={s.label}>
            <div className="wo-stat-head">
              <span className="wo-stat-label">{s.label}</span>
              <span className="material-icons-outlined wo-stat-icon" style={{ color: s.color }}>{s.icon}</span>
            </div>
            <span className="wo-stat-val" style={{ color: s.color }}>{s.val}</span>
            <span className="wo-stat-trend">{s.trend}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="wo-filters">
        <div className="wo-search">
          <span className="material-icons-outlined" style={{ fontSize: 16, color: "#4a5568" }}>search</span>
          <input className="wo-search-input" placeholder="Buscar WO por ID, título o activo..." />
        </div>
        <button className="wo-filter-btn">
          <span className="material-icons-outlined" style={{ fontSize: 16 }}>filter_list</span>
          Todos los tipos
        </button>
        <button className="wo-filter-btn">
          <span className="material-icons-outlined" style={{ fontSize: 16 }}>priority_high</span>
          Prioridad
        </button>
        <div className="wo-view-toggle">
          <button className={`wo-view-btn${view === "kanban" ? " active" : ""}`} onClick={() => setView("kanban")}>
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>view_column</span>
            Kanban
          </button>
          <button className={`wo-view-btn${view === "list" ? " active" : ""}`} onClick={() => setView("list")}>
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>view_list</span>
            Lista
          </button>
        </div>
      </div>

      {/* Kanban */}
      {view === "kanban" && (
        <div className="wo-kanban">
          {Object.keys(COL_CONFIG).map((col) => {
            const cfg = COL_CONFIG[col];
            return (
              <div
                key={col}
                className={`wo-column ${cfg.cls}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col)}
              >
                <div className="wo-col-header">
                  <div className="wo-col-title">
                    <span className="material-icons-outlined" style={{ fontSize: 18 }}>{cfg.icon}</span>
                    {cfg.label}
                  </div>
                  <span className="wo-col-count">{orders[col].length}</span>
                </div>
                <div className="wo-col-items">
                  {orders[col].map((o) => (
                    <WOCard key={o.id} order={o} onDragStart={handleDragStart} onDragEnd={handleDragEnd} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="wo-list">
          <div className="wo-list-head">
            <span>ID</span>
            <span>Título</span>
            <span>Activo</span>
            <span>Tipo</span>
            <span>Fecha</span>
            <span>Estado</span>
          </div>
          {allOrders.map((o) => {
            const col = Object.keys(orders).find((c) => orders[c].some((x) => x.id === o.id));
            return (
              <div key={o.id} className="wo-list-row">
                <span className="wo-list-id">{o.id}</span>
                <span className="wo-list-title">{o.title}</span>
                <span className="wo-list-asset">{o.asset}</span>
                <span className={`wo-type type-${o.type}`}>{TYPE_LABEL[o.type]}</span>
                <span className={`wo-list-date${o.overdue ? " overdue" : ""}`}>{o.date}</span>
                <span className={`wo-status-badge status-${col}`}>
                  {COL_CONFIG[col].label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="wo-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="wo-modal">
            <div className="wo-modal-header">
              <h2 className="wo-modal-title">Nueva Work Order</h2>
              <button className="wo-modal-close" onClick={() => setModalOpen(false)}>
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <div className="wo-modal-body">
              <div className="wo-form-grid">
                <div className="wo-form-group">
                  <label className="wo-form-label">Tipo</label>
                  <select className="wo-form-select">
                    <option>Preventivo</option>
                    <option>Correctivo</option>
                    <option>Emergencia</option>
                  </select>
                </div>
                <div className="wo-form-group">
                  <label className="wo-form-label">Prioridad</label>
                  <select className="wo-form-select">
                    <option>Baja</option>
                    <option selected>Media</option>
                    <option>Alta</option>
                  </select>
                </div>
                <div className="wo-form-group wo-full">
                  <label className="wo-form-label">Título</label>
                  <input className="wo-form-input" placeholder="Descripción breve del trabajo..." />
                </div>
                <div className="wo-form-group">
                  <label className="wo-form-label">Activo / Equipo</label>
                  <select className="wo-form-select">
                    <option>Seleccionar activo...</option>
                    <option>Robot Soldador 01</option>
                    <option>Prensa Hidráulica P-05</option>
                    <option>CNC Máquina 03</option>
                  </select>
                </div>
                <div className="wo-form-group">
                  <label className="wo-form-label">Asignado a</label>
                  <select className="wo-form-select">
                    <option>Seleccionar técnico...</option>
                    <option>Carlos R. — Técnico Senior</option>
                    <option>María G. — Lead Maintenance</option>
                    <option>Juan P. — Técnico</option>
                  </select>
                </div>
                <div className="wo-form-group">
                  <label className="wo-form-label">Fecha programada</label>
                  <input type="datetime-local" className="wo-form-input" />
                </div>
                <div className="wo-form-group">
                  <label className="wo-form-label">Duración estimada (hrs)</label>
                  <input type="number" className="wo-form-input" placeholder="2.5" step="0.5" />
                </div>
                <div className="wo-form-group wo-full">
                  <label className="wo-form-label">Descripción detallada</label>
                  <textarea className="wo-form-textarea" placeholder="Instrucciones detalladas del trabajo..."></textarea>
                </div>
                <div className="wo-form-group wo-full">
                  <label className="wo-form-label">Materiales / Herramientas</label>
                  <textarea className="wo-form-textarea" placeholder="Lista de materiales necesarios..."></textarea>
                </div>
              </div>
            </div>
            <div className="wo-modal-footer">
              <button className="wo-btn-cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="wo-btn-primary" onClick={handleSave}>
                <span className="material-icons-outlined" style={{ fontSize: 16 }}>save</span>
                Crear Work Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
