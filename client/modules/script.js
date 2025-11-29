// JavaScript Module - State Management and Logic

const AppState = {
  currentUser: null,
  currentRole: null,
  issues: [
    { id: 1, title: 'Road Maintenance', description: 'Pothole on Main St', status: 'new', upvotes: 23, author: 'John Doe', date: '2024-01-15' },
    { id: 2, title: 'Street Lighting', description: 'Dark area at Park Ave', status: 'in-review', upvotes: 15, author: 'Jane Smith', date: '2024-01-14' },
    { id: 3, title: 'Park Cleaning', description: 'Litter in Central Park', status: 'resolved', upvotes: 8, author: 'Bob Johnson', date: '2024-01-10' }
  ],
  politicians: [
    { id: 1, name: 'Alex Chen', role: 'Councilor', district: 'District 1', issues_handled: 5 },
    { id: 2, name: 'Maria Garcia', role: 'Mayor', issues_handled: 12 }
  ]
};

function handleLogin(email, password, role) {
  if (email && password) {
    AppState.currentUser = email;
    AppState.currentRole = role;
    localStorage.setItem('currentUser', email);
    localStorage.setItem('currentRole', role);
    renderDashboard(role);
    return true;
  }
  return false;
}

function handleLogout() {
  AppState.currentUser = null;
  AppState.currentRole = null;
  localStorage.removeItem('currentUser');
  localStorage.removeItem('currentRole');
  renderLoginPage();
}

function submitIssue(title, description) {
  const newIssue = {
    id: AppState.issues.length + 1,
    title: title,
    description: description,
    status: 'new',
    upvotes: 0,
    author: AppState.currentUser,
    date: new Date().toISOString().split('T')[0]
  };
  AppState.issues.push(newIssue);
  return newIssue;
}

function upvoteIssue(issueId) {
  const issue = AppState.issues.find(i => i.id === issueId);
  if (issue) {
    issue.upvotes += 1;
    return true;
  }
  return false;
}

function renderLoginPage() {
  const root = document.getElementById('root');
  root.innerHTML = `
    <div class="login-container">
      <div class="login-box">
        <h1>Civic Interaction Portal</h1>
        <form id="loginForm">
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" placeholder="Enter your email" required>
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" placeholder="Enter your password" required>
          </div>
          <div class="form-group">
            <label for="role">Login as:</label>
            <select id="role" required>
              <option value="">Select Role</option>
              <option value="citizen">Citizen</option>
              <option value="politician">Politician</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Login</button>
        </form>
        <p class="demo-hint">Demo: Use any email and password</p>
      </div>
    </div>
  `;
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    handleLogin(email, password, role);
  });
}

function renderDashboard(role) {
  const root = document.getElementById('root');
  let dashboardHTML = `
    <div class="dashboard">
      <nav class="navbar">
        <div class="nav-left">
          <h2>Civic Portal - ${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</h2>
        </div>
        <div class="nav-right">
          <span>User: ${AppState.currentUser}</span>
          <button class="btn btn-secondary" id="logoutBtn">Logout</button>
        </div>
      </nav>
      <div class="content">
  `;

  if (role === 'citizen') {
    dashboardHTML += renderCitizenDashboard();
  } else if (role === 'politician') {
    dashboardHTML += renderPoliticianDashboard();
  } else if (role === 'moderator') {
    dashboardHTML += renderModeratorDashboard();
  } else if (role === 'admin') {
    dashboardHTML += renderAdminDashboard();
  }

  dashboardHTML += `
      </div>
    </div>
  `;
  root.innerHTML = dashboardHTML;
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

function renderCitizenDashboard() {
  let html = '<div class="citizen-section"><h3>Submit New Issue</h3>';
  html += '<form id="issueForm"><textarea id="issueTitle" placeholder="Issue title" required></textarea>';
  html += '<textarea id="issueDesc" placeholder="Description" required></textarea>';
  html += '<button type="submit" class="btn btn-primary">Submit Issue</button></form>';
  html += '<h3>Recent Issues</h3><div class="issues-grid">';
  AppState.issues.forEach(issue => {
    html += `<div class="issue-card"><h4>${issue.title}</h4><p>${issue.description}</p>`;
    html += `<span class="status status-${issue.status}">${issue.status}</span>`;
    html += `<p>Upvotes: ${issue.upvotes}</p></div>`;
  });
  html += '</div></div>';
  return html;
}

function renderPoliticianDashboard() {
  let html = '<div class="politician-section"><h3>Active Issues to Review</h3>';
  html += '<table class="issues-table"><tr><th>Issue</th><th>Status</th><th>Upvotes</th><th>Action</th></tr>';
  AppState.issues.forEach(issue => {
    html += `<tr><td>${issue.title}</td><td>${issue.status}</td><td>${issue.upvotes}</td>`;
    html += '<td><button class="btn btn-small">Review</button></td></tr>';
  });
  html += '</table></div>';
  return html;
}

function renderModeratorDashboard() {
  let html = '<div class="moderator-section"><h3>Moderation Queue</h3>';
  html += '<div class="issues-grid">';
  AppState.issues.forEach(issue => {
    html += `<div class="issue-card"><h4>${issue.title}</h4><p>${issue.description}</p>`;
    html += `<button class="btn btn-primary">Approve</button>`;
    html += `<button class="btn btn-danger">Reject</button></div>`;
  });
  html += '</div></div>';
  return html;
}

function renderAdminDashboard() {
  let html = '<div class="admin-section"><h3>System Statistics</h3>';
  html += '<div class="stats"><div class="stat-box">';
  html += `<h4>Total Issues</h4><p>${AppState.issues.length}</p></div>`;
  html += '<div class="stat-box"><h4>Active Users</h4><p>245</p></div>';
  html += '<div class="stat-box"><h4>Resolved Issues</h4><p>' + AppState.issues.filter(i => i.status === 'resolved').length + '</p></div>';
  html += '</div></div>';
  return html;
}

function initApp() {
  const savedUser = localStorage.getItem('currentUser');
  const savedRole = localStorage.getItem('currentRole');
  if (savedUser && savedRole) {
    AppState.currentUser = savedUser;
    AppState.currentRole = savedRole;
    renderDashboard(savedRole);
  } else {
    renderLoginPage();
  }
}

window.addEventListener('DOMContentLoaded', initApp);
