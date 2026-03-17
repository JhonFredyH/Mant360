import { useState, useRef, useEffect, useCallback } from "react";
import "./Plants.css";

const TYPE_CONFIG = {
  planta:        { next: "area",          size: 20, weight: 700 },
  area:          { next: "linea",         size: 18, weight: 600 },
  linea:         { next: "sistema",       size: 17, weight: 600 },
  sistema:       { next: "equipo",        size: 16, weight: 500 },
  equipo:        { next: "componente",    size: 15, weight: 500 },
  componente:    { next: "subcomponente", size: 14, weight: 400 },
  subcomponente: { next: null,            size: 13, weight: 400 },
};

const PREFIX = {
  planta: "PLT", area: "ARE", linea: "LIN",
  sistema: "SIS", equipo: "EQP", componente: "CMP", subcomponente: "SUB",
};

const INDENT = 22;

const genId = (type) =>
  `${PREFIX[type]}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

function InlineInput({ type, initialValue = "", onConfirm, onCancel }) {
  const [val, setVal] = useState(initialValue);
  const ref = useRef();
  const cfg = TYPE_CONFIG[type];

  useEffect(() => { ref.current?.focus(); }, []);

  const confirm = () => { if (val.trim()) onConfirm(val.trim()); };

  return (
    <div className="inline-form" onClick={(e) => e.stopPropagation()}>
      <input
        ref={ref}
        className="ghost-input"
        style={{ fontSize: cfg.size, fontWeight: cfg.weight }}
        placeholder={`Nombre del ${type}...`}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") confirm();
          if (e.key === "Escape") onCancel();
        }}
      />
      <button className="btn-ok"     onClick={confirm}>✓</button>
      <button className="btn-cancel" onClick={onCancel}>✕</button>
    </div>
  );
}

function ConfirmModal({ node, onConfirm, onCancel }) {
  const hasChildren = node.children?.length > 0;
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <p className="modal-title">Eliminar {node.type}</p>
        <p className="modal-body">
          ¿Eliminar <strong>{node.label}</strong>
          {hasChildren ? ` y sus ${countDescendants(node)} elemento(s) anidados` : ""}?
          Esta acción no se puede deshacer.
        </p>
        <div className="modal-actions">
          <button className="btn-modal-cancel"  onClick={onCancel}>Cancelar</button>
          <button className="btn-modal-confirm" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

function countDescendants(node) {
  if (!node.children?.length) return 0;
  return node.children.reduce((acc, c) => acc + 1 + countDescendants(c), 0);
}

function HighlightText({ text, query }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="search-mark">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function TreeNode({
  node, depth, onAdd, onUpdate, onRemove, onSelect, selectedId, searchQuery,
}) {
  const [open, setOpen]                   = useState(true);
  const [adding, setAdding]               = useState(false);
  const [editing, setEditing]             = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [showTools, setShowTools]         = useState(false);
  const rowRef                            = useRef();

  const cfg         = TYPE_CONFIG[node.type];
  const hasChildren = node.children?.length > 0;
  const isSelected  = selectedId === node.id;

  useEffect(() => {
    if (!showTools) return;
    const handler = (e) => {
      if (!rowRef.current?.contains(e.target)) setShowTools(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showTools]);

  // Derivado: si hay búsqueda activa el nodo siempre se muestra expandido
  const isForceOpen = Boolean(searchQuery);
  const effectiveOpen = isForceOpen || open;

  const matchesSelf = searchQuery
    ? node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.id.toLowerCase().includes(searchQuery.toLowerCase())
    : true;

  const hasMatchingDescendant = (n) => {
    if (!searchQuery) return true;
    return n.children?.some(
      (c) =>
        c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hasMatchingDescendant(c),
    );
  };

  if (searchQuery && !matchesSelf && !hasMatchingDescendant(node)) return null;

  const handleConfirm = (label) => {
    onAdd(node.id, cfg.next, label);
    setAdding(false);
    setOpen(true);
  };

  // Clamp depth class at 6
  const depthClass = `depth-${Math.min(depth, 6)}`;

  return (
    <div className="tree-node">
      <div
        ref={rowRef}
        className={`tree-row ${depthClass}${isSelected ? " selected" : ""}`}
        style={{ paddingLeft: 14 + depth * INDENT }}
        onClick={(e) => {
          if (e.target.closest(".node-actions") || e.target.closest(".inline-form")) return;
          onSelect(node);
          if (hasChildren) setOpen((p) => !p);
          setShowTools(false);
        }}

      >
        <span className={`arrow ${hasChildren || adding ? (effectiveOpen ? "open" : "") : "invisible"}`}>
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5"
              fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        {editing ? (
          <InlineInput
            type={node.type}
            initialValue={node.label}
            onConfirm={(val) => { onUpdate(node.id, val); setEditing(false); }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <span
            className={`node-label color--${node.type}`}
            style={{ fontSize: cfg.size, fontWeight: cfg.weight }}
          >
            <HighlightText text={node.label} query={searchQuery} />
          </span>
        )}

        <span className="node-id-badge" title={node.id}>
          {node.id.split("-")[0]}
        </span>

        <span className="node-actions">
          {showTools && (
            <>
              <button
                className="icon-btn danger"
                title="Eliminar"
                onClick={(e) => {
                  e.stopPropagation();
                  setPendingDelete(true);
                  setShowTools(false);
                }}
              >
                <span className="material-icons-outlined btn-icon" style={{ color: "#ef4444" }}>delete</span>
              </button>
              <button
                className="icon-btn edit-btn"
                title="Editar nombre"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(true);
                  setShowTools(false);
                }}
              >
                <span className="material-icons-outlined btn-icon" style={{ color: "#f5a623" }}>edit</span>
              </button>
            </>
          )}

          {cfg.next && (
            <button
              className={`icon-btn add-btn${showTools ? " active" : ""}`}
              title={`Agregar ${cfg.next}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowTools(false);
                setAdding(true);
                setOpen(true);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setAdding(false);
                setShowTools((p) => !p);
              }}
            >
              <span className="material-icons-outlined btn-icon" style={{ color: "#22c55e" }}>add</span>
            </button>
          )}
        </span>
      </div>

      {pendingDelete && (
        <ConfirmModal
          node={node}
          onConfirm={() => { onRemove(node.id); setPendingDelete(false); }}
          onCancel={() => setPendingDelete(false)}
        />
      )}

      {adding && (
        <div style={{ paddingLeft: 14 + (depth + 1) * INDENT }}>
          <InlineInput
            type={cfg.next}
            onConfirm={handleConfirm}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {effectiveOpen && hasChildren && (
        <div className="tree-children">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onAdd={onAdd}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onSelect={onSelect}
              selectedId={selectedId}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}


/* Mock data helpers */
const MOCK_SUBCOMPONENTS = [
  { icon: "settings", name: "Sistema de lubricación",   model: "LUB-200-A" },
  { icon: "bolt",     name: "Motor principal",          model: "MTR-500-HP" },
  { icon: "thermostat", name: "Sistema de enfriamiento", model: "COOL-X90"  },
  { icon: "hub",      name: "Panel de control",         model: "PLC-S7-300" },
];

const MOCK_HISTORY = [
  { icon: "build",       title: "Cambio de rodamientos",      by: "Carlos R. (Técnico)",  date: "Feb 28, 2026", wo: "WO-10234" },
  { icon: "cleaning_services", title: "Limpieza general",     by: "PM Schedule",          date: "Ene 15, 2026", wo: "WO-10189" },
  { icon: "report_problem",    title: "Falla en sensor temp", by: "María G. (Lead)",      date: "Dic 03, 2025", wo: "WO-10041" },
];

const MOCK_DOCS = [
  { icon: "picture_as_pdf", name: "Manual_Servicio_V2.pdf" },
  { icon: "description",    name: "Ficha_Tecnica.docx"     },
  { icon: "schema",         name: "Diagrama_Electrico.dwg" },
];

/* QR simple SVG (patrón decorativo) */
function QRPlaceholder() {
  return (
    <div className="qr-box">
      <div className="qr-inner">
        <span className="material-icons-outlined qr-icon">qr_code_2</span>
      </div>
      <p className="qr-label">SCAN TO IDENTIFY ASSET</p>
    </div>
  );
}


const COMPONENT_ICON = {
  sensor:     "sensors",
  motor:      "bolt",
  brazo:      "precision_manufacturing",
  tarjeta:    "memory",
  boquilla:   "radio_button_checked",
  bomba:      "water",
  valvula:    "valve",
  filtro:     "filter_alt",
  compresor:  "compress",
  panel:      "dashboard",
  cable:      "cable",
  default:    "settings",
};

const getComponentIcon = (label = "") => {
  const l = label.toLowerCase();
  if (l.includes("sensor"))    return COMPONENT_ICON.sensor;
  if (l.includes("motor"))     return COMPONENT_ICON.motor;
  if (l.includes("brazo"))     return COMPONENT_ICON.brazo;
  if (l.includes("tarjeta"))   return COMPONENT_ICON.tarjeta;
  if (l.includes("boquilla"))  return COMPONENT_ICON.boquilla;
  if (l.includes("bomba"))     return COMPONENT_ICON.bomba;
  if (l.includes("valvula") || l.includes("válvula")) return COMPONENT_ICON.valvula;
  if (l.includes("filtro"))    return COMPONENT_ICON.filtro;
  if (l.includes("compresor")) return COMPONENT_ICON.compresor;
  if (l.includes("panel"))     return COMPONENT_ICON.panel;
  if (l.includes("cable"))     return COMPONENT_ICON.cable;
  return COMPONENT_ICON.default;
};

/* Asset Detail Panel */
function AssetDetail({ node }) {
  const [photoHover, setPhotoHover] = useState(false);
  const [photoSrc, setPhotoSrc]     = useState(null);
  const fileRef                     = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoSrc(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="ad-root">
      <div className="ad-two-col">

        {/* Izquierda: foto + subcomponentes + ver más */}
        <div className="ad-left">
          <div
            className={`ad-photo${photoHover ? " hovered" : ""}`}
            style={photoSrc ? { backgroundImage: `url(${photoSrc})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
            onMouseEnter={() => setPhotoHover(true)}
            onMouseLeave={() => setPhotoHover(false)}
            onClick={() => fileRef.current.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {!photoSrc && (
              <>
                <span className="material-icons-outlined ad-photo-icon">add_photo_alternate</span>
                <span className="ad-photo-label">{photoHover ? "Add photo" : "No image"}</span>
              </>
            )}
            {photoSrc && photoHover && (
              <div className="ad-photo-overlay">
                <span className="material-icons-outlined" style={{ fontSize: 28, color: "#fff" }}>edit</span>
                <span className="ad-photo-overlay-label">Change photo</span>
              </div>
            )}
          </div>
          <div className="ad-subcomp-section">
            <p className="ad-section-title">SUB-COMPONENTS</p>
            <div className="ad-subgrid">
              {node.children && node.children.length > 0 ? (
                node.children.map((child) => (
                  <div className="ad-subitem" key={child.id}>
                    <div className="ad-subitem-icon">
                      <span className="material-icons-outlined" style={{ fontSize: 18 }}>
                        {getComponentIcon(child.label)}
                      </span>
                    </div>
                    <div className="ad-subitem-info">
                      <span className="ad-subitem-name">{child.label}</span>
                      <span className="ad-subitem-model">{child.id}</span>
                    </div>
                    <span className="material-icons-outlined ad-subitem-arrow">chevron_right</span>
                  </div>
                ))
              ) : (
                <div className="ad-subitem-empty">
                  <span className="material-icons-outlined" style={{ fontSize: 20, color: "#2e3748" }}>inbox</span>
                  <span>Sin componentes registrados</span>
                </div>
              )}
            </div>
            <div className="ad-ver-mas-row">
              <button className="ad-ver-mas-btn">Ver más</button>
            </div>
          </div>
        </div>

        {/* Derecha: health + botones + QR */}
        <div className="ad-right">
          <div className="ad-asset-header">
            <div className="ad-asset-header-top">
              <span className={`ad-asset-header-type color--${node.type}`}>{node.type}</span>
              <span className="ad-status-badge ad-status--active">
                <span className="ad-status-dot" />Active
              </span>
            </div>
            <h2 className={`ad-asset-header-name color--${node.type}`}>{node.label}</h2>
            <span className="ad-asset-id">{node.id}</span>
          </div>
          <div className="ad-health-card">
            <div className="ad-health-head">
              <p className="ad-section-title">ASSET HEALTH</p>
              <span className="ad-health-badge">EXCELLENT</span>
            </div>
            <div className="ad-stat-row">
              <span className="ad-stat-label">MTBF Index</span>
              <span className="ad-stat-value">94%</span>
            </div>
            <div className="ad-progress-bar">
              <div className="ad-progress-fill" style={{ width: "94%" }} />
            </div>
            <div className="ad-metrics">
              <div className="ad-metric">
                <span className="ad-metric-label">Availability</span>
                <span className="ad-metric-value">99.2%</span>
              </div>
              <div className="ad-metric">
                <span className="ad-metric-label">Efficiency</span>
                <span className="ad-metric-value">87.5%</span>
              </div>
            </div>
          </div>

          <div className="ad-action-btns">
            <button className="ad-action-btn ad-action-btn--blue">
              <span className="material-icons-outlined" style={{ fontSize: 20 }}>add_circle_outline</span>
              <span>New Work Order</span>
            </button>
            <button className="ad-action-btn ad-action-btn--amber">
              <span className="material-icons-outlined" style={{ fontSize: 20 }}>history</span>
              <span>Maintenance History</span>
            </button>
            <button className="ad-action-btn ad-action-btn--teal">
              <span className="material-icons-outlined" style={{ fontSize: 20 }}>folder_open</span>
              <span>Documentation</span>
            </button>
          </div>

          <div className="ad-qr-box">
            <div className="ad-qr-inner">
              <span className="material-icons-outlined ad-qr-icon">qr_code_2</span>
            </div>
            <p className="ad-qr-label">SCAN TO IDENTIFY ASSET</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function Plants() {
  const [tree, setTree]               = useState([]);
  const [selectedId, setSelectedId]   = useState(null);
  const [addingRoot, setAddingRoot]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const findNode = (list, id) => {
    for (const n of list) {
      if (n.id === id) return n;
      const found = findNode(n.children, id);
      if (found) return found;
    }
    return null;
  };
  const activeNode = findNode(tree, selectedId);

  const addNode = useCallback((parentId, type, label) => {
    const node = { id: genId(type), type, label, children: [] };
    if (!parentId) { setTree((p) => [...p, node]); return; }
    const insert = (list) =>
      list.map((n) =>
        n.id === parentId
          ? { ...n, children: [...n.children, node] }
          : { ...n, children: insert(n.children) },
      );
    setTree((p) => insert(p));
  }, []);

  const updateNode = useCallback((id, label) => {
    const update = (list) =>
      list.map((n) =>
        n.id === id ? { ...n, label } : { ...n, children: update(n.children) },
      );
    setTree((p) => update(p));
  }, []);

  const removeNode = useCallback((id) => {
    const remove = (list) =>
      list.filter((n) => n.id !== id).map((n) => ({ ...n, children: remove(n.children) }));
    setTree((p) => remove(p));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  return (
    <div className="plants-container">
      <div className="plants-panel panel--left">
        <div className="panel-head">
          <span className="material-icons-outlined head-icon">account_tree</span>
          <div>
            <h3 className="head-title">Jerarquía de Activos</h3>
            <p className="head-sub">clic en + para agregar · doble clic en + para editar/eliminar</p>
          </div>
          <button
            className="btn-add-root"
            onClick={() => setAddingRoot(true)}
            disabled={addingRoot}
          >
            + Planta
          </button>
        </div>

        {tree.length > 0 && (
          <div className="search-bar">
            <svg className="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
              <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Buscar activo o ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery("")}>✕</button>
            )}
          </div>
        )}

        <div className="tree-scroll">
          {addingRoot && (
            <div style={{ paddingLeft: 14 }}>
              <InlineInput
                type="planta"
                onConfirm={(label) => { addNode(null, "planta", label); setAddingRoot(false); }}
                onCancel={() => setAddingRoot(false)}
              />
            </div>
          )}

          {tree.length === 0 && !addingRoot && (
            <div className="tree-empty">
              <span className="material-icons-outlined">park</span>
              <p>Clic en <strong>+ Planta</strong> para comenzar</p>
            </div>
          )}

          {tree.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              onAdd={addNode}
              onUpdate={updateNode}
              onRemove={removeNode}
              onSelect={(n) => setSelectedId(n.id)}
              selectedId={selectedId}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      </div>

      <div className="plants-panel panel--right">
        {activeNode && activeNode.type === "equipo" ? (
          <AssetDetail node={activeNode} />
        ) : (
          <div className="panel-empty">
            <span className="material-icons-outlined empty-icon">touch_app</span>
            <p>Selecciona un equipo</p>
          </div>
        )}
      </div>
    </div>
  );
}
