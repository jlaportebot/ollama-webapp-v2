const express = require("express");
const Database = require("better-sqlite3");
const http = require("http");
const si = require("systeminformation");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const db = new Database("chat.db");
db.pragma("foreign_keys = ON");

// ─── DB ─────────────────────────────────────────────
db.prepare(`
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT,
  model TEXT,
  title TEXT DEFAULT 'New chat',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER,
  role TEXT,
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
)`).run();

function getIP(req) {
  return req.socket.remoteAddress;
}

// ─── ACTIVE USER TRACKING ────────────────────────────────────────
const activeStreamers = new Set();  // IPs currently in an open SSE stream
const recentActivity  = new Map();  // ip → last message timestamp

function getLiveUserCount() {
  const cutoff = Date.now() - 5 * 60 * 1000; // 5-min window
  const recent = new Set([...activeStreamers]);
  for (const [ip, ts] of recentActivity)
    if (ts > cutoff) recent.add(ip);
  return recent.size;
}

// ─── HEALTH + MODELS ────────────────────────────────
app.get("/api/health", (req, res) => {
  http.get("http://localhost:11434/api/tags", r => {
    let data = "";
    r.on("data", c => data += c);
    r.on("end", () => {
      try {
        const json = JSON.parse(data);
        res.json({
          ok: true,
          models: (json.models || []).map(m => m.name)
        });
      } catch {
        res.json({ ok: false, models: [] });
      }
    });
  }).on("error", () => {
    res.json({ ok: false, models: [] });
  });
});

// ─── SYSTEM STATS ────────────────────────────────────────────────
app.get("/api/stats", async (req, res) => {
  try {
    const [load, mem, temp] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.cpuTemperature()
    ]);

    res.json({
      cpu: {
        total: Math.round(load.currentLoad),
        cores: load.cpus.map(c => Math.round(c.load))
      },
      ram: {
        total:   mem.total,
        used:    mem.used,
        percent: Math.round((mem.used / mem.total) * 100)
      },
      temp: {
        main:  temp.main  ?? null,
        cores: temp.cores ?? []
      },
      users: getLiveUserCount()
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── CONVERSATIONS ──────────────────────────────────
app.get("/api/conversations", (req, res) => {
  const rows = db.prepare(
    "SELECT * FROM conversations WHERE ip = ? ORDER BY created_at DESC"
  ).all(getIP(req));

  res.json(rows);
});

app.post("/api/conversations", (req, res) => {
  const { model } = req.body;

  const result = db.prepare(
    "INSERT INTO conversations (ip, model) VALUES (?, ?)"
  ).run(getIP(req), model);

  const convo = db.prepare(
    "SELECT * FROM conversations WHERE id = ?"
  ).get(result.lastInsertRowid);

  res.json(convo);
});

app.delete("/api/conversations/:id", (req, res) => {
  db.prepare(
    "DELETE FROM conversations WHERE id = ? AND ip = ?"
  ).run(req.params.id, getIP(req));

  res.json({ ok: true });
});

// ─── MESSAGES ───────────────────────────────────────
app.get("/api/conversations/:id/messages", (req, res) => {
  const convo = db.prepare(
    "SELECT * FROM conversations WHERE id = ? AND ip = ?"
  ).get(req.params.id, getIP(req));

  if (!convo) return res.status(403).end();

  const msgs = db.prepare(
    "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at"
  ).all(req.params.id);

  res.json(msgs);
});

// ─── CHAT (STREAMING) ────────────────────────────────
app.post("/api/conversations/:id/chat", (req, res) => {
  const { message } = req.body;
  const id = req.params.id;
  const ip = getIP(req);

  const convo = db.prepare(
    "SELECT * FROM conversations WHERE id = ? AND ip = ?"
  ).get(id, ip);

  if (!convo) return res.status(403).end();

  // Track this IP as actively streaming
  activeStreamers.add(ip);
  recentActivity.set(ip, Date.now());

  const history = db.prepare(
    "SELECT role, content FROM messages WHERE conversation_id = ?"
  ).all(id);

  const payload = JSON.stringify({
    model: convo.model,
    messages: [...history, { role: "user", content: message }],
    stream: true
  });

  const ollamaReq = http.request({
    hostname: "localhost",
    port: 11434,
    path: "/api/chat",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload)
    }
  }, (ollamaRes) => {

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let buffer = "";
    let full = "";

    ollamaRes.on("data", chunk => {
      buffer += chunk.toString();

      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const json = JSON.parse(line);

          if (json.message?.content) {
            full += json.message.content;
            res.write(`data: ${JSON.stringify({ token: json.message.content })}\n\n`);
          }

          if (json.done) {
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          }
        } catch {}
      }
    });

    ollamaRes.on("end", () => {
      activeStreamers.delete(ip);
      res.end();

      db.prepare(
        "INSERT INTO messages (conversation_id, role, content) VALUES (?, 'user', ?)"
      ).run(id, message);

      db.prepare(
        "INSERT INTO messages (conversation_id, role, content) VALUES (?, 'assistant', ?)"
      ).run(id, full);

      // auto title
      if (convo.title === "New chat") {
        db.prepare(
          "UPDATE conversations SET title = ? WHERE id = ?"
        ).run(message.slice(0, 40), id);
      }
    });
  });

  ollamaReq.on("error", err => {
    activeStreamers.delete(ip);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  });

  ollamaReq.write(payload);
  ollamaReq.end();
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});