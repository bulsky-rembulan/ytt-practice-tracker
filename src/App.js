import { useState, useEffect } from "react";

const GOAL_MINUTES = 3000;
const MILESTONES = [
  { mins: 300, label: "5hr", emoji: "⚡" },
  { mins: 600, label: "10hr", emoji: "🌱" },
  { mins: 900, label: "15hr", emoji: "✨" },
  { mins: 1500, label: "25hr", emoji: "🌙" },
  { mins: 2100, label: "35hr", emoji: "🔥" },
  { mins: 2700, label: "45hr", emoji: "🚀" },
  { mins: 3000, label: "50hr!", emoji: "🏆" },
];

function fmt(mins) {
  if (!mins) return "—";
  const h = Math.floor(mins / 60), m = mins % 60;
  if (h === 0) return m + "min";
  return m === 0 ? h + "hr" : h + "hr " + m + "min";
}

function calcDuration(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  return diff > 0 ? diff : 0;
}

function fmtDate(dateStr) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "short", day: "2-digit", month: "short",
  });
}

const STORAGE_KEY = "ytt_sessions_v1";
const VIDEO_KEY = "ytt_videos_v1";

const inp = {
  width: "100%", background: "#1a2e20", border: "1px solid #2a4030",
  borderRadius: 8, color: "#e8e0d0", fontSize: 14, padding: "10px 14px",
  fontFamily: "Georgia, serif", boxSizing: "border-box", outline: "none",
};

const lbl = {
  display: "block", fontSize: 11, color: "#6b8f6b",
  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4,
};

export default function App() {
  const [sessions, setSessions] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [satVideos, setSatVideos] = useState(() => {
    try {
      const stored = localStorage.getItem(VIDEO_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [activeTab, setActiveTab] = useState("log");
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "", endTime: "", duration: "",
    sequence: "", poses: "", sentToTeacher: false, notes: "",
  });
  const [videoForm, setVideoForm] = useState({
    date: new Date().toISOString().split("T")[0],
    theme: "", cues: "", submitted: false, reflection: "",
  });
  const [formError, setFormError] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); } catch {}
  }, [sessions]);

  useEffect(() => {
    try { localStorage.setItem(VIDEO_KEY, JSON.stringify(satVideos)); } catch {}
  }, [satVideos]);

  const totalMins = sessions.reduce((a, s) => a + (s.duration || 0), 0);
  const pct = Math.min(totalMins / GOAL_MINUTES, 1);
  const minsLeft = Math.max(GOAL_MINUTES - totalMins, 0);
  const avg = sessions.length ? Math.round(totalMins / sessions.length) : 0;
  const sessLeft = avg ? Math.ceil(minsLeft / avg) : null;
  const barFilled = Math.round(pct * 20);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  function onForm(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setFormError("");
  }

  function onVideoForm(e) {
    const { name, value, type, checked } = e.target;
    setVideoForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function submitSession(e) {
    e.preventDefault();
    const dur = form.duration ? parseInt(form.duration) : calcDuration(form.startTime, form.endTime);
    if (!form.date) { setFormError("Please add a date."); return; }
    if (!dur || dur <= 0) { setFormError("Add a duration or start/end times."); return; }
    const ns = { id: Date.now(), ...form, duration: dur };
    const updated = [...sessions, ns].sort((a, b) => new Date(a.date) - new Date(b.date));
    setSessions(updated);
    showToast("+" + dur + " min logged! 🧘");
    setForm({ date: new Date().toISOString().split("T")[0], startTime: "", endTime: "", duration: "", sequence: "", poses: "", sentToTeacher: false, notes: "" });
    setActiveTab("sessions");
  }

  function submitVideo(e) {
    e.preventDefault();
    if (!videoForm.theme) return;
    setSatVideos(v => [...v, { id: Date.now(), ...videoForm }]);
    showToast("Saturday video logged! 📹");
    setVideoForm({ date: new Date().toISOString().split("T")[0], theme: "", cues: "", submitted: false, reflection: "" });
    setActiveTab("videos");
  }

  function handleImport() {
    try {
      const parsed = JSON.parse(importText.trim());
      if (!Array.isArray(parsed)) throw new Error("Not an array");
      setSessions(parsed.sort((a, b) => new Date(a.date) - new Date(b.date)));
      setShowImport(false);
      setImportText("");
      setImportError("");
      showToast("Sessions imported! 🎉");
      setActiveTab("sessions");
    } catch {
      setImportError("Invalid data — make sure you copied the full text correctly.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f1a14", fontFamily: "Georgia, serif", color: "#e8e0d0" }}>

      {toast && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          zIndex: 999, background: "#8FAF8F", color: "#0f1a14",
          padding: "12px 28px", borderRadius: 30, fontWeight: "bold", fontSize: 14,
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)", whiteSpace: "nowrap",
        }}>{toast}</div>
      )}

      <div style={{ background: "linear-gradient(135deg,#1a2e20,#0f1a14)", borderBottom: "1px solid #2a4030", padding: "20px 16px 16px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 22 }}>🧘</span>
            <h1 style={{ margin: 0, fontSize: 17, fontWeight: "normal", color: "#d4e6d4" }}>Yoga Teacher Training</h1>
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 10, color: "#4a6a4a", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            50-Hour Self Practice · 200hr Certification
          </p>
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b8f6b", marginBottom: 4 }}>
              <span>PROGRESS</span>
              <span style={{ color: "#8FAF8F", fontWeight: "bold" }}>{(totalMins/60).toFixed(1)} / 50 hrs · {Math.round(pct*100)}%</span>
            </div>
            <div style={{ background: "#1e3025", borderRadius: 4, height: 8, overflow: "hidden", border: "1px solid #2a4030" }}>
              <div style={{ height: "100%", width: (pct*100) + "%", background: "linear-gradient(90deg,#4a7a4a,#8FAF8F)", borderRadius: 4, transition: "width 0.6s" }} />
            </div>
            <div style={{ marginTop: 5, fontFamily: "monospace", fontSize: 12, letterSpacing: 1 }}>
              <span style={{ color: "#5a9a5a" }}>{"█".repeat(barFilled)}</span>
              <span style={{ color: "#1e3025" }}>{"░".repeat(20-barFilled)}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 10 }}>
            {[
              { l: "Min Logged", v: totalMins.toLocaleString() },
              { l: "Hrs Left", v: (minsLeft/60).toFixed(1) },
              { l: "Sessions", v: sessions.length },
              { l: "~Sessions Left", v: sessLeft || "—" },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontSize: 17, fontWeight: "bold", color: "#8FAF8F" }}>{s.v}</div>
                <div style={{ fontSize: 9, color: "#4a6a4a", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {MILESTONES.map(m => {
              const on = totalMins >= m.mins;
              function handleImport() {
    try {
      const parsed = JSON.parse(importText.trim());
      if (!Array.isArray(parsed)) throw new Error("Not an array");
      setSessions(parsed.sort((a, b) => new Date(a.date) - new Date(b.date)));
      setShowImport(false);
      setImportText("");
      setImportError("");
      showToast("Sessions imported! 🎉");
      setActiveTab("sessions");
    } catch {
      setImportError("Invalid data — make sure you copied the full text correctly.");
    }
  }

  return (
                <span key={m.label} style={{
                  padding: "2px 8px", borderRadius: 20, fontSize: 10,
                  background: on ? "#2a4a2a" : "#141f18",
                  color: on ? "#8FAF8F" : "#2a4a2a",
                  border: "1px solid " + (on ? "#4a7a4a" : "#1e3025"),
                }}>{m.emoji} {m.label}{on ? " ✓" : ""}</span>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ borderBottom: "1px solid #2a4030" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", overflowX: "auto" }}>
          {[
            { id: "log", label: "✍️ Log Session" },
            { id: "video", label: "📹 Sat. Video" },
            { id: "sessions", label: "📋 Sessions (" + sessions.length + ")" },
            { id: "videos", label: "🎬 Videos (" + satVideos.length + ")" },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: "12px 14px", background: "none", border: "none",
              borderBottom: activeTab === t.id ? "2px solid #8FAF8F" : "2px solid transparent",
              color: activeTab === t.id ? "#8FAF8F" : "#4a6a4a",
              cursor: "pointer", fontSize: 12, whiteSpace: "nowrap",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "18px 16px 40px" }}>

        {activeTab === "log" && (
          <form onSubmit={submitSession} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ margin: 0, color: "#6b8f6b", fontSize: 13 }}>Fill in your practice details 🌿</p>
            <div><label style={lbl}>Date</label><input type="date" name="date" value={form.date} onChange={onForm} style={inp} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label style={lbl}>Start Time</label><input type="time" name="startTime" value={form.startTime} onChange={onForm} style={inp} /></div>
              <div><label style={lbl}>End Time</label><input type="time" name="endTime" value={form.endTime} onChange={onForm} style={inp} /></div>
            </div>
            <div>
              <label style={lbl}>Duration (min) — skip if you set times above</label>
              <input type="number" name="duration" value={form.duration} onChange={onForm} min="1"
                placeholder={form.startTime && form.endTime ? "Auto: " + calcDuration(form.startTime, form.endTime) + " min" : "e.g. 45"} style={inp} />
            </div>
            <div><label style={lbl}>Sequence / Focus</label><input type="text" name="sequence" value={form.sequence} onChange={onForm} placeholder="e.g. Sun Salutations, hip openers, backbends" style={inp} /></div>
            <div><label style={lbl}>Poses & Notes</label><textarea name="poses" value={form.poses} onChange={onForm} rows={3} placeholder="Specific poses, transitions..." style={{ ...inp, resize: "vertical" }} /></div>
            <div><label style={lbl}>Extra Notes (optional)</label><input type="text" name="notes" value={form.notes} onChange={onForm} placeholder="How did it feel?" style={inp} /></div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: "#8FAF8F", fontSize: 13 }}>
              <input type="checkbox" name="sentToTeacher" checked={form.sentToTeacher} onChange={onForm} style={{ width: 16, height: 16, accentColor: "#8FAF8F" }} />
              Already sent report to Denise
            </label>
            {formError && <p style={{ color: "#e57373", fontSize: 13, margin: 0 }}>⚠️ {formError}</p>}
            <button type="submit" style={{ background: "#4a7a4a", border: "none", borderRadius: 10, color: "#d4e6d4", padding: "14px", fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
              Save Session 🙏
            </button>
          </form>
        )}

        {activeTab === "video" && (
          <form onSubmit={submitVideo} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ margin: 0, color: "#C8A951", fontSize: 13 }}>Log your Saturday 2-minute teaching video 📹</p>
            <div><label style={lbl}>Date</label><input type="date" name="date" value={videoForm.date} onChange={onVideoForm} style={inp} /></div>
            <div><label style={lbl}>Theme / Pose Focus</label><input type="text" name="theme" value={videoForm.theme} onChange={onVideoForm} required placeholder="e.g. Warrior II cues" style={inp} /></div>
            <div><label style={lbl}>Cues & Key Points</label><textarea name="cues" value={videoForm.cues} onChange={onVideoForm} rows={3} placeholder="What did you teach?" style={{ ...inp, resize: "vertical" }} /></div>
            <div><label style={lbl}>Self-Reflection</label><textarea name="reflection" value={videoForm.reflection} onChange={onVideoForm} rows={2} placeholder="How did it go?" style={{ ...inp, resize: "vertical" }} /></div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", color: "#C8A951", fontSize: 13 }}>
              <input type="checkbox" name="submitted" checked={videoForm.submitted} onChange={onVideoForm} style={{ width: 16, height: 16, accentColor: "#C8A951" }} />
              Video submitted to teacher
            </label>
            <button type="submit" style={{ background: "#2a1a08", border: "1px solid #C8A951", borderRadius: 10, color: "#C8A951", padding: "14px", fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
              Save Video Log 📹
            </button>
          </form>
        )}

        {activeTab === "sessions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sessions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 0", color: "#3a5a3a" }}>
                <div style={{ fontSize: 36 }}>🌿</div>
                <p style={{ fontSize: 13 }}>No sessions yet — log your first practice!</p>
              </div>
            ) : [...sessions].reverse().map(s => (
              <div key={s.id} style={{ background: "#141f18", border: "1px solid #2a4030", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <span style={{ color: "#8FAF8F", fontWeight: "bold", fontSize: 13 }}>{fmtDate(s.date)}</span>
                    {s.startTime && s.endTime && <span style={{ color: "#4a6a4a", fontSize: 11, marginLeft: 8 }}>{s.startTime}–{s.endTime}</span>}
                  </div>
                  <span style={{ color: "#C8A951", fontWeight: "bold", fontSize: 16 }}>{fmt(s.duration)}</span>
                </div>
                {s.sequence && <div style={{ fontSize: 12, color: "#b0c8b0", marginBottom: 4 }}>{s.sequence}</div>}
                {s.poses && <div style={{ fontSize: 11, color: "#4a6a4a", marginBottom: 6 }}>{s.poses}</div>}
                {s.notes && <div style={{ fontSize: 11, color: "#3a5a3a", fontStyle: "italic", marginBottom: 8 }}>{s.notes}</div>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setSessions(sessions.map(x => x.id===s.id ? {...x, sentToTeacher:!x.sentToTeacher} : x))} style={{
                    background: s.sentToTeacher ? "#1a3a1a" : "#1a2a1a",
                    border: "1px solid " + (s.sentToTeacher ? "#4a7a4a" : "#3a4a3a"),
                    color: s.sentToTeacher ? "#8FAF8F" : "#4a6a4a",
                    borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 11,
                  }}>{s.sentToTeacher ? "✓ Sent to Denise" : "Mark as Sent"}</button>
                  <button onClick={() => setSessions(sessions.filter(x => x.id !== s.id))} style={{
                    background: "none", border: "1px solid #3a2a2a", color: "#5a3a3a",
                    borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11,
                  }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "videos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {satVideos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 0", color: "#3a5a3a" }}>
                <div style={{ fontSize: 36 }}>📹</div>
                <p style={{ fontSize: 13 }}>No Saturday videos yet!</p>
              </div>
            ) : [...satVideos].reverse().map(v => (
              <div key={v.id} style={{ background: "#1a1a10", border: "1px solid #3a3a1a", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#C8A951", fontWeight: "bold", fontSize: 13 }}>📹 {fmtDate(v.date)}</span>
                  <span style={{
                    fontSize: 11, padding: "2px 10px", borderRadius: 10,
                    background: v.submitted ? "#1a2a1a" : "#2a1a0a",
                    color: v.submitted ? "#8FAF8F" : "#8a5a2a",
                    border: "1px solid " + (v.submitted ? "#3a5a3a" : "#5a3a1a"),
                  }}>{v.submitted ? "✓ Submitted" : "Pending"}</span>
                </div>
                {v.theme && <div style={{ fontSize: 13, color: "#b0c8b0" }}>{v.theme}</div>}
                {v.cues && <div style={{ fontSize: 12, color: "#6a8a6a", marginTop: 4 }}>{v.cues}</div>}
                {v.reflection && <div style={{ fontSize: 11, color: "#4a6a4a", marginTop: 4, fontStyle: "italic" }}>{v.reflection}</div>}
              </div>
            ))}
          </div>
        )}

      </div>
      {showImport && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
          zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
          padding: 16,
        }}>
          <div style={{ background: "#1a2e20", border: "1px solid #2a4030", borderRadius: 12, padding: 24, maxWidth: 500, width: "100%" }}>
            <h3 style={{ margin: "0 0 8px", color: "#8FAF8F", fontSize: 16 }}>Import Sessions 📥</h3>
            <p style={{ margin: "0 0 12px", color: "#6b8f6b", fontSize: 13 }}>Paste your session data from another device:</p>
            <textarea
              value={importText}
              onChange={e => { setImportText(e.target.value); setImportError(""); }}
              rows={6}
              placeholder='Paste your data here — starts with [{"id":...'
              style={{ ...inp, resize: "vertical", marginBottom: 8 }}
            />
            {importError && <p style={{ color: "#e57373", fontSize: 12, margin: "0 0 8px" }}>⚠️ {importError}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleImport} style={{
                flex: 1, background: "#4a7a4a", border: "none", borderRadius: 8,
                color: "#d4e6d4", padding: "12px", fontSize: 14, cursor: "pointer",
              }}>Import</button>
              <button onClick={() => { setShowImport(false); setImportText(""); setImportError(""); }} style={{
                background: "none", border: "1px solid #2a4030", borderRadius: 8,
                color: "#6b8f6b", padding: "12px 16px", fontSize: 14, cursor: "pointer",
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 16px 16px", textAlign: "center" }}>
        <button onClick={() => setShowImport(true)} style={{
          background: "none", border: "1px solid #2a4030", borderRadius: 8,
          color: "#4a6a4a", padding: "8px 20px", fontSize: 12, cursor: "pointer",
        }}>📥 Import sessions from another device</button>
      </div>

      <style>{`input[type="date"]::-webkit-calendar-picker-indicator,input[type="time"]::-webkit-calendar-picker-indicator{filter:invert(0.5)}`}</style>
    </div>
  );
}
// import button added below
