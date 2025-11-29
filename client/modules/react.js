// React Component Module - Civic Interaction Portal

import React, { useState, useEffect } from 'react';

// Main App Component
const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [issues, setIssues] = useState([
    { id: 1, title: 'Road Maintenance', description: 'Pothole on Main St', status: 'new', upvotes: 23, author: 'John Doe', date: '2024-01-15' },
    { id: 2, title: 'Street Lighting', description: 'Dark area at Park Ave', status: 'in-review', upvotes: 15, author: 'Jane Smith', date: '2024-01-14' },
    { id: 3, title: 'Park Cleaning', description: 'Litter in Central Park', status: 'resolved', upvotes: 8, author: 'Bob Johnson', date: '2024-01-10' }
  ]);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedRole = localStorage.getItem('currentRole');
    if (savedUser && savedRole) {
      setCurrentUser(savedUser);
      setCurrentRole(savedRole);
    }
  }, []);

  const handleLogin = (email, role) => {
    setCurrentUser(email);
    setCurrentRole(role);
    localStorage.setItem('currentUser', email);
    localStorage.setItem('currentRole', role);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentRole');
  };

  const submitIssue = (title, description) => {
    const newIssue = {
      id: issues.length + 1,
      title,
      description,
      status: 'new',
      upvotes: 0,
      author: currentUser,
      date: new Date().toISOString().split('T')[0]
    };
    setIssues([...issues, newIssue]);
  };

  const upvoteIssue = (issueId) => {
    setIssues(issues.map(issue =>
      issue.id === issueId ? { ...issue, upvotes: issue.upvotes + 1 } : issue
    ));
  };

  if (!currentUser) {
    return <LoginComponent onLogin={handleLogin} />;
  }

  return (
    <Dashboard
      user={currentUser}
      role={currentRole}
      issues={issues}
      onLogout={handleLogout}
      onSubmitIssue={submitIssue}
      onUpvote={upvoteIssue}
    />
  );
};

// Login Component
const LoginComponent = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
        // Email validation - must contain @ and valid domain
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address (e.g., user@gmail.com)');
      return;
    }
    if (email && role) {
      onLogin(email, role);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Civic Interaction Portal</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Login as:</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select Role</option>
              <option value="citizen">Citizen</option>
              <option value="politician">Politician</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
        <p className="demo-hint">Demo: Use any email</p>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ user, role, issues, onLogout, onSubmitIssue, onUpvote }) => {
  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-left">
          <h2>Civic Portal - {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</h2>
        </div>
        <div className="nav-right">
          <span>User: {user}</span>
          <button className="btn btn-secondary" onClick={onLogout}>Logout</button>
        </div>
      </nav>
      <div className="content">
        {role === 'citizen' && <CitizenDashboard issues={issues} onSubmitIssue={onSubmitIssue} onUpvote={onUpvote} />}
        {role === 'politician' && <PoliticianDashboard issues={issues} />}
        {role === 'moderator' && <ModeratorDashboard issues={issues} />}
        {role === 'admin' && <AdminDashboard issues={issues} />}
      </div>
    </div>
  );
};

// Citizen Dashboard Component
const CitizenDashboard = ({ issues, onSubmitIssue, onUpvote }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title && description) {
      onSubmitIssue(title, description);
      setTitle('');
      setDescription('');
    }
  };

  return (
    <div className="citizen-section">
      <h3>Submit New Issue</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Issue title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary">Submit Issue</button>
      </form>
      <h3>Recent Issues</h3>
      <div className="issues-grid">
        {issues.map(issue => (
          <div key={issue.id} className="issue-card">
            <h4>{issue.title}</h4>
            <p>{issue.description}</p>
            <span className={`status status-${issue.status}`}>{issue.status}</span>
            <p>Upvotes: {issue.upvotes}</p>
            <button onClick={() => onUpvote(issue.id)} className="btn btn-small">👍 Upvote</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Politician Dashboard Component
const PoliticianDashboard = ({ issues }) => {
  return (
    <div className="politician-section">
      <h3>Active Issues to Review</h3>
      <table className="issues-table">
        <thead>
          <tr>
            <th>Issue</th>
            <th>Status</th>
            <th>Upvotes</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {issues.map(issue => (
            <tr key={issue.id}>
              <td>{issue.title}</td>
              <td>{issue.status}</td>
              <td>{issue.upvotes}</td>
              <td><button className="btn btn-small">Review</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Moderator Dashboard Component
const ModeratorDashboard = ({ issues }) => {
  return (
    <div className="moderator-section">
      <h3>Moderation Queue</h3>
      <div className="issues-grid">
        {issues.map(issue => (
          <div key={issue.id} className="issue-card">
            <h4>{issue.title}</h4>
            <p>{issue.description}</p>
            <button className="btn btn-primary">Approve</button>
            <button className="btn btn-danger">Reject</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard = ({ issues }) => {
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;

  return (
    <div className="admin-section">
      <h3>System Statistics</h3>
      <div className="stats">
        <div className="stat-box">
          <h4>Total Issues</h4>
          <p>{issues.length}</p>
        </div>
        <div className="stat-box">
          <h4>Active Users</h4>
          <p>245</p>
        </div>
        <div className="stat-box">
          <h4>Resolved Issues</h4>
          <p>{resolvedCount}</p>
        </div>
      </div>
    </div>
  );
};

export default App;
