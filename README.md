# SDP-Project: Civic Interaction Portal

A multi-role web application built with the MERN stack (MongoDB, Express, React, Node.js) that enables citizens, politicians, and moderators to interact on civic issues in a structured and organized manner.

## Project Overview

The Civic Interaction Portal is designed to facilitate meaningful dialogue between citizens and political representatives. It provides a platform where:

- **Citizens** can report civic issues and concerns
- **Politicians** can respond to and address citizen issues
- **Moderators** can manage discussions and prevent abuse
- **Admins** can manage users and roles

## Features

### Multi-Role Access Control
- **Citizen Role**: Create and view issues, post comments
- **Politician Role**: View all issues, post official responses and updates
- **Moderator Role**: Monitor conversations, delete abusive content, lock discussions
- **Admin Role**: Manage users and assign/modify roles

### Core Functionality
- JWT-based authentication and authorization
- Role-based access control (RBAC)
- Issue creation and tracking
- Response management with role tracking
- Issue locking mechanism for conflict resolution
- Real-time status updates

## Project Structure

```
sdp-project/
├── server/                          # Backend (Node.js + Express)
│   ├── src/
│   │   ├── models/                  # MongoDB schemas
│   │   │   ├── User.js              # User model with roles
│   │   │   └── Issue.js             # Issue and comment models
│   │   ├── routes/                  # API endpoints
│   │   │   ├── auth.js              # Authentication routes
│   │   │   └── issues.js            # Issue management routes
│   │   └── middleware/              # Custom middleware
│   │       └── auth.js              # JWT and RBAC middleware
│   ├── server.js                    # Express server entry point
│   ├── package.json                 # Backend dependencies
│   └── .env                         # Environment variables
│
├── client/                          # Frontend (React)
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── Login.js             # Login form
│   │   │   ├── IssueList.js         # Issues display
│   │   │   └── NewIssue.js          # Issue creation form
│   │   ├── App.js                   # Main app component
│   │   ├── AuthContext.js           # Authentication context
│   │   └── api.js                   # API client configuration
│   ├── package.json                 # Frontend dependencies
│   └── public/                      # Static files
│
├── .gitignore                       # Git ignore rules
└── README.md                        # This file

## Tech Stack

**Backend:**
- Node.js - JavaScript runtime
- Express.js - Web framework
- MongoDB - NoSQL database
- Mongoose - MongoDB ODM
- JWT - Authentication
- bcryptjs - Password hashing
- CORS - Cross-origin requests

**Frontend:**
- React - UI library
- Axios - HTTP client
- React Context - State management
- HTML5 & CSS3 - Markup and styling

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file with configuration
cat > .env << EOF
MONGO_URI=mongodb://localhost:27017/civic_portal
JWT_SECRET=your_secret_key_here
PORT=5000
EOF

# Start the server
npm start
# Or for development with nodemon
npm run dev
```

### Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start the React development server
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Issues
- `GET /api/issues` - Get all issues (requires authentication)
- `POST /api/issues` - Create new issue (citizen only)
- `POST /api/issues/:id/respond` - Add response to issue (politician only)
- `POST /api/issues/:id/lock` - Lock issue (moderator/admin only)
- `POST /api/issues/admin/change-role` - Change user role (admin only)

## Usage Examples

### Creating an Account
1. Navigate to the login page
2. Fill in name, email, password, and select a role
3. Submit the form

### Reporting an Issue (Citizen)
1. Log in as a citizen
2. Fill in the issue title and description
3. Submit to create the issue

### Responding to an Issue (Politician)
1. Log in as a politician
2. View the issue list
3. Click "Respond" on an issue
4. Enter your response and optional status update

### Managing Discussions (Moderator)
1. Log in as a moderator
2. Review issue discussions
3. Use "Lock" button to prevent further responses on problematic issues

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based access control
- Protected API endpoints
- CORS configuration
- Environment variable protection

## Error Handling

The application includes comprehensive error handling:
- Invalid credentials detection
- Role validation
- Database connection errors
- Server error responses
- Client-side validation

## Future Enhancements

- Email notifications for issue updates
- Advanced filtering and search
- User profiles and reputation system
- Issue categories and tags
- Analytics dashboard
- Real-time notifications with WebSocket
- Document attachments
- Advanced moderation tools

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@civicportal.com or open an issue on GitHub.

## Authors

Developed as part of the Software Development Project (SDP) course.

---

**Note:** This is a demonstration project. In production, ensure proper security measures, data validation, and compliance with regulations.
