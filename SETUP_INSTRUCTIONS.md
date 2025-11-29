# Setup Instructions for SDP-Project

This file provides complete instructions for adding all remaining code files to complete the Civic Interaction Portal project.

## Current Status

✅ Files Already Pushed:
- `server/package.json`
- `server/.env`
- `server/server.js`
- `server/src/models/User.js`
- `README.md`
- `.gitignore`

## Remaining Files to Create

### Backend Files

#### 1. `server/src/models/Issue.js`
```javascript
const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  roleAtPost: String
}, { timestamps: true });

const IssueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["open", "in_progress", "resolved", "locked"],
    default: "open"
  },
  responses: [CommentSchema]
}, { timestamps: true });

module.exports = mongoose.model("Issue", IssueSchema);
```

#### 2. `server/src/middleware/auth.js`
```javascript
const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ msg: "No token" });
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ msg: "Invalid token" });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ msg: "Forbidden" });
    next();
  };
}

module.exports = { auth, authorize };
```

#### 3. `server/src/routes/auth.js`
```javascript
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User exists" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: role || "citizen" });
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ msg: "Invalid credentials" });
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
```

#### 4. `server/src/routes/issues.js`
```javascript
const router = require("express").Router();
const Issue = require("../models/Issue");
const User = require("../models/User");
const { auth, authorize } = require("../middleware/auth");

router.post("/", auth, authorize("citizen"), async (req, res) => {
  try {
    const issue = await Issue.create({
      title: req.body.title,
      description: req.body.description,
      citizen: req.user.id
    });
    res.json(issue);
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/", auth, async (req, res) => {
  const issues = await Issue.find().populate("citizen", "name");
  res.json(issues);
});

router.post("/:id/respond", auth, authorize("politician"), async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ msg: "Not found" });
    issue.responses.push({
      author: req.user.id,
      text: req.body.text,
      roleAtPost: req.user.role
    });
    if (req.body.status) issue.status = req.body.status;
    await issue.save();
    res.json(issue);
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/:id/lock", auth, authorize("moderator", "admin"), async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status: "locked" },
      { new: true }
    );
    res.json(issue);
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/admin/change-role", auth, authorize("admin"), async (req, res) => {
  const { userId, role } = req.body;
  const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
  res.json(user);
});

module.exports = router;
```

### Frontend Files (React)

#### 5. `client/src/api.js`
```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api"
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

#### 6. `client/src/AuthContext.js`
```javascript
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### 7. `client/src/components/Login.js`
```javascript
import { useContext, useState } from "react";
import api from "../api";
import { AuthContext } from "../AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      login(res.data);
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
      <button type="submit">Login</button>
    </form>
  );
}
```

#### 8. `client/src/components/IssueList.js`
```javascript
import { useEffect, useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../AuthContext";

export default function IssueList() {
  const [issues, setIssues] = useState([]);
  const { user } = useContext(AuthContext);

  const load = async () => {
    try {
      const res = await api.get("/issues");
      setIssues(res.data);
    } catch (err) {
      console.error("Error loading issues");
    }
  };

  useEffect(() => { load(); }, []);

  const respond = async (id) => {
    const text = prompt("Enter response");
    if (!text) return;
    try {
      await api.post(`/issues/${id}/respond`, { text, status: "in_progress" });
      load();
    } catch (err) {
      alert("Failed to respond");
    }
  };

  const lockIssue = async (id) => {
    try {
      await api.post(`/issues/${id}/lock`);
      load();
    } catch (err) {
      alert("Failed to lock issue");
    }
  };

  return (
    <div>
      <h2>Issues</h2>
      {issues.map(i => (
        <div key={i._id} style={{ border: "1px solid #ccc", margin: 8, padding: 8 }}>
          <h3>{i.title} ({i.status})</h3>
          <p>{i.description}</p>
          <p>Citizen: {i.citizen?.name}</p>
          {user?.role === "politician" && <button onClick={() => respond(i._id)}>Respond</button>}
          {(user?.role === "moderator" || user?.role === "admin") && <button onClick={() => lockIssue(i._id)}>Lock</button>}
          <h4>Responses</h4>
          <ul>
            {i.responses.map((r, idx) => (<li key={idx}>[{r.roleAtPost}] {r.text}</li>))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

#### 9. `client/src/components/NewIssue.js`
```javascript
import { useState } from "react";
import api from "../api";

export default function NewIssue({ onCreated }) {
  const [form, setForm] = useState({ title: "", description: "" });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/issues", form);
      setForm({ title: "", description: "" });
      onCreated && onCreated();
    } catch (err) {
      alert("Failed to create issue");
    }
  };

  return (
    <form onSubmit={submit}>
      <h2>Report Issue (Citizen)</h2>
      <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
      <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

#### 10. `client/src/App.js`
```javascript
import { useContext } from "react";
import { AuthProvider, AuthContext } from "./AuthContext";
import Login from "./components/Login";
import IssueList from "./components/IssueList";
import NewIssue from "./components/NewIssue";

function InnerApp() {
  const { user, logout } = useContext(AuthContext);

  if (!user) return <Login />;

  return (
    <div>
      <h1>Civic Interaction Portal</h1>
      <p>Logged in as {user.name} ({user.role})</p>
      <button onClick={logout}>Logout</button>
      {user.role === "citizen" && <NewIssue />}
      <IssueList />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}
```

## Installation & Running

### Backend
```bash
cd server
npm install
node server.js
```

### Frontend
```bash
cd client
npm install
npm start
```

## Summary

All files listed above need to be created in the specified locations using GitHub's web interface or by cloning the repository locally and pushing changes. Follow the file structure strictly to ensure the application works correctly.

**Total Files:** 10 remaining files to complete the project.
