import { useState, useEffect, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

const RISK_PROFILES = [
  { id: "conservative", label: "Conservador", color: "#10b981", icon: "🛡️", desc: "Preservación de capital, baja volatilidad" },
  { id: "moderate",     label: "Moderado",    color: "#f59e0b", icon: "⚖️", desc: "Balance entre crecimiento y estabilidad" },
  { id: "aggressive",   label: "Agresivo",    color: "#ef4444", icon: "🚀", desc: "Máximo crecimiento, alta tolerancia al riesgo" },
];

const LOADING_MSGS = [
  "Buscando datos de mercado en tiempo real...",
  "Verificando P/E ratio y EBITDA...",
  "Consultando Yahoo Finance y Macrotrends...",
  "Analizando flujo de caja y deuda...",
  "Procesando señales técnicas RSI/MACD...",
  "Calculando correlaciones y volatilidad...",
  "Optimizando portafolios (Markowitz)...",
  "Generando tesis de inversión...",
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function extractJSON(text) {
  let clean = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try { return JSON.parse(clean); } catch {}
  const first = clean.indexOf("{");
  const last  = clean.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    try { return JSON.parse(clean.slice(first, last + 1)); } catch {}
  }
  try {
    let partial = clean.slice(first);
    let opens = 0, openArr = 0;
    for (const ch of partial) {
      if (ch === "{") opens++;
      else if (ch === "}") opens--;
      else if (ch === "[") openArr++;
      else if (ch === "]") openArr--;
    }
    partial = partial.replace(/,\s*$/, "");
    partial += "]".repeat(Math.max(0, openArr)) + "}".repeat(Math.max(0, opens));
    return JSON.parse(partial);
  } catch {}
  return null;
}

// Claude with web_search tool — handles multi-turn tool_use loop
async function callClaudeWithSearch(systemPrompt, userPrompt) {
  const makeRequest = (messages) =>
    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 8000,
        system: systemPrompt,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages,
      }),
    }).then(r => r.json());

  let messages = [{ role: "user", content: userPrompt }];
  let data = await makeRequest(messages);
  if (data.error) throw new Error(data.error.message || "API error");

  // Loop until model stops using tools
  let iterations = 0;
  while (data.stop_reason === "tool_use" && iterations < 8) {
    iterations++;
    messages.push({ role: "assistant", content: data.content });
    const toolResults = data.content
      .filter(b => b.type === "tool_use")
      .map(b => ({ type: "tool_result", tool_use_id: b.id, content: b.input ? JSON.stringify(b.input) : "" }));
    messages.push({ role: "user", content: toolResults });
    data = await makeRequest(messages);
    if (data.error) throw new Error(data.error.message || "API error");
  }

  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
  const parsed = extractJSON(text);
  if (!parsed) throw new Error("No se pudo parsear la respuesta JSON");
  return parsed;
}

// Plain Claude call (no tools)
async function callClaude(systemPrompt, userPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  const text = (data.content || []).map(b => b.text || "").join("\n");
  const parsed = extractJSON(text);
  if (!parsed) throw new Error("No se pudo parsear la respuesta JSON");
  return parsed;
}

function fmt(n, d = 1) {
  if (n == null || isNaN(n)) return "—";
  return Number(n).toFixed(d);
}
function fmtPct(n) { return fmt(n * 100) + "%"; }
function fmtUSD(n) {
  if (!n) return "—";
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9)  return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6)  return "$" + (n / 1e6).toFixed(2) + "M";
  return "$" + Number(n).toLocaleString();
}

// ─── UI COMPONENTS ───────────────────────────────────────────────────────────
function TrafficLight({ signal }) {
  const map = {
    COMPRA:  { color: "#10b981", dot: "#34d399", label: "COMPRA"  },
    NEUTRAL: { color: "#f59e0b", dot: "#fcd34d", label: "NEUTRAL" },
    VENTA:   { color: "#ef4444", dot: "#f87171", label: "VENTA"   },
  };
  const s = map[signal] || map["NEUTRAL"];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:s.color+"22", border:`1px solid ${s.color}55`, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700, color:s.color, letterSpacing:1 }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:s.dot, display:"inline-block" }} />
      {s.label}
    </span>
  );
}

function Bar({ value, max = 100, color = "#6366f1" }) {
  return (
    <div style={{ background:"#1e293b", borderRadius:4, height:6, overflow:"hidden", width:"100%" }}>
      <div style={{ width:`${Math.min(100,(value/max)*100)}%`, height:"100%", background:color, borderRadius:4, transition:"width 1s ease" }} />
    </div>
  );
}

function Metric({ value, label, color = "#6366f1", sub }) {
  return (
    <div style={{ background:"#030712", borderRadius:8, padding:"12px 10px", textAlign:"center" }}>
      <div style={{ fontSize:16, fontWeight:700, color }}>{value}</div>
      <div style={{ fontSize:9, color:"#475569", letterSpacing:1, marginTop:3, textTransform:"uppercase" }}>{label}</div>
      {sub && <div style={{ fontSize:9, color:"#334155", marginTop:2 }}>{sub}</div>}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function PortfolioAnalyzer() {
  const [inputText, setInputText]     = useState("");
  const [assets, setAssets]           = useState([]);
  const [riskProfile, setRiskProfile] = useState("moderate");
  const [analysis, setAnalysis]       = useState(null);
  const [loading, setLoading]         = useState(false);
  const [activeTab, setActiveTab]     = useState("overview");
  const [error, setError]             = useState("");
  const [step, setStep]               = useState("input");
  const [loadingMsg, setLoadingMsg]   = useState(0);

  const [investAmount, setInvestAmount]     = useState("");
  const [investAnalysis, setInvestAnalysis] = useState(null);
  const [investLoading, setInvestLoading]   = useState(false);
  const [investError, setInvestError]       = useState("");

  useEffect(() => {
    if (!loading) return;
    let i = 0;
    const t = setInterval(() => { i = (i + 1) % LOADING_MSGS.length; setLoadingMsg(i); }, 2000);
    return () => clearInterval(t);
  }, [loading]);

  const parseAssets = () => {
    const raw = inputText.toUpperCase()
      .split(/[\s,;|]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const isValid = t => /^[A-Z]{1,5}([.\-][A-Z]{1,2})?$/.test(t);
    const valid   = raw.filter(isValid);
    const invalid = raw.filter(t => !isValid(t));

    if (valid.length < 2) {
      const hint = invalid.length > 0
        ? `Tickers no reconocidos: ${invalid.join(", ")}. Usa el símbolo exacto del mercado (ej: TTWO, AAPL, BRK.B)`
        : "Ingresa al menos 2 tickers válidos (ej: TTWO, AAPL, MSFT)";
      setError(hint);
      return;
    }
    if (valid.length > 8) {
      setError(`Máximo 8 activos. Tienes ${valid.length}: ${valid.join(", ")}`);
      return;
    }
    const unique = [...new Set(valid)];
    if (invalid.length > 0) setError(`⚠ Ignorados: ${invalid.join(", ")}`);
    else setError("");
    setAssets(unique);
  };

  // ── ANÁLISIS PRINCIPAL CON WEB SEARCH ────────────────────────────────────
  const runAnalysis = useCallback(async (attempt = 0) => {
    if (assets.length === 0) return;
    setLoading(true);
    setError("");
    setAnalysis(null);
    setInvestAnalysis(null);
    setStep("result");
    setActiveTab("overview");

    const allocDefault = Object.fromEntries(
      assets.map(t => [t, parseFloat((1 / assets.length).toFixed(4))])
    );

    const SYSTEM = `Eres un analista financiero institucional senior.
REGLA ABSOLUTA: Tu respuesta final debe ser ÚNICAMENTE un objeto JSON válido y completo. Sin texto antes ni después. Sin markdown. Sin backticks. Sin comentarios.
OBLIGATORIO: Usa la herramienta web_search para buscar datos reales y actualizados (2024-2025) de CADA activo antes de responder.
Para cada ticker busca: precio actual, P/E TTM, margen EBITDA, crecimiento ingresos YoY, deuda/equity, beta, retornos 3-5 años, análisis técnico reciente.
Fuentes aceptadas: Yahoo Finance, Macrotrends, MarketWatch, Reuters, Morningstar.
Las señales técnicas deben ser exactamente "COMPRA", "NEUTRAL" o "VENTA".
Las tendencias deben ser exactamente "ALCISTA", "BAJISTA" o "LATERAL".`;

    const USER = `Busca con web_search los datos financieros más recientes de estos activos: ${assets.join(", ")}
Perfil de riesgo del inversor: ${riskProfile}
Fecha: ${new Date().toLocaleDateString("es-ES")}

Instrucciones de búsqueda:
- Busca "${assets.join(" ")} fundamentals P/E EBITDA 2024 2025"
- Busca "${assets.join(" ")} stock analysis technical RSI MACD 2025"
- Busca cada ticker individualmente si es necesario para obtener datos precisos

Luego responde con este JSON exacto (sin variaciones en la estructura):

{
  "data_freshness": "string con fecha/fuente de los datos encontrados",
  "summary": "Resumen ejecutivo 3-4 oraciones con datos reales encontrados",
  "assets": [
    {
      "ticker": "TICKER",
      "name": "Nombre completo",
      "sector": "Sector",
      "price_approx": 0.0,
      "price_source": "Fuente y fecha del precio",
      "market_cap": 0,
      "management": "CEO actual, nombre y evaluación 2-3 oraciones",
      "cashflow": "FCL real con cifras aproximadas 2-3 oraciones",
      "pe_ratio": 0.0,
      "pe_source": "Fuente del P/E",
      "ebitda_margin": 0.0,
      "revenue_growth_yoy": 0.0,
      "debt_to_equity": 0.0,
      "fundamental_score": 0,
      "fundamental_comment": "Evaluación 2 oraciones con datos reales",
      "macro_risks": ["riesgo 1", "riesgo 2", "riesgo 3"],
      "sector_risks": ["riesgo 1", "riesgo 2"],
      "historical_return_3y": 0.0,
      "historical_return_5y": 0.0,
      "expected_return": 0.0,
      "volatility_annual": 0.0,
      "sharpe_ratio": 0.0,
      "beta": 0.0,
      "technical": {
        "trend": "ALCISTA",
        "pattern": "Descripción del patrón técnico identificado",
        "rsi_value": 0.0,
        "rsi_signal": "NEUTRAL",
        "macd_signal": "COMPRA",
        "bb_signal": "NEUTRAL",
        "sma50_signal": "COMPRA",
        "sma200_signal": "COMPRA",
        "volume_signal": "NEUTRAL",
        "overall_signal": "COMPRA",
        "technical_comment": "Análisis técnico 2-3 oraciones"
      }
    }
  ],
  "correlations": {
    "description": "Correlaciones entre los activos 2 oraciones",
    "matrix_note": "Nota sobre diversificación",
    "diversification_score": 70
  },
  "portfolios": {
    "conservative": {
      "allocations": ${JSON.stringify(allocDefault)},
      "expected_return": 0.08,
      "volatility": 0.09,
      "sharpe": 0.72,
      "rationale": "Justificación 3-4 oraciones basada en los datos reales"
    },
    "moderate": {
      "allocations": ${JSON.stringify(allocDefault)},
      "expected_return": 0.13,
      "volatility": 0.15,
      "sharpe": 0.87,
      "rationale": "Justificación 3-4 oraciones"
    },
    "aggressive": {
      "allocations": ${JSON.stringify(allocDefault)},
      "expected_return": 0.20,
      "volatility": 0.26,
      "sharpe": 0.80,
      "rationale": "Justificación 3-4 oraciones"
    }
  },
  "recommended_profile": "${riskProfile}",
  "investment_thesis": "Tesis de inversión 4-5 oraciones con datos reales encontrados"
}

Los tickers en allocations deben ser exactamente: ${assets.join(", ")} y sumar 1.0.`;

    try {
      const result = await callClaudeWithSearch(SYSTEM, USER);
      if (!result.assets || !Array.isArray(result.assets) || result.assets.length === 0) {
        throw new Error("Respuesta incompleta del modelo");
      }
      setAnalysis(result);
    } catch (e) {
      if (attempt < 1) {
        setLoading(false);
        setTimeout(() => runAnalysis(attempt + 1), 1200);
        return;
      }
      setError(`Error: ${e.message}. Verifica los tickers e intenta de nuevo.`);
      setStep("input");
    } finally {
      setLoading(false);
    }
  }, [assets, riskProfile]);

  useEffect(() => { if (assets.length > 0) runAnalysis(); }, [assets]);

  // ── ANÁLISIS DE MONTO DE INVERSIÓN ────────────────────────────────────────
  const runInvestAnalysis = useCallback(async () => {
    const amount = parseFloat(investAmount.replace(/[^0-9.]/g, ""));
    if (!amount || amount <= 0) { setInvestError("Ingresa un monto válido"); return; }
    if (!analysis) { setInvestError("Primero genera el análisis principal"); return; }

    setInvestLoading(true);
    setInvestError("");
    setInvestAnalysis(null);

    const activePort = analysis.portfolios?.[riskProfile];
    const needsDiversification = amount >= 50000 && assets.length <= 4;
    const needsConcentration = amount < 10000 || (amount < 30000 && assets.length >= 5);

    const SYSTEM = `Eres un gestor de portafolios institucional con maestría en CFA.
REGLA ABSOLUTA: Responde ÚNICAMENTE con JSON válido. Sin texto extra. Sin markdown. Sin backticks.
Aplica rigurosamente: Teoría Moderna de Portafolios de Markowitz, modelo CAPM, y optimización del ratio Sharpe.`;

    const USER = `El inversor dispone de: $${amount.toLocaleString()} USD
Activos en portafolio: ${assets.join(", ")}
Perfil de riesgo: ${riskProfile}
Allocación actual del portafolio ${riskProfile}: ${JSON.stringify(activePort?.allocations)}

Datos fundamentales de los activos:
${analysis.assets.map(a => `- ${a.ticker}: precio ~$${a.price_approx}, beta ${a.beta}, sharpe ${a.sharpe_ratio}, vol ${fmtPct(a.volatility_annual)}, retorno esperado ${fmtPct(a.expected_return)}`).join("\n")}

Contexto:
- Monto promedio por activo si distribución igual: $${(amount / assets.length).toFixed(0)}
- ¿Necesita más diversificación (monto alto, pocos activos)? ${needsDiversification ? "SÍ" : "NO"}
- ¿Debe concentrar (monto bajo o demasiados activos)? ${needsConcentration ? "SÍ" : "NO"}

Genera este JSON:

{
  "amount": ${amount},
  "strategy": "CONCENTRAR|MANTENER|DIVERSIFICAR",
  "strategy_reason": "Explicación 2-3 oraciones de por qué aplicar esta estrategia con este monto específico",
  "portfolio_type": "Nombre descriptivo del portafolio recomendado",
  "allocations_final": {
    ${assets.map(t => {
      const pct = activePort?.allocations?.[t] || (1 / assets.length);
      const usd = (amount * pct).toFixed(2);
      const asset = analysis.assets?.find(a => a.ticker === t);
      const shares = asset?.price_approx ? (amount * pct / asset.price_approx).toFixed(2) : 0;
      return `"${t}": { "pct": ${pct.toFixed(4)}, "usd": ${usd}, "shares_approx": ${shares}, "rationale": "justificación del peso asignado" }`;
    }).join(",\n    ")}
  },
  "new_assets_suggested": ${needsDiversification ? `[
    {
      "ticker": "TICKER_SUGERIDO",
      "name": "Nombre del activo",
      "reason": "Por qué añadir este activo para reducir riesgo y mejorar diversificación",
      "allocation_suggested_pct": 0.15,
      "allocation_suggested_usd": ${(amount * 0.15).toFixed(2)},
      "correlation_benefit": "Cómo reduce la correlación y mejora el portafolio"
    }
  ]` : "[]"},
  "markowitz_insight": "Análisis 3-4 oraciones: frontera eficiente, varianza del portafolio, covarianzas y optimización del ratio Sharpe para este monto específico",
  "capm_insight": "Análisis CAPM 2-3 oraciones: retorno esperado vs beta ponderado del portafolio, prima de riesgo de mercado",
  "practical_tips": [
    "Tip 1 específico para este monto sobre cómo ejecutar las compras",
    "Tip 2 sobre fraccionamiento o uso de ETFs si aplica",
    "Tip 3 sobre rebalanceo y gestión futura del portafolio"
  ],
  "portfolio_metrics": {
    "expected_annual_gain_usd": ${(amount * (activePort?.expected_return || 0.13)).toFixed(2)},
    "expected_annual_gain_pct": ${((activePort?.expected_return || 0.13) * 100).toFixed(2)},
    "max_drawdown_estimate_usd": ${(amount * (activePort?.volatility || 0.15) * 1.5).toFixed(2)},
    "sharpe_portfolio": ${activePort?.sharpe || 0.85},
    "weighted_beta": ${(analysis.assets.reduce((sum, a) => sum + (a.beta || 1) * (activePort?.allocations?.[a.ticker] || 1/assets.length), 0)).toFixed(2)}
  }
}`;

    try {
      const result = await callClaude(SYSTEM, USER);
      setInvestAnalysis(result);
    } catch (e) {
      setInvestError(`Error: ${e.message}`);
    } finally {
      setInvestLoading(false);
    }
  }, [investAmount, analysis, assets, riskProfile]);

  const activePort = analysis?.portfolios?.[riskProfile];

  // ── STYLES ────────────────────────────────────────────────────────────────
  const S = {
    app: { minHeight:"100vh", background:"#030712", color:"#e2e8f0", fontFamily:"'IBM Plex Mono', monospace", paddingBottom:60 },
    header: { background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)", borderBottom:"1px solid #1e293b", padding:"24px 40px", display:"flex", alignItems:"center", justifyContent:"space-between" },
    logo: { fontSize:20, fontWeight:700, color:"#e2e8f0", letterSpacing:2 },
    acc: { color:"#6366f1" },
    badge: { background:"#6366f133", border:"1px solid #6366f166", borderRadius:4, padding:"4px 10px", fontSize:10, color:"#818cf8", letterSpacing:2, fontWeight:600 },
    container: { maxWidth:1300, margin:"0 auto", padding:"32px 24px" },
    card: { background:"#0f172a", border:"1px solid #1e293b", borderRadius:12, padding:24, marginBottom:20 },
    cardTitle: { fontSize:11, fontWeight:700, color:"#6366f1", letterSpacing:3, textTransform:"uppercase", marginBottom:16 },
    input: { width:"100%", background:"#1e293b", border:"1px solid #334155", borderRadius:8, padding:"14px 18px", color:"#e2e8f0", fontSize:15, outline:"none", boxSizing:"border-box", fontFamily:"inherit", letterSpacing:2 },
    btn: (active, color="#6366f1") => ({ background:active?color:"transparent", border:`1px solid ${active?color:"#334155"}`, borderRadius:8, padding:"10px 20px", color:active?"#fff":"#94a3b8", cursor:"pointer", fontSize:12, fontWeight:600, letterSpacing:1, transition:"all 0.2s" }),
    tab: (active) => ({ padding:"8px 16px", borderRadius:7, fontSize:11, fontWeight:600, letterSpacing:1, cursor:"pointer", border:"none", background:active?"#6366f1":"transparent", color:active?"#fff":"#64748b", transition:"all 0.2s" }),
    tag: (color) => ({ background:color+"15", border:`1px solid ${color}40`, borderRadius:4, padding:"3px 8px", fontSize:10, color:color, display:"inline-block", margin:"2px" }),
    alloc: { display:"flex", alignItems:"center", gap:12, marginBottom:10 },
    divider: { borderColor:"#1e293b", borderStyle:"solid", borderWidth:"0 0 1px 0", margin:"16px 0" },
    g2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 },
    g3: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 },
    g4: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 },
  };

  const PORT_COLORS = { conservative:"#10b981", moderate:"#f59e0b", aggressive:"#ef4444" };

  // ─── RENDER: INPUT ────────────────────────────────────────────────────────
  if (step === "input") return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box} input:focus{border-color:#6366f1!important;box-shadow:0 0 0 2px #6366f120}
        ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:#0f172a} ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}
      `}</style>
      <div style={S.header}>
        <div>
          <div style={S.logo}>PORTFOLIO<span style={S.acc}>·</span>LAB</div>
          <div style={{ fontSize:10, color:"#475569", letterSpacing:2, marginTop:4 }}>INTELLIGENT ASSET ALLOCATION ENGINE</div>
        </div>
        <div style={S.badge}>AI-POWERED · REAL-TIME DATA</div>
      </div>

      <div style={{ ...S.container, maxWidth:740 }}>
        <div style={{ textAlign:"center", padding:"48px 0 40px" }}>
          <div style={{ fontSize:36, fontWeight:700, color:"#e2e8f0", lineHeight:1.2, marginBottom:12 }}>
            Construye tu portafolio<br /><span style={{ color:"#6366f1" }}>como un experto</span>
          </div>
          <div style={{ color:"#64748b", fontSize:13, letterSpacing:1, lineHeight:1.9 }}>
            Datos en tiempo real · Fundamentales verificados · Análisis técnico · Markowitz · Plan de inversión
          </div>
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>01 · Activos a analizar</div>
          <input style={S.input} placeholder="AAPL, MSFT, GOOGL, NVDA, TSLA ..."
            value={inputText} onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && parseAssets()} />
          <div style={{ fontSize:10, color:"#475569", marginTop:8, letterSpacing:1 }}>Separa con comas · 2-8 activos · Tickers NYSE / NASDAQ</div>
          {error && <div style={{ color:"#ef4444", fontSize:11, marginTop:10 }}>⚠ {error}</div>}
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>02 · Perfil de riesgo</div>
          <div style={{ display:"flex", gap:12 }}>
            {RISK_PROFILES.map(p => (
              <button key={p.id} onClick={() => setRiskProfile(p.id)} style={{ flex:1, border:`2px solid ${riskProfile===p.id?p.color:"#1e293b"}`, borderRadius:10, padding:"16px 12px", cursor:"pointer", background:riskProfile===p.id?p.color+"18":"#030712", textAlign:"center", transition:"all 0.2s" }}>
                <div style={{ fontSize:24, marginBottom:6 }}>{p.icon}</div>
                <div style={{ fontSize:12, fontWeight:700, color:riskProfile===p.id?p.color:"#94a3b8", letterSpacing:1 }}>{p.label}</div>
                <div style={{ fontSize:10, color:"#475569", marginTop:4 }}>{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={parseAssets} style={{ width:"100%", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", border:"none", borderRadius:10, padding:"16px", color:"#fff", fontSize:13, fontWeight:700, letterSpacing:2, cursor:"pointer", boxShadow:"0 0 40px #6366f130" }}>
          ANALIZAR PORTAFOLIO →
        </button>

        <div style={{ display:"flex", gap:10, marginTop:20, flexWrap:"wrap", justifyContent:"center" }}>
          {["Datos Yahoo Finance","P/E · EBITDA","RSI · MACD · Bollinger","Markowitz","Plan de Inversión","Concentrar vs Diversificar"].map(f => (
            <div key={f} style={S.tag("#6366f1")}>{f}</div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── RENDER: LOADING ──────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ ...S.app, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fade{0%,100%{opacity:.2}50%{opacity:1}}
      `}</style>
      <div style={{ fontSize:14, color:"#6366f1", letterSpacing:3, marginBottom:32 }}>PORTFOLIO·LAB</div>
      <div style={{ width:52, height:52, border:"3px solid #1e293b", borderTop:"3px solid #6366f1", borderRadius:"50%", animation:"spin 0.8s linear infinite", marginBottom:28 }} />
      <div style={{ color:"#94a3b8", fontSize:13, letterSpacing:1, marginBottom:8, animation:"fade 2s ease infinite" }}>
        {LOADING_MSGS[loadingMsg]}
      </div>
      <div style={{ color:"#334155", fontSize:10, marginBottom:28 }}>Consultando Yahoo Finance · Macrotrends · Reuters...</div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
        {assets.map(t => <div key={t} style={{ ...S.tag("#6366f1"), animation:"fade 2s ease infinite" }}>{t}</div>)}
      </div>
    </div>
  );

  if (!analysis) return null;

  const pColor = PORT_COLORS[riskProfile];
  const TABS = ["overview","fundamental","technical","allocation","risks","thesis","invest"];
  const TAB_LABELS = { overview:"Visión General", fundamental:"Fundamental", technical:"Técnico", allocation:"Portafolios", risks:"Riesgos", thesis:"Tesis", invest:"💰 Invertir" };

  // ─── RENDER: RESULTS ──────────────────────────────────────────────────────
  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box} input:focus{border-color:#6366f1!important}
        ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:#0f172a} ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* HEADER */}
      <div style={S.header}>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <button onClick={() => { setStep("input"); setAnalysis(null); setAssets([]); setInputText(""); setInvestAnalysis(null); setInvestAmount(""); }}
            style={{ background:"none", border:"1px solid #334155", borderRadius:6, color:"#94a3b8", padding:"5px 12px", cursor:"pointer", fontSize:11 }}>
            ← Nuevo
          </button>
          <div>
            <div style={S.logo}>PORTFOLIO<span style={S.acc}>·</span>LAB</div>
            <div style={{ fontSize:10, color:"#475569", letterSpacing:2, marginTop:2 }}>
              {assets.join(" · ")} &nbsp;|&nbsp; {RISK_PROFILES.find(r => r.id === riskProfile)?.label}
              {analysis.data_freshness && <span style={{ color:"#334155", marginLeft:8 }}>· {analysis.data_freshness}</span>}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {RISK_PROFILES.map(p => (
            <button key={p.id} onClick={() => setRiskProfile(p.id)} style={S.btn(riskProfile===p.id, p.color)}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={S.container}>

        {/* SUMMARY BANNER */}
        <div style={{ ...S.card, background:"linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)", borderColor:"#6366f140" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ fontSize:11, color:"#818cf8", letterSpacing:3 }}>RESUMEN EJECUTIVO</div>
            {analysis.data_freshness && <div style={{ fontSize:9, color:"#334155", background:"#1e293b", padding:"2px 8px", borderRadius:4 }}>📡 {analysis.data_freshness}</div>}
          </div>
          <p style={{ color:"#cbd5e1", lineHeight:1.8, fontSize:13, margin:0 }}>{analysis.summary}</p>
        </div>

        {/* KPI ROW */}
        {activePort && (
          <div style={{ ...S.g4, marginBottom:20 }}>
            {[
              { v: fmtPct(activePort.expected_return), l:"Retorno Esperado" },
              { v: fmtPct(activePort.volatility),      l:"Volatilidad Anual" },
              { v: fmt(activePort.sharpe, 2),           l:"Sharpe Ratio" },
              { v: assets.length,                       l:"Activos Analizados" },
            ].map(({ v, l }) => (
              <div key={l} style={{ ...S.card, textAlign:"center", padding:"20px 12px", marginBottom:0 }}>
                <div style={{ fontSize:26, fontWeight:700, color:pColor }}>{v}</div>
                <div style={{ fontSize:10, color:"#64748b", letterSpacing:2, textTransform:"uppercase", marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>
        )}

        {/* TABS */}
        <div style={{ display:"flex", gap:4, marginBottom:24, background:"#0f172a", border:"1px solid #1e293b", borderRadius:10, padding:4, width:"fit-content", flexWrap:"wrap" }}>
          {TABS.map(t => <button key={t} style={S.tab(activeTab===t)} onClick={() => setActiveTab(t)}>{TAB_LABELS[t]}</button>)}
        </div>

        {/* ─── OVERVIEW ──────────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div style={S.g2}>
            {analysis.assets?.map(a => (
              <div key={a.ticker} style={S.card}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                  <div>
                    <div style={{ fontSize:22, fontWeight:700, color:"#e2e8f0" }}>{a.ticker}</div>
                    <div style={{ fontSize:11, color:"#64748b" }}>{a.name}</div>
                    <div style={{ display:"flex", gap:4, marginTop:4, flexWrap:"wrap" }}>
                      <div style={S.tag("#6366f1")}>{a.sector}</div>
                      {a.market_cap > 0 && <div style={S.tag("#475569")}>{fmtUSD(a.market_cap)}</div>}
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:20, fontWeight:700, color:"#e2e8f0" }}>${fmt(a.price_approx, 2)}</div>
                    {a.price_source && <div style={{ fontSize:9, color:"#334155", marginTop:2 }}>{a.price_source}</div>}
                    <div style={{ marginTop:6 }}><TrafficLight signal={a.technical?.overall_signal} /></div>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  <Metric value={fmtPct(a.expected_return)} label="Ret. Esperado" color={pColor} />
                  <Metric value={fmtPct(a.volatility_annual)} label="Volatilidad" color="#94a3b8" />
                  <Metric value={fmt(a.sharpe_ratio, 2)} label="Sharpe" color={pColor} />
                </div>
                <div style={S.divider} />
                <div style={{ fontSize:10, color:"#64748b", marginBottom:4 }}>SCORE FUNDAMENTAL</div>
                <Bar value={a.fundamental_score} color={pColor} />
                <div style={{ textAlign:"right", fontSize:11, color:pColor, marginTop:4 }}>{a.fundamental_score}/100</div>
              </div>
            ))}
          </div>
        )}

        {/* ─── FUNDAMENTAL ───────────────────────────────────────────────── */}
        {activeTab === "fundamental" && analysis.assets?.map(a => (
          <div key={a.ticker} style={S.card}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div>
                <span style={{ fontSize:20, fontWeight:700, color:"#e2e8f0" }}>{a.ticker}</span>
                <span style={{ fontSize:12, color:"#64748b", marginLeft:10 }}>{a.name}</span>
                {a.pe_source && <span style={{ fontSize:9, color:"#475569", background:"#1e293b", border:"1px solid #334155", borderRadius:3, padding:"1px 6px", marginLeft:8 }}>{a.pe_source}</span>}
              </div>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <div style={{ ...S.tag(pColor), fontWeight:700 }}>Score: {a.fundamental_score}/100</div>
                <div style={{ fontSize:16, fontWeight:700, color:"#e2e8f0" }}>${fmt(a.price_approx, 2)}</div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:16 }}>
              <Metric value={fmt(a.pe_ratio, 1)+"x"} label="P/E Ratio TTM" color="#e2e8f0" sub={a.pe_source} />
              <Metric value={fmtPct(a.ebitda_margin)} label="Margen EBITDA" color="#e2e8f0" />
              <Metric value={fmtPct(a.revenue_growth_yoy)} label="Crec. YoY" color={a.revenue_growth_yoy>0?"#10b981":"#ef4444"} />
              <Metric value={fmt(a.debt_to_equity,2)+"x"} label="Deuda/Equity" color={a.debt_to_equity>2?"#ef4444":a.debt_to_equity>1?"#f59e0b":"#10b981"} />
              <Metric value={fmt(a.beta,2)} label="Beta" color={a.beta>1.3?"#ef4444":a.beta>0.8?"#f59e0b":"#10b981"} />
            </div>
            <div style={S.g2}>
              <div>
                <div style={{ fontSize:10, color:"#6366f1", letterSpacing:2, marginBottom:6 }}>DIRECCIÓN / MANAGEMENT</div>
                <p style={{ color:"#94a3b8", fontSize:12, lineHeight:1.7, margin:0 }}>{a.management}</p>
              </div>
              <div>
                <div style={{ fontSize:10, color:"#6366f1", letterSpacing:2, marginBottom:6 }}>FLUJO DE CAJA LIBRE</div>
                <p style={{ color:"#94a3b8", fontSize:12, lineHeight:1.7, margin:0 }}>{a.cashflow}</p>
              </div>
            </div>
            <div style={S.divider} />
            <div style={{ fontSize:10, color:"#6366f1", letterSpacing:2, marginBottom:10 }}>RENTABILIDADES HISTÓRICAS Y PROYECCIÓN</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
              <Metric value={fmtPct(a.historical_return_3y)} label="Retorno 3 Años" color={pColor} sub="CAGR anualizado" />
              <Metric value={fmtPct(a.historical_return_5y)} label="Retorno 5 Años" color={pColor} sub="CAGR anualizado" />
              <Metric value={fmtPct(a.expected_return)} label="Retorno Esperado" color={pColor} sub="estimación forward" />
              <Metric value={fmtPct(a.volatility_annual)} label="Volatilidad σ" color="#94a3b8" sub="anualizada" />
            </div>
            <div style={{ marginTop:12, fontSize:12, color:"#94a3b8", lineHeight:1.7 }}>{a.fundamental_comment}</div>
          </div>
        ))}

        {/* ─── TECHNICAL ─────────────────────────────────────────────────── */}
        {activeTab === "technical" && analysis.assets?.map(a => (
          <div key={a.ticker} style={S.card}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div>
                <span style={{ fontSize:18, fontWeight:700, color:"#e2e8f0" }}>{a.ticker}</span>
                <span style={{ fontSize:12, color:"#64748b", marginLeft:10 }}>{a.name}</span>
              </div>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <span style={{ fontSize:10, color:"#64748b" }}>Tendencia:</span>
                <span style={{ fontSize:13, fontWeight:700, color:a.technical?.trend==="ALCISTA"?"#10b981":a.technical?.trend==="BAJISTA"?"#ef4444":"#f59e0b" }}>
                  {a.technical?.trend}
                </span>
                <TrafficLight signal={a.technical?.overall_signal} />
              </div>
            </div>

            <div style={{ fontSize:10, color:"#6366f1", letterSpacing:2, marginBottom:10 }}>SEMÁFORO DE INDICADORES</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
              {[
                { key:"rsi_signal",    label:"RSI", extra: a.technical?.rsi_value ? `(${fmt(a.technical.rsi_value,1)})` : "" },
                { key:"macd_signal",   label:"MACD" },
                { key:"bb_signal",     label:"Bandas Bollinger" },
                { key:"sma50_signal",  label:"SMA 50" },
                { key:"sma200_signal", label:"SMA 200" },
                { key:"volume_signal", label:"Volumen" },
              ].map(({ key, label, extra }) => (
                <div key={key} style={{ background:"#030712", borderRadius:8, padding:"12px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:11, color:"#94a3b8" }}>{label} <span style={{ color:"#475569", fontSize:10 }}>{extra}</span></span>
                  <TrafficLight signal={a.technical?.[key]} />
                </div>
              ))}
            </div>
            <div style={{ background:"#030712", borderRadius:8, padding:14, marginBottom:10 }}>
              <div style={{ fontSize:10, color:"#f59e0b", letterSpacing:2, marginBottom:6 }}>PATRÓN TÉCNICO IDENTIFICADO</div>
              <p style={{ color:"#cbd5e1", fontSize:12, lineHeight:1.7, margin:0 }}>{a.technical?.pattern}</p>
            </div>
            <div style={{ background:"#030712", borderRadius:8, padding:14 }}>
              <div style={{ fontSize:10, color:"#6366f1", letterSpacing:2, marginBottom:6 }}>COMENTARIO TÉCNICO</div>
              <p style={{ color:"#94a3b8", fontSize:12, lineHeight:1.7, margin:0 }}>{a.technical?.technical_comment}</p>
            </div>
          </div>
        ))}

        {/* ─── ALLOCATION ────────────────────────────────────────────────── */}
        {activeTab === "allocation" && (
          <div>
            <div style={S.g3}>
              {RISK_PROFILES.map(profile => {
                const port = analysis.portfolios?.[profile.id];
                const isActive = riskProfile === profile.id;
                if (!port) return null;
                return (
                  <div key={profile.id} style={{ ...S.card, marginBottom:0, border:`2px solid ${isActive?profile.color:"#1e293b"}`, background:isActive?profile.color+"08":"#0f172a" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:isActive?profile.color:"#94a3b8" }}>{profile.icon} {profile.label}</div>
                      {isActive && <div style={S.tag(profile.color)}>ACTIVO</div>}
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
                      <Metric value={fmtPct(port.expected_return)} label="Retorno" color={profile.color} />
                      <Metric value={fmtPct(port.volatility)} label="Riesgo" color="#94a3b8" />
                      <Metric value={fmt(port.sharpe,2)} label="Sharpe" color={profile.color} />
                    </div>
                    <div style={{ fontSize:10, color:"#64748b", letterSpacing:2, marginBottom:10 }}>ALLOCACIÓN</div>
                    {Object.entries(port.allocations || {}).map(([ticker, pct]) => (
                      <div key={ticker} style={S.alloc}>
                        <div style={{ width:60, fontSize:12, fontWeight:700, color:"#e2e8f0" }}>{ticker}</div>
                        <div style={{ flex:1 }}><Bar value={pct*100} color={profile.color} /></div>
                        <div style={{ width:42, fontSize:12, color:"#94a3b8", textAlign:"right" }}>{(pct*100).toFixed(0)}%</div>
                      </div>
                    ))}
                    <div style={S.divider} />
                    <p style={{ color:"#94a3b8", fontSize:11, lineHeight:1.7, margin:0 }}>{port.rationale}</p>
                    {!isActive && (
                      <button onClick={() => setRiskProfile(profile.id)} style={{ marginTop:12, width:"100%", background:"transparent", border:`1px solid ${profile.color}44`, borderRadius:6, color:profile.color, padding:"8px", cursor:"pointer", fontSize:11, fontWeight:600 }}>
                        Seleccionar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {analysis.correlations && (
              <div style={{ ...S.card, marginTop:20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div style={S.cardTitle}>Correlaciones y Diversificación</div>
                  {analysis.correlations.diversification_score && <div style={{ ...S.tag("#6366f1"), fontSize:12, fontWeight:700 }}>Score: {analysis.correlations.diversification_score}/100</div>}
                </div>
                <p style={{ color:"#94a3b8", fontSize:13, lineHeight:1.8, margin:"0 0 8px" }}>{analysis.correlations.description}</p>
                <p style={{ color:"#64748b", fontSize:12, lineHeight:1.7, margin:0 }}>{analysis.correlations.matrix_note}</p>
              </div>
            )}
          </div>
        )}

        {/* ─── RISKS ─────────────────────────────────────────────────────── */}
        {activeTab === "risks" && analysis.assets?.map(a => (
          <div key={a.ticker} style={S.card}>
            <div style={{ marginBottom:14 }}>
              <span style={{ fontSize:16, fontWeight:700, color:"#e2e8f0" }}>{a.ticker}</span>
              <span style={{ fontSize:11, color:"#64748b", marginLeft:10 }}>{a.name}</span>
            </div>
            <div style={S.g2}>
              <div>
                <div style={{ fontSize:10, color:"#ef4444", letterSpacing:2, marginBottom:10 }}>⚠ RIESGOS MACROECONÓMICOS</div>
                {(a.macro_risks || []).map((r, i) => (
                  <div key={i} style={{ display:"flex", gap:8, marginBottom:8 }}>
                    <span style={{ color:"#ef4444", fontSize:12 }}>▸</span>
                    <span style={{ color:"#94a3b8", fontSize:12, lineHeight:1.6 }}>{r}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize:10, color:"#f59e0b", letterSpacing:2, marginBottom:10 }}>⚠ RIESGOS SECTORIALES</div>
                {(a.sector_risks || []).map((r, i) => (
                  <div key={i} style={{ display:"flex", gap:8, marginBottom:8 }}>
                    <span style={{ color:"#f59e0b", fontSize:12 }}>▸</span>
                    <span style={{ color:"#94a3b8", fontSize:12, lineHeight:1.6 }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginTop:12 }}>
              <Metric value={fmt(a.beta,2)} label="Beta" color={a.beta>1.2?"#ef4444":a.beta>0.8?"#f59e0b":"#10b981"} sub="sensibilidad al mercado" />
              <Metric value={fmt(a.debt_to_equity,2)+"x"} label="Deuda/Equity" color={a.debt_to_equity>2?"#ef4444":a.debt_to_equity>1?"#f59e0b":"#10b981"} />
              <Metric value={fmtPct(a.volatility_annual)} label="Volatilidad σ" color="#94a3b8" sub="riesgo total" />
            </div>
          </div>
        ))}

        {/* ─── THESIS ────────────────────────────────────────────────────── */}
        {activeTab === "thesis" && (
          <div>
            <div style={{ ...S.card, borderColor:pColor+"40", background:`linear-gradient(135deg,${pColor}08 0%,#0f172a 100%)` }}>
              <div style={{ fontSize:10, color:pColor, letterSpacing:3, marginBottom:16 }}>
                TESIS DE INVERSIÓN · {RISK_PROFILES.find(r => r.id===riskProfile)?.label.toUpperCase()}
              </div>
              <p style={{ color:"#cbd5e1", fontSize:14, lineHeight:1.9, margin:0 }}>{analysis.investment_thesis}</p>
            </div>
            {activePort && (
              <div style={S.card}>
                <div style={S.cardTitle}>Sustento Cuantitativo</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:20 }}>
                  <Metric value={fmtPct(activePort.expected_return)} label="Retorno Anual Esperado" color={pColor} />
                  <Metric value={fmtPct(activePort.volatility)} label="Volatilidad Anualizada" color="#94a3b8" />
                  <Metric value={fmt(activePort.sharpe,3)} label="Ratio de Sharpe" color={pColor} />
                </div>
                <div style={S.divider} />
                <div style={{ fontSize:10, color:"#6366f1", letterSpacing:2, marginBottom:12 }}>DISTRIBUCIÓN ÓPTIMA DEL CAPITAL</div>
                {Object.entries(activePort.allocations || {}).map(([ticker, pct]) => {
                  const asset = analysis.assets?.find(a => a.ticker === ticker);
                  return (
                    <div key={ticker} style={{ display:"flex", alignItems:"center", gap:16, marginBottom:12 }}>
                      <div style={{ width:55, fontSize:13, fontWeight:700, color:"#e2e8f0" }}>{ticker}</div>
                      <div style={{ flex:1 }}><Bar value={pct*100} color={pColor} /></div>
                      <div style={{ width:40, textAlign:"right", fontSize:13, fontWeight:700, color:pColor }}>{(pct*100).toFixed(0)}%</div>
                      {asset && <div style={{ fontSize:10, color:"#475569", width:130 }}>Sharpe: {fmt(asset.sharpe_ratio,2)} · β: {fmt(asset.beta,2)}</div>}
                    </div>
                  );
                })}
                <div style={S.divider} />
                <p style={{ color:"#94a3b8", fontSize:12, lineHeight:1.8, margin:0 }}>{activePort.rationale}</p>
              </div>
            )}
          </div>
        )}

        {/* ─── INVEST ────────────────────────────────────────────────────── */}
        {activeTab === "invest" && (
          <div>
            {/* Input monto */}
            <div style={{ ...S.card, borderColor:"#f59e0b40", background:"linear-gradient(135deg,#f59e0b08 0%,#0f172a 100%)" }}>
              <div style={{ fontSize:11, color:"#f59e0b", letterSpacing:3, marginBottom:14 }}>💰 PLAN DE INVERSIÓN PERSONALIZADO</div>
              <p style={{ color:"#94a3b8", fontSize:12, lineHeight:1.7, margin:"0 0 18px" }}>
                Ingresa cuánto dinero estás dispuesto a invertir. El modelo aplicará la <strong style={{ color:"#e2e8f0" }}>Teoría de Markowitz</strong> y el <strong style={{ color:"#e2e8f0" }}>modelo CAPM</strong> para recomendarte exactamente cómo distribuirlo, cuántas acciones comprar, y si debes concentrar o diversificar más tu portafolio según el monto disponible.
              </p>
              <div style={{ display:"flex", gap:12 }}>
                <div style={{ flex:1 }}>
                  <input style={{ ...S.input, fontSize:18 }} placeholder="Ej: 10000"
                    value={investAmount} onChange={e => setInvestAmount(e.target.value.replace(/[^0-9.]/g,""))}
                    onKeyDown={e => e.key==="Enter" && runInvestAnalysis()} />
                  <div style={{ fontSize:10, color:"#475569", marginTop:6 }}>Monto en USD · Solo números</div>
                </div>
                <button onClick={runInvestAnalysis} disabled={investLoading} style={{
                  background:"linear-gradient(135deg,#f59e0b,#d97706)", border:"none", borderRadius:8,
                  padding:"0 28px", color:"#000", fontWeight:700, fontSize:12, letterSpacing:1,
                  cursor:investLoading?"not-allowed":"pointer", whiteSpace:"nowrap", opacity:investLoading?0.7:1,
                }}>
                  {investLoading ? "CALCULANDO..." : "GENERAR PLAN →"}
                </button>
              </div>
              {investError && <div style={{ color:"#ef4444", fontSize:11, marginTop:10 }}>⚠ {investError}</div>}
              {investLoading && (
                <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:18, color:"#94a3b8", fontSize:12 }}>
                  <div style={{ width:20, height:20, border:"2px solid #1e293b", borderTop:"2px solid #f59e0b", borderRadius:"50%", animation:"spin 0.8s linear infinite", flexShrink:0 }} />
                  Aplicando Teoría de Markowitz y CAPM para ${parseFloat(investAmount||0).toLocaleString()}...
                </div>
              )}
            </div>

            {investAnalysis && (() => {
              const stratColor = investAnalysis.strategy==="DIVERSIFICAR" ? "#6366f1" : investAnalysis.strategy==="CONCENTRAR" ? "#ef4444" : "#f59e0b";
              const stratIcon  = investAnalysis.strategy==="DIVERSIFICAR" ? "📊" : investAnalysis.strategy==="CONCENTRAR" ? "🎯" : "⚖️";
              return (
                <div>
                  {/* Strategy banner */}
                  <div style={{ ...S.card, borderColor:stratColor+"40", background:stratColor+"08" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                      <div>
                        <div style={{ fontSize:10, color:"#64748b", letterSpacing:2, marginBottom:4 }}>ESTRATEGIA RECOMENDADA PARA</div>
                        <div style={{ fontSize:28, fontWeight:700, color:"#e2e8f0" }}>${parseFloat(investAnalysis.amount||0).toLocaleString()} USD</div>
                      </div>
                      <div style={{ fontSize:14, fontWeight:700, letterSpacing:2, color:stratColor, background:stratColor+"20", border:`1px solid ${stratColor}44`, borderRadius:8, padding:"10px 20px" }}>
                        {stratIcon} {investAnalysis.strategy}
                      </div>
                    </div>
                    <p style={{ color:"#94a3b8", fontSize:13, lineHeight:1.7, margin:"0 0 14px" }}>{investAnalysis.strategy_reason}</p>
                    <div style={S.g4}>
                      <Metric value={`$${parseFloat(investAnalysis.portfolio_metrics?.expected_annual_gain_usd||0).toLocaleString()}`} label="Ganancia Anual Est." color="#10b981" />
                      <Metric value={`${fmt(investAnalysis.portfolio_metrics?.expected_annual_gain_pct,1)}%`} label="Retorno Esperado" color="#10b981" />
                      <Metric value={`-$${parseFloat(investAnalysis.portfolio_metrics?.max_drawdown_estimate_usd||0).toLocaleString()}`} label="Drawdown Máx. Est." color="#ef4444" />
                      <Metric value={fmt(investAnalysis.portfolio_metrics?.weighted_beta,2)} label="Beta Ponderado" color="#f59e0b" />
                    </div>
                  </div>

                  {/* Allocation table */}
                  <div style={S.card}>
                    <div style={S.cardTitle}>📋 Distribución exacta del capital</div>
                    <div style={{ display:"grid", gap:10 }}>
                      {Object.entries(investAnalysis.allocations_final || {}).map(([ticker, info]) => {
                        const asset = analysis.assets?.find(a => a.ticker === ticker);
                        return (
                          <div key={ticker} style={{ background:"#030712", borderRadius:10, padding:16, display:"grid", gridTemplateColumns:"80px 1fr 110px 120px 110px", gap:12, alignItems:"center" }}>
                            <div>
                              <div style={{ fontSize:16, fontWeight:700, color:pColor }}>{ticker}</div>
                              <div style={{ fontSize:9, color:"#475569" }}>{asset?.sector}</div>
                            </div>
                            <div>
                              <Bar value={(info.pct||0)*100} color={pColor} />
                              <div style={{ fontSize:10, color:"#64748b", marginTop:4 }}>{info.rationale}</div>
                            </div>
                            <div style={{ textAlign:"center" }}>
                              <div style={{ fontSize:16, fontWeight:700, color:"#e2e8f0" }}>{((info.pct||0)*100).toFixed(0)}%</div>
                              <div style={{ fontSize:9, color:"#475569" }}>del portafolio</div>
                            </div>
                            <div style={{ textAlign:"center" }}>
                              <div style={{ fontSize:16, fontWeight:700, color:pColor }}>${parseFloat(info.usd||0).toLocaleString()}</div>
                              <div style={{ fontSize:9, color:"#475569" }}>a invertir</div>
                            </div>
                            <div style={{ textAlign:"center" }}>
                              <div style={{ fontSize:16, fontWeight:700, color:"#94a3b8" }}>~{fmt(info.shares_approx,2)}</div>
                              <div style={{ fontSize:9, color:"#475569" }}>acciones aprox.</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* New assets suggestion */}
                  {investAnalysis.new_assets_suggested?.length > 0 && (
                    <div style={{ ...S.card, borderColor:"#6366f140" }}>
                      <div style={{ fontSize:11, color:"#6366f1", letterSpacing:3, marginBottom:14 }}>🔍 ACTIVOS SUGERIDOS PARA DIVERSIFICAR</div>
                      <p style={{ color:"#64748b", fontSize:11, lineHeight:1.7, marginBottom:14 }}>
                        Tu monto es suficientemente alto para ampliar la diversificación. Considera añadir estos activos para reducir riesgo concentrado:
                      </p>
                      {investAnalysis.new_assets_suggested.map((s, i) => (
                        <div key={i} style={{ background:"#030712", borderRadius:10, padding:16, marginBottom:10 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                            <div>
                              <span style={{ fontSize:16, fontWeight:700, color:"#6366f1" }}>{s.ticker}</span>
                              <span style={{ fontSize:12, color:"#64748b", marginLeft:10 }}>{s.name}</span>
                            </div>
                            <div style={{ fontSize:14, fontWeight:700, color:"#e2e8f0" }}>
                              {((s.allocation_suggested_pct||0)*100).toFixed(0)}% · ${parseFloat(s.allocation_suggested_usd||0).toLocaleString()}
                            </div>
                          </div>
                          <p style={{ color:"#94a3b8", fontSize:12, lineHeight:1.6, margin:"0 0 6px" }}>{s.reason}</p>
                          <p style={{ color:"#475569", fontSize:11, margin:0 }}>🔗 {s.correlation_benefit}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Theory insights */}
                  <div style={S.g2}>
                    <div style={S.card}>
                      <div style={{ fontSize:10, color:"#818cf8", letterSpacing:2, marginBottom:10 }}>📐 TEORÍA DE MARKOWITZ</div>
                      <p style={{ color:"#94a3b8", fontSize:12, lineHeight:1.8, margin:0 }}>{investAnalysis.markowitz_insight}</p>
                    </div>
                    <div style={S.card}>
                      <div style={{ fontSize:10, color:"#34d399", letterSpacing:2, marginBottom:10 }}>📊 MODELO CAPM</div>
                      <p style={{ color:"#94a3b8", fontSize:12, lineHeight:1.8, margin:0 }}>{investAnalysis.capm_insight}</p>
                    </div>
                  </div>

                  {/* Tips */}
                  <div style={S.card}>
                    <div style={S.cardTitle}>💡 Consejos de Ejecución</div>
                    {(investAnalysis.practical_tips || []).map((tip, i) => (
                      <div key={i} style={{ display:"flex", gap:12, marginBottom:12, alignItems:"flex-start" }}>
                        <div style={{ width:22, height:22, background:pColor+"20", border:`1px solid ${pColor}44`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:pColor, flexShrink:0 }}>{i+1}</div>
                        <p style={{ color:"#94a3b8", fontSize:12, lineHeight:1.7, margin:0 }}>{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* DISCLAIMER */}
        <div style={{ fontSize:10, color:"#334155", textAlign:"center", marginTop:32, lineHeight:1.8 }}>
          ⚠ Los datos fundamentales son obtenidos mediante búsqueda web en tiempo real (Yahoo Finance, Macrotrends, Reuters).<br />
          Este análisis es generado por IA con fines informativos y educativos. No constituye asesoramiento financiero.<br />
          Siempre verifica los datos con tu broker y consulta a un asesor financiero certificado antes de invertir.
        </div>
      </div>
    </div>
  );
}
