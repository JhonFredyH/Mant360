import { useState, useEffect, useRef } from "react";
import "./Login.css";

const MAX_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 30;

const fakeAuth = (email, password) =>
  email === "admin@metaltech.com" && password === "1234";

export default function Login() {
  const [showPassword, setShowPassword]   = useState(false);
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [error, setError]                 = useState("");
  const [attempts, setAttempts]           = useState(0);
  const [locked, setLocked]               = useState(false);
  const [countdown, setCountdown]         = useState(0);
  const [shaking, setShaking]             = useState(false);
  const [btnState, setBtnState]           = useState("idle");
  const [threatLevel, setThreatLevel]     = useState(0);
  const [glitch, setGlitch]               = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!locked) return;    
    let remaining = LOCKOUT_SECONDS;
    setCountdown(remaining);

    intervalRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        setLocked(false);
        setAttempts(0);
        setError("");
        setThreatLevel(0);
        setCountdown(0);
      } else {
        setCountdown(remaining);
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [locked]);

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  };

  const triggerGlitch = () => {
    setGlitch(true);
    setTimeout(() => setGlitch(false), 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (locked) return;
    setBtnState("loading");
    await new Promise(r => setTimeout(r, 900));
    const ok = fakeAuth(email, password);
    if (ok) {
      setBtnState("success");
      setError("");
      setThreatLevel(0);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setThreatLevel(newAttempts);
      setBtnState("error");
      triggerShake();
      triggerGlitch();
      setPassword("");
      if (newAttempts >= MAX_ATTEMPTS) {
        setLocked(true);
        setError("TERMINAL BLOQUEADO — Actividad sospechosa registrada.");
      } else {
        const remaining = MAX_ATTEMPTS - newAttempts;
        setError(
          remaining === 1
            ? "Credenciales inválidas — Último intento antes del bloqueo."
            : `Credenciales inválidas. ${remaining} intentos restantes.`
        );
      }
      setTimeout(() => setBtnState("idle"), 1200);
    }
  };

  const mins = String(Math.floor(countdown / 60)).padStart(2, "0");
  const secs = String(countdown % 60).padStart(2, "0");


  return (
    <>  

      <section className="login">
        <div className={`card${shaking?" shake":""}${threatLevel>0?` threat-${threatLevel}`:""}`}>

          <div className="header">
            <div className={`logo-wrap${glitch?" glitch":""}`}>
              <div className="logo">Metal <span>Tech</span></div>
              <div className="logo-ghost lg1">Metal Tech</div>
              <div className="logo-ghost lg2">Metal Tech</div>
            </div>
            <p className="subtitle">INDUSTRIAL MANUFACTURING PORTAL — SECURE ACCESS</p>
          </div>

          <div className="threat-wrap">
            <div className={`threat-label${threatLevel>0?" active":""}`}>
              <span>SECURITY THREAT LEVEL</span>
              <span>{["NORMAL","ELEVATED","HIGH","CRITICAL"][threatLevel]}</span>
            </div>
            <div className="threat-track">
              <div className="threat-fill" style={{width:`${(threatLevel/MAX_ATTEMPTS)*100}%`}} />
            </div>
          </div>

          <div className="panel">
            {error && !locked && (
              <div className="error-banner">
                <span className="error-icon material-icons-outlined">gpp_bad</span>
                <span className="error-text">{error}</span>
              </div>
            )}

            {locked && (
              <div className="locked-banner">
                <span className="locked-title">⛔ Terminal Bloqueado</span>
                <span className="locked-sub">
                  Se detectó actividad no autorizada.<br/>
                  Acceso restaurado en:
                </span>
                <span className="countdown">{mins}:{secs}</span>
                <span className="locked-note">Incidente registrado en el sistema de seguridad</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:"16px"}}>
              <div className="field">
                <label htmlFor="email">Work Email</label>
                <div className={`input-wrap${error?" has-error":""}`}>
                  <span className="i-left material-icons-outlined">mail_lock</span>
                  <input
                    id="email" type="email"
                    placeholder="name@metaltech.com"
                    value={email} onChange={e=>setEmail(e.target.value)}
                    required disabled={locked} autoComplete="email"
                  />
                </div>
              </div>

              <div className="field">
                <div className="field-header">
                  <label htmlFor="password">Password</label>
                  <a href="#" className="forgot">Forgot Access</a>
                </div>
                <div className={`input-wrap${error?" has-error":""}`}>
                  <span className="i-left material-icons-outlined">lock</span>
                  <input
                    id="password"
                    type={showPassword?"text":"password"}
                    placeholder="••••••••••"
                    value={password} onChange={e=>setPassword(e.target.value)}
                    required disabled={locked} autoComplete="current-password"
                  />
                  <span
                    className="i-right material-icons-outlined"
                    onClick={()=>setShowPassword(p=>!p)}
                  >
                    {showPassword?"visibility_off":"visibility"}
                  </span>
                </div>
              </div>

              <div className="check-row">
                <input type="checkbox" id="remember" disabled={locked} />
                <span>Keep me logged in on this terminal</span>
              </div>

              <div className="divider" />

              <button
                type="submit"
                className={`btn ${locked?"locked":btnState}`}
                disabled={locked||btnState==="loading"}
              >
                {locked
                  ? "⛔ ACCESO BLOQUEADO"
                  : btnState==="loading"
                    ? <><div className="spinner"/>VERIFICANDO...</>
                    : btnState==="error"
                      ? "✗ ACCESO DENEGADO"
                      : btnState==="success"
                        ? "✓ ACCESO AUTORIZADO"
                        : "AUTHORIZE ACCESS"
                }
              </button>
            </form>
          </div>

          <p className="footer-text">
            New to the facility? <a href="/register">Create an account</a>
          </p>
        </div>
      </section>
    </>
  );
}
