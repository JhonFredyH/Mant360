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

  useEffect(() => {
    if (searchQuery) setOpen(true);
  }, [searchQuery]);

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
        <span className={`arrow ${hasChildren || adding ? (open ? "open" : "") : "invisible"}`}>
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

      {open && hasChildren && (
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

export default function Plants() {
  const [tree, setTree]               = useState([]);
  const [selectedId, setSelectedId]   = useState(null);
  const [addingRoot, setAddingRoot]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
        <div className="panel-empty">
          <span className="material-icons-outlined empty-icon">touch_app</span>
          <p>Selecciona un activo</p>
        </div>
      </div>
    </div>
  );
}
