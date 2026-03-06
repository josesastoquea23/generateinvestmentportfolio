import { useState, useEffect, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

const RISK_PROFILES = [
  { id: "conservative", label: "Conservador", color: "#10b981", icon: "🛡️", desc: "Preservación de capital, baja volatilidad" },
  { id: "moderate",     label: "Moderado",    color: "#f59e0b", icon: "⚖️", desc: "Balance entre crecimiento y estabilidad" },
  { id: "aggressive",   label: "Agresivo",    color: "#ef4444", icon: "🚀", desc: "Máximo crecimiento, alta tolerancia al riesgo" },
];

const INDICATOR_MAP = {
  RSI:     { name: "RSI",             desc: "Relative Strength Index" },
  MACD:    { name: "MACD",            desc: "Moving Average Convergence/Divergence" },
  BB:      { name: "Bandas Bollinger",desc: "Volatilidad y rangos de precio" },
  SMA50:   { name: "SMA 50",          desc: "Media Móvil Simple 50 días" },
  SMA200:  { name: "SMA 200",         desc: "Media Móvil Simple 200 días" },
  VOL:     { name: "Volumen",         desc: "Confirmación de tendencia por volumen" },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function extractJSON(text) {
  // 1. Strip markdown fences
  let clean = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  // 2. Try direct parse
  try { return JSON.parse(clean); } catch {}
  // 3. Extract largest {...} block
  const first = clean.indexOf("{");
  const last  = clean.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    try { return JSON.parse(clean.slice(first, last + 1)); } catch {}
  }
  // 4. Attempt to repair truncated JSON by closing open structures
  try {
    let partial = clean.slice(first);
    // Count open brackets to close them
    let opens = 0, openArr = 0;
    for (const ch of partial) {
      if (ch === "{") opens++;
      else if (ch === "}") opens--;
      else if (ch === "[") openArr++;
      else if (ch === "]") openArr--;
    }
    // Remove trailing comma if any
    partial = partial.replace(/,\s*$/, "");
    partial += "]".repeat(Math.max(0, openArr)) + "}".repeat(Math.max(0, opens));
    return JSON.parse(partial);
  } catch {}
  return null;
}

async function callClaude(systemPrompt, userPrompt) {
  const res = await fetch("https://cors-anywhere.herokuapp.com/https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "API error");
  const text = (data.content || []).map(b => b.text || "").join("\n");
  const parsed = extractJSON(text);
  if (!parsed) throw new Error("No se pudo parsear la respuesta JSON");
  return parsed;
}

function TrafficLight({ signal }) {
  const map = {
    COMPRA:   { color: "#10b981", label: "COMPRA",  dot: "#34d399" },
    NEUTRAL:  { color: "#f59e0b", label: "NEUTRAL", dot: "#fcd34d" },
    VENTA:    { color: "#ef4444", label: "VENTA",   dot: "#f87171" },
  };
  const s = map[signal] || map["NEUTRAL"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.color + "22", border: `1px solid ${s.color}55`,
      borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700,
      color: s.color, letterSpacing: 1,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

function ScoreBar({ value, max = 100, color = "#6366f1" }) {
  return (
    <div style={{ background: "#1e293b", borderRadius: 4, height: 6, overflow: "hidden", width: "100%" }}>
      <div style={{
        width: `${Math.min(100, (value / max) * 100)}%`,
        height: "100%", background: color,
        borderRadius: 4, transition: "width 1s ease",
      }} />
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 40 }}>
      <div style={{
        width: 48, height: 48, border: "3px solid #1e293b",
        borderTop: "3px solid #6366f1", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <span style={{ color: "#94a3b8", fontSize: 13, letterSpacing: 1 }}>Analizando con IA...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function PortfolioAnalyzer() {
  const [inputText, setInputText]       = useState("");
  const [assets, setAssets]             = useState([]);
  const [riskProfile, setRiskProfile]   = useState("moderate");
  const [analysis, setAnalysis]         = useState(null);
  const [loading, setLoading]           = useState(false);
  const [activeTab, setActiveTab]       = useState("overview");
  const [error, setError]               = useState("");
  const [step, setStep]                 = useState("input"); // input | result

  const [loadingMsg, setLoadingMsg] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const msgs = [
      "Analizando fundamentales...",
      "Evaluando flujo de caja y ratios...",
      "Calculando correlaciones y volatilidad...",
      "Procesando análisis técnico...",
      "Optimizando portafolios...",
      "Generando tesis de inversión...",
    ];
    let i = 0;
    const t = setInterval(() => { i = (i + 1) % msgs.length; setLoadingMsg(i); }, 2200);
    return () => clearInterval(t);
  }, [loading]);

  const LOADING_MSGS = [
    "Analizando fundamentales...",
    "Evaluando flujo de caja y ratios...",
    "Calculando correlaciones y volatilidad...",
    "Procesando análisis técnico...",
    "Optimizando portafolios...",
    "Generando tesis de inversión...",
  ];

  const parseAssets = () => {
    // Allow 1-5 letters, optionally followed by . or / and 1 letter (e.g. BRK.B)
    const tickers = inputText.toUpperCase()
      .split(/[\s,;]+/)
      .map(t => t.trim())
      .filter(t => /^[A-Z]{1,5}([./][A-Z])?$/.test(t));
    if (tickers.length < 2) { setError("Ingresa al menos 2 activos válidos (ej: AAPL, MSFT, TSLA)"); return; }
    if (tickers.length > 8) { setError("Máximo 8 activos por análisis"); return; }
    setError("");
    setAssets(tickers);
  };

  const [retryCount, setRetryCount] = useState(0);

  const runAnalysis = useCallback(async (attempt = 0) => {
    if (assets.length === 0) return;
    setLoading(true);
    setError("");
    setStep("result");
    setActiveTab("overview");

    const SYSTEM = `Eres un experto en finanzas institucionales. 
REGLA ABSOLUTA: Tu respuesta debe ser ÚNICAMENTE un objeto JSON válido y completo.
NO incluyas ningún texto antes ni después del JSON.
NO uses bloques de código markdown ni backticks.
NO uses comentarios dentro del JSON.
Todos los valores de string con señales técnicas deben ser exactamente "COMPRA", "NEUTRAL" o "VENTA".
Todos los valores de tendencia deben ser exactamente "ALCISTA", "BAJISTA" o "LATERAL".
Usa terminología financiera profesional en español para los textos descriptivos.`;

    const USER = `Activos a analizar: ${assets.join(", ")}
Perfil de riesgo: ${riskProfile}

Responde con un JSON que siga EXACTAMENTE esta estructura. Incluye UN objeto por activo en el array "assets". Las allocations de cada portafolio deben incluir TODOS los tickers y sumar 1.0.

{
  "summary": "string",
  "assets": [
    {
      "ticker": "AAPL",
      "name": "Apple Inc.",
      "sector": "Tecnología",
      "price_approx": 185.5,
      "management": "string 2-3 oraciones sobre CEO y directiva",
      "cashflow": "string 2-3 oraciones sobre FCL",
      "pe_ratio": 28.5,
      "ebitda_margin": 0.33,
      "revenue_growth_yoy": 0.08,
      "debt_to_equity": 1.5,
      "fundamental_score": 82,
      "fundamental_comment": "string 2 oraciones",
      "macro_risks": ["riesgo 1", "riesgo 2"],
      "sector_risks": ["riesgo 1", "riesgo 2"],
      "historical_return_3y": 0.20,
      "historical_return_5y": 0.22,
      "expected_return": 0.14,
      "volatility_annual": 0.25,
      "sharpe_ratio": 0.78,
      "beta": 1.18,
      "technical": {
        "trend": "ALCISTA",
        "pattern": "string descripción del patrón",
        "rsi_signal": "NEUTRAL",
        "macd_signal": "COMPRA",
        "bb_signal": "NEUTRAL",
        "sma50_signal": "COMPRA",
        "sma200_signal": "COMPRA",
        "volume_signal": "NEUTRAL",
        "overall_signal": "COMPRA",
        "technical_comment": "string 2-3 oraciones"
      }
    }
  ],
  "correlations": {
    "description": "string 2 oraciones",
    "matrix_note": "string 1 oración"
  },
  "portfolios": {
    "conservative": {
      "allocations": ${JSON.stringify(Object.fromEntries(assets.map((t,i) => [t, parseFloat((1/assets.length).toFixed(2))])))} ,
      "expected_return": 0.08,
      "volatility": 0.09,
      "sharpe": 0.70,
      "rationale": "string 3-4 oraciones"
    },
    "moderate": {
      "allocations": ${JSON.stringify(Object.fromEntries(assets.map((t,i) => [t, parseFloat((1/assets.length).toFixed(2))])))} ,
      "expected_return": 0.13,
      "volatility": 0.15,
      "sharpe": 0.85,
      "rationale": "string 3-4 oraciones"
    },
    "aggressive": {
      "allocations": ${JSON.stringify(Object.fromEntries(assets.map((t,i) => [t, parseFloat((1/assets.length).toFixed(2))])))} ,
      "expected_return": 0.19,
      "volatility": 0.25,
      "sharpe": 0.78,
      "rationale": "string 3-4 oraciones"
    }
  },
  "recommended_profile": "${riskProfile}",
  "investment_thesis": "string 4-5 oraciones"
}

Reemplaza los valores de ejemplo con datos reales/estimados para los activos: ${assets.join(", ")}.
Los tickers en allocations deben ser exactamente: ${assets.join(", ")}.`;

    try {
      const result = await callClaude(SYSTEM, USER);
      // Validate minimum structure
      if (!result.assets || !Array.isArray(result.assets) || result.assets.length === 0) {
        throw new Error("Respuesta incompleta del modelo");
      }
      setAnalysis(result);
    } catch (e) {
      if (attempt < 1) {
        // Auto-retry once
        setLoading(false);
        setTimeout(() => runAnalysis(attempt + 1), 1000);
        return;
      }
      setError(`Error: ${e.message}. Verifica los tickers e intenta de nuevo.`);
      setStep("input");
    } finally {
      setLoading(false);
    }
  }, [assets, riskProfile]);

  useEffect(() => {
    if (assets.length > 0) runAnalysis();
  }, [assets]);

  const activePortfolio = analysis?.portfolios?.[riskProfile];

  // ── STYLES ──
  const S = {
    app: {
      minHeight: "100vh", background: "#030712", color: "#e2e8f0",
      fontFamily: "'IBM Plex Mono', 'Fira Code', monospace",
      padding: "0 0 60px 0",
    },
    header: {
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      borderBottom: "1px solid #1e293b",
      padding: "28px 40px 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    logo: { fontSize: 20, fontWeight: 700, color: "#e2e8f0", letterSpacing: 2 },
    logoAccent: { color: "#6366f1" },
    badge: {
      background: "#6366f133", border: "1px solid #6366f166",
      borderRadius: 4, padding: "4px 10px", fontSize: 10,
      color: "#818cf8", letterSpacing: 2, fontWeight: 600,
    },
    container: { maxWidth: 1300, margin: "0 auto", padding: "32px 24px" },
    card: {
      background: "#0f172a", border: "1px solid #1e293b",
      borderRadius: 12, padding: 24, marginBottom: 20,
    },
    cardTitle: {
      fontSize: 11, fontWeight: 700, color: "#6366f1",
      letterSpacing: 3, textTransform: "uppercase", marginBottom: 16,
      display: "flex", alignItems: "center", gap: 8,
    },
    input: {
      width: "100%", background: "#1e293b", border: "1px solid #334155",
      borderRadius: 8, padding: "14px 18px", color: "#e2e8f0",
      fontSize: 15, outline: "none", boxSizing: "border-box",
      fontFamily: "inherit", letterSpacing: 2,
    },
    btn: (active, color = "#6366f1") => ({
      background: active ? color : "transparent",
      border: `1px solid ${active ? color : "#334155"}`,
      borderRadius: 8, padding: "10px 20px", color: active ? "#fff" : "#94a3b8",
      cursor: "pointer", fontSize: 12, fontWeight: 600,
      letterSpacing: 1, transition: "all 0.2s",
    }),
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
    grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
    metric: { textAlign: "center", padding: "12px 0" },
    metricVal: { fontSize: 28, fontWeight: 700, color: "#6366f1" },
    metricLabel: { fontSize: 10, color: "#64748b", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 },
    tabBar: {
      display: "flex", gap: 4, marginBottom: 24,
      background: "#0f172a", border: "1px solid #1e293b",
      borderRadius: 10, padding: 4, width: "fit-content",
    },
    tab: (active) => ({
      padding: "8px 18px", borderRadius: 7, fontSize: 11, fontWeight: 600,
      letterSpacing: 1, cursor: "pointer", border: "none",
      background: active ? "#6366f1" : "transparent",
      color: active ? "#fff" : "#64748b", transition: "all 0.2s",
    }),
    tag: (color) => ({
      background: color + "15", border: `1px solid ${color}40`,
      borderRadius: 4, padding: "3px 8px", fontSize: 10,
      color: color, display: "inline-block", margin: "2px",
    }),
    alloc: { display: "flex", alignItems: "center", gap: 12, marginBottom: 10 },
    allocTicker: { width: 60, fontSize: 12, fontWeight: 700, color: "#e2e8f0" },
    allocPct: { width: 45, fontSize: 12, color: "#94a3b8", textAlign: "right" },
    divider: { borderColor: "#1e293b", borderStyle: "solid", borderWidth: "0 0 1px 0", margin: "16px 0" },
  };

  // ──────────────────────────────── RENDER: INPUT ──────────────────────────────
  if (step === "input") return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input:focus { border-color: #6366f1 !important; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>
      <div style={S.header}>
        <div>
          <div style={S.logo}>PORTFOLIO<span style={S.logoAccent}>·</span>LAB</div>
          <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginTop: 4 }}>INTELLIGENT ASSET ALLOCATION ENGINE</div>
        </div>
        <div style={S.badge}>AI-POWERED · INSTITUTIONAL GRADE</div>
      </div>

      <div style={{ ...S.container, maxWidth: 720 }}>
        <div style={{ textAlign: "center", padding: "48px 0 40px" }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.2, marginBottom: 12 }}>
            Construye tu portafolio<br /><span style={{ color: "#6366f1" }}>como un experto</span>
          </div>
          <div style={{ color: "#64748b", fontSize: 13, letterSpacing: 1, lineHeight: 1.8 }}>
            Análisis fundamental · Análisis técnico · Asset allocation · Sharpe ratio · Semáforo de señales
          </div>
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>01 · Ingresa tus activos</div>
          <input
            style={S.input}
            placeholder="AAPL, MSFT, GOOGL, AMZN, TSLA ..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && parseAssets()}
          />
          <div style={{ fontSize: 10, color: "#475569", marginTop: 8, letterSpacing: 1 }}>
            Separa con comas o espacios · 2-8 activos · Tickers del mercado americano
          </div>
          {error && <div style={{ color: "#ef4444", fontSize: 11, marginTop: 10 }}>{error}</div>}
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>02 · Perfil de riesgo</div>
          <div style={{ display: "flex", gap: 12 }}>
            {RISK_PROFILES.map(p => (
              <button key={p.id} onClick={() => setRiskProfile(p.id)}
                style={{
                  flex: 1, border: `2px solid ${riskProfile === p.id ? p.color : "#1e293b"}`,
                  borderRadius: 10, padding: "16px 12px", cursor: "pointer",
                  background: riskProfile === p.id ? p.color + "18" : "#030712",
                  textAlign: "center", transition: "all 0.2s",
                }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{p.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: riskProfile === p.id ? p.color : "#94a3b8", letterSpacing: 1 }}>{p.label}</div>
                <div style={{ fontSize: 10, color: "#475569", marginTop: 4 }}>{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={parseAssets} style={{
          width: "100%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          border: "none", borderRadius: 10, padding: "16px", color: "#fff",
          fontSize: 13, fontWeight: 700, letterSpacing: 2, cursor: "pointer",
          boxShadow: "0 0 40px #6366f130",
        }}>
          ANALIZAR PORTAFOLIO →
        </button>

        <div style={{ display: "flex", gap: 16, marginTop: 24, flexWrap: "wrap", justifyContent: "center" }}>
          {["Análisis Fundamental", "Análisis Técnico", "Semáforo de Señales", "Asset Allocation", "Sharpe Ratio", "Gestión de Riesgos"].map(f => (
            <div key={f} style={S.tag("#6366f1")}>{f}</div>
          ))}
        </div>
      </div>
    </div>
  );

  // ──────────────────────────────── RENDER: LOADING ────────────────────────────
  if (loading) return (
    <div style={{ ...S.app, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap'); @keyframes spin { to { transform: rotate(360deg); } } @keyframes fade { 0%,100%{opacity:.3} 50%{opacity:1} }`}</style>
      <div style={{ fontSize: 14, color: "#6366f1", letterSpacing: 3, marginBottom: 32 }}>PORTFOLIO·LAB</div>
      <div style={{ width: 52, height: 52, border: "3px solid #1e293b", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 28 }} />
      <div style={{ color: "#94a3b8", fontSize: 13, letterSpacing: 1, marginBottom: 24, minHeight: 20, animation: "fade 2.2s ease infinite" }}>
        {LOADING_MSGS[loadingMsg]}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 500 }}>
        {assets.map(t => <div key={t} style={S.tag("#6366f1")}>{t}</div>)}
      </div>
    </div>
  );

  // ──────────────────────────────── RENDER: RESULTS ────────────────────────────
  if (!analysis) return null;

  const PORT_COLORS = { conservative: "#10b981", moderate: "#f59e0b", aggressive: "#ef4444" };
  const pColor = PORT_COLORS[riskProfile];

  const TABS = ["overview", "fundamental", "technical", "allocation", "risks", "thesis"];
  const TAB_LABELS = { overview: "Visión General", fundamental: "Fundamental", technical: "Técnico", allocation: "Portafolios", risks: "Riesgos", thesis: "Tesis" };

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>

      {/* HEADER */}
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button onClick={() => { setStep("input"); setAnalysis(null); setAssets([]); setInputText(""); }}
            style={{ background: "none", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8", padding: "5px 12px", cursor: "pointer", fontSize: 11 }}>
            ← Nuevo
          </button>
          <div>
            <div style={S.logo}>PORTFOLIO<span style={S.logoAccent}>·</span>LAB</div>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginTop: 2 }}>
              {assets.join(" · ")} &nbsp;|&nbsp; {RISK_PROFILES.find(r => r.id === riskProfile)?.label}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {RISK_PROFILES.map(p => (
            <button key={p.id} onClick={() => setRiskProfile(p.id)} style={S.btn(riskProfile === p.id, p.color)}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={S.container}>
        {/* SUMMARY BANNER */}
        <div style={{ ...S.card, background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)", borderColor: "#6366f140" }}>
          <div style={{ fontSize: 11, color: "#818cf8", letterSpacing: 3, marginBottom: 10 }}>RESUMEN EJECUTIVO</div>
          <p style={{ color: "#cbd5e1", lineHeight: 1.8, fontSize: 13, margin: 0 }}>{analysis.summary}</p>
        </div>

        {/* KPI ROW */}
        {activePortfolio && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
            {[
              { v: `${(activePortfolio.expected_return * 100).toFixed(1)}%`, l: "Retorno Esperado" },
              { v: `${(activePortfolio.volatility * 100).toFixed(1)}%`,      l: "Volatilidad Anual" },
              { v: activePortfolio.sharpe?.toFixed(2),                        l: "Sharpe Ratio" },
              { v: assets.length,                                              l: "Activos Analizados" },
            ].map(({ v, l }) => (
              <div key={l} style={{ ...S.card, textAlign: "center", padding: "20px 12px", marginBottom: 0 }}>
                <div style={{ ...S.metricVal, color: pColor }}>{v}</div>
                <div style={S.metricLabel}>{l}</div>
              </div>
            ))}
          </div>
        )}

        {/* TABS */}
        <div style={S.tabBar}>
          {TABS.map(t => (
            <button key={t} style={S.tab(activeTab === t)} onClick={() => setActiveTab(t)}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* ─── TAB: OVERVIEW ─── */}
        {activeTab === "overview" && (
          <div>
            <div style={S.grid2}>
              {analysis.assets?.map(a => (
                <div key={a.ticker} style={S.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>{a.ticker}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{a.name}</div>
                      <div style={S.tag("#6366f1")}>{a.sector}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <TrafficLight signal={a.technical?.overall_signal} />
                      <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>Señal técnica</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
                    {[
                      { v: `${(a.expected_return * 100).toFixed(1)}%`, l: "Ret. Esperado" },
                      { v: `${(a.volatility_annual * 100).toFixed(1)}%`, l: "Volatilidad" },
                      { v: a.sharpe_ratio?.toFixed(2), l: "Sharpe" },
                    ].map(({ v, l }) => (
                      <div key={l} style={{ textAlign: "center", padding: "8px 0", background: "#030712", borderRadius: 6 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: pColor }}>{v}</div>
                        <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={S.divider} />
                  <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>SCORE FUNDAMENTAL</div>
                  <ScoreBar value={a.fundamental_score} color={pColor} />
                  <div style={{ textAlign: "right", fontSize: 11, color: pColor, marginTop: 4 }}>{a.fundamental_score}/100</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB: FUNDAMENTAL ─── */}
        {activeTab === "fundamental" && (
          <div>
            {analysis.assets?.map(a => (
              <div key={a.ticker} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>{a.ticker}</span>
                    <span style={{ fontSize: 12, color: "#64748b", marginLeft: 10 }}>{a.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ ...S.tag(pColor), fontWeight: 700 }}>Score: {a.fundamental_score}/100</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 16 }}>
                  {[
                    { v: a.pe_ratio?.toFixed(1) + "x", l: "P/E Ratio" },
                    { v: `${(a.ebitda_margin * 100).toFixed(1)}%`, l: "Margen EBITDA" },
                    { v: `${(a.revenue_growth_yoy * 100).toFixed(1)}%`, l: "Crecimiento YoY" },
                    { v: a.debt_to_equity?.toFixed(2) + "x", l: "Deuda/Equity" },
                    { v: a.beta?.toFixed(2), l: "Beta" },
                  ].map(({ v, l }) => (
                    <div key={l} style={{ background: "#030712", borderRadius: 8, padding: "12px 8px", textAlign: "center" }}>
                      <div style={{ fontSize: 17, fontWeight: 700, color: "#e2e8f0" }}>{v}</div>
                      <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1, marginTop: 3 }}>{l}</div>
                    </div>
                  ))}
                </div>

                <div style={S.grid2}>
                  <div>
                    <div style={{ fontSize: 10, color: "#6366f1", letterSpacing: 2, marginBottom: 6 }}>DIRECCIÓN / MANAGEMENT</div>
                    <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.7, margin: 0 }}>{a.management}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#6366f1", letterSpacing: 2, marginBottom: 6 }}>FLUJO DE CAJA LIBRE</div>
                    <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.7, margin: 0 }}>{a.cashflow}</p>
                  </div>
                </div>

                <div style={S.divider} />
                <div style={{ fontSize: 10, color: "#6366f1", letterSpacing: 2, marginBottom: 8 }}>RENTABILIDADES HISTÓRICAS</div>
                <div style={{ display: "flex", gap: 12 }}>
                  {[
                    { v: `${(a.historical_return_3y * 100).toFixed(1)}%`, l: "Retorno 3 Años (anual.)" },
                    { v: `${(a.historical_return_5y * 100).toFixed(1)}%`, l: "Retorno 5 Años (anual.)" },
                    { v: `${(a.expected_return * 100).toFixed(1)}%`, l: "Retorno Esperado" },
                    { v: `${(a.volatility_annual * 100).toFixed(1)}%`, l: "Volatilidad (σ anual)" },
                  ].map(({ v, l }) => (
                    <div key={l} style={{ background: "#030712", borderRadius: 8, padding: "10px 14px", flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: pColor }}>{v}</div>
                      <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1, marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: "#94a3b8", lineHeight: 1.7 }}>{a.fundamental_comment}</div>
              </div>
            ))}
          </div>
        )}

        {/* ─── TAB: TECHNICAL ─── */}
        {activeTab === "technical" && (
          <div>
            {analysis.assets?.map(a => (
              <div key={a.ticker} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>{a.ticker}</span>
                    <span style={{ fontSize: 12, color: "#64748b", marginLeft: 10 }}>{a.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: "#64748b" }}>Tendencia:</span>
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      color: a.technical?.trend === "ALCISTA" ? "#10b981" : a.technical?.trend === "BAJISTA" ? "#ef4444" : "#f59e0b",
                    }}>{a.technical?.trend}</span>
                  </div>
                </div>

                {/* SEMÁFORO */}
                <div style={{ fontSize: 10, color: "#6366f1", letterSpacing: 2, marginBottom: 12 }}>SEMÁFORO DE INDICADORES</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
                  {[
                    { key: "rsi_signal",    label: "RSI" },
                    { key: "macd_signal",   label: "MACD" },
                    { key: "bb_signal",     label: "Bandas Bollinger" },
                    { key: "sma50_signal",  label: "SMA 50" },
                    { key: "sma200_signal", label: "SMA 200" },
                    { key: "volume_signal", label: "Volumen" },
                  ].map(({ key, label }) => (
                    <div key={key} style={{ background: "#030712", borderRadius: 8, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>
                      <TrafficLight signal={a.technical?.[key]} />
                    </div>
                  ))}
                </div>

                <div style={{ background: "#030712", borderRadius: 8, padding: 14, marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: "#f59e0b", letterSpacing: 2, marginBottom: 6 }}>PATRÓN TÉCNICO IDENTIFICADO</div>
                  <p style={{ color: "#cbd5e1", fontSize: 12, lineHeight: 1.7, margin: 0 }}>{a.technical?.pattern}</p>
                </div>

                <div style={{ background: "#030712", borderRadius: 8, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: "#6366f1", letterSpacing: 2 }}>SEÑAL GENERAL</span>
                    <TrafficLight signal={a.technical?.overall_signal} />
                  </div>
                  <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.7, margin: 0 }}>{a.technical?.technical_comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── TAB: ALLOCATION ─── */}
        {activeTab === "allocation" && (
          <div>
            <div style={S.grid3}>
              {RISK_PROFILES.map(profile => {
                const port = analysis.portfolios?.[profile.id];
                const isActive = riskProfile === profile.id;
                if (!port) return null;
                return (
                  <div key={profile.id} style={{
                    ...S.card, marginBottom: 0,
                    border: `2px solid ${isActive ? profile.color : "#1e293b"}`,
                    background: isActive ? profile.color + "08" : "#0f172a",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? profile.color : "#94a3b8" }}>
                        {profile.icon} {profile.label}
                      </div>
                      {isActive && <div style={S.tag(profile.color)}>SELECCIONADO</div>}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                      {[
                        { v: `${(port.expected_return * 100).toFixed(1)}%`, l: "Retorno" },
                        { v: `${(port.volatility * 100).toFixed(1)}%`,      l: "Riesgo" },
                        { v: port.sharpe?.toFixed(2),                       l: "Sharpe" },
                      ].map(({ v, l }) => (
                        <div key={l} style={{ background: "#030712", borderRadius: 6, padding: "10px 6px", textAlign: "center" }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: profile.color }}>{v}</div>
                          <div style={{ fontSize: 9, color: "#475569" }}>{l}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 2, marginBottom: 10 }}>ALLOCACIÓN</div>
                    {Object.entries(port.allocations || {}).map(([ticker, pct]) => (
                      <div key={ticker} style={S.alloc}>
                        <div style={S.allocTicker}>{ticker}</div>
                        <div style={{ flex: 1 }}><ScoreBar value={pct * 100} color={profile.color} /></div>
                        <div style={S.allocPct}>{(pct * 100).toFixed(0)}%</div>
                      </div>
                    ))}

                    <div style={S.divider} />
                    <p style={{ color: "#94a3b8", fontSize: 11, lineHeight: 1.7, margin: 0 }}>{port.rationale}</p>

                    {!isActive && (
                      <button onClick={() => setRiskProfile(profile.id)} style={{
                        marginTop: 12, width: "100%", background: "transparent",
                        border: `1px solid ${profile.color}44`, borderRadius: 6,
                        color: profile.color, padding: "8px", cursor: "pointer",
                        fontSize: 11, fontWeight: 600, letterSpacing: 1,
                      }}>
                        Ver este portafolio
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {analysis.correlations && (
              <div style={{ ...S.card, marginTop: 20 }}>
                <div style={S.cardTitle}>Análisis de Correlaciones y Diversificación</div>
                <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.8, margin: "0 0 8px 0" }}>{analysis.correlations.description}</p>
                <p style={{ color: "#64748b", fontSize: 12, lineHeight: 1.7, margin: 0 }}>{analysis.correlations.matrix_note}</p>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: RISKS ─── */}
        {activeTab === "risks" && (
          <div>
            {analysis.assets?.map(a => (
              <div key={a.ticker} style={S.card}>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>{a.ticker}</span>
                  <span style={{ fontSize: 11, color: "#64748b", marginLeft: 10 }}>{a.name}</span>
                </div>
                <div style={S.grid2}>
                  <div>
                    <div style={{ fontSize: 10, color: "#ef4444", letterSpacing: 2, marginBottom: 10 }}>⚠ RIESGOS MACROECONÓMICOS</div>
                    {(a.macro_risks || []).map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                        <span style={{ color: "#ef4444", fontSize: 12, marginTop: 1 }}>▸</span>
                        <span style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6 }}>{r}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#f59e0b", letterSpacing: 2, marginBottom: 10 }}>⚠ RIESGOS SECTORIALES</div>
                    {(a.sector_risks || []).map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                        <span style={{ color: "#f59e0b", fontSize: 12, marginTop: 1 }}>▸</span>
                        <span style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6 }}>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                  <div style={{ background: "#030712", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1 }}>BETA (sensibilidad al mercado)</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: a.beta > 1.2 ? "#ef4444" : a.beta > 0.8 ? "#f59e0b" : "#10b981" }}>{a.beta?.toFixed(2)}</div>
                  </div>
                  <div style={{ background: "#030712", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1 }}>DEUDA / PATRIMONIO</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: a.debt_to_equity > 2 ? "#ef4444" : a.debt_to_equity > 1 ? "#f59e0b" : "#10b981" }}>{a.debt_to_equity?.toFixed(2)}x</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── TAB: THESIS ─── */}
        {activeTab === "thesis" && (
          <div>
            <div style={{ ...S.card, borderColor: pColor + "40", background: `linear-gradient(135deg, ${pColor}08 0%, #0f172a 100%)` }}>
              <div style={{ fontSize: 10, color: pColor, letterSpacing: 3, marginBottom: 16 }}>
                TESIS DE INVERSIÓN · PORTAFOLIO {RISK_PROFILES.find(r => r.id === riskProfile)?.label.toUpperCase()}
              </div>
              <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.9, margin: 0 }}>{analysis.investment_thesis}</p>
            </div>

            {activePortfolio && (
              <div style={S.card}>
                <div style={S.cardTitle}>Sustento Cuantitativo del Portafolio</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  {[
                    { v: `${(activePortfolio.expected_return * 100).toFixed(1)}%`, l: "Retorno Anual Esperado", c: pColor },
                    { v: `${(activePortfolio.volatility * 100).toFixed(1)}%`,       l: "Volatilidad Anualizada", c: "#94a3b8" },
                    { v: activePortfolio.sharpe?.toFixed(3),                         l: "Ratio de Sharpe", c: pColor },
                  ].map(({ v, l, c }) => (
                    <div key={l} style={{ background: "#030712", borderRadius: 10, padding: "20px", textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 700, color: c }}>{v}</div>
                      <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginTop: 6 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={S.divider} />
                <div style={{ fontSize: 10, color: "#6366f1", letterSpacing: 2, marginBottom: 12 }}>DISTRIBUCIÓN ÓPTIMA DEL CAPITAL</div>
                {Object.entries(activePortfolio.allocations || {}).map(([ticker, pct]) => {
                  const asset = analysis.assets?.find(a => a.ticker === ticker);
                  return (
                    <div key={ticker} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                      <div style={{ width: 55, fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{ticker}</div>
                      <div style={{ flex: 1 }}><ScoreBar value={pct * 100} color={pColor} /></div>
                      <div style={{ width: 40, textAlign: "right", fontSize: 13, fontWeight: 700, color: pColor }}>{(pct * 100).toFixed(0)}%</div>
                      {asset && <div style={{ fontSize: 10, color: "#475569", width: 120 }}>Sharpe: {asset.sharpe_ratio?.toFixed(2)} · β: {asset.beta?.toFixed(2)}</div>}
                    </div>
                  );
                })}
                <div style={{ ...S.divider }} />
                <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.8, margin: 0 }}>{activePortfolio.rationale}</p>
              </div>
            )}
          </div>
        )}

        {/* DISCLAIMER */}
        <div style={{ fontSize: 10, color: "#334155", textAlign: "center", marginTop: 32, lineHeight: 1.7 }}>
          ⚠ Este análisis es generado por IA con fines informativos y educativos. No constituye asesoramiento financiero. 
          Los datos son estimaciones basadas en información histórica. Siempre consulta a un asesor financiero certificado antes de invertir.
        </div>
      </div>
    </div>
  );
}
