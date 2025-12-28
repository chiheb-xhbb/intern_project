# Gestion des Réclamations - Complaint Management System

A full-stack web application for managing customer complaints (réclamations) in a banking environment. Built with React (frontend) and Laravel (backend).

## 🚀 Features

- **User Authentication**: Secure login system with role-based access (Admin/Client)
- **Complaint Management**: Create, view, update, and track complaint status
- **File Attachments**: Upload and manage supporting documents
- **Admin Dashboard**: Statistics and overview of all complaints
- **Client Interface**: Personal dashboard for clients to manage their complaints
- **Status Tracking**: Real-time status updates with history
- **Bank Account Integration**: Link complaints to specific bank accounts

## 📋 Prerequisites

- PHP >= 8.2
- Composer
- Node.js >= 16.x and npm
- MySQL or compatible database
- Laravel 12.x

## 🛠️ Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd gestion-reclamations-backend
```

2. Install PHP dependencies:
```bash
composer install
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Generate application key:
```bash
php artisan key:generate
```

5. Configure your `.env` file with database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestion_reclamations
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

6. Run migrations:
```bash
php artisan migrate
```

7. Start the Laravel development server:
```bash
php artisan serve
```

The backend API will be available at `http://127.0.0.1:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
REACT_APP_API_URL=http://127.0.0.1:8000/api
```

4. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## 🔐 Authentication

The application uses Laravel Sanctum for API authentication. Tokens are automatically managed via axios interceptors in the frontend.

### User Roles

- **Admin**: Full access to all complaints, clients, and dashboard statistics
- **Client**: Access to their own complaints and profile information

## 📁 Project Structure

```
INTERN_PROJECT/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── api/             # API configuration (axios)
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   └── App.js          # Main app component with routing
│   └── package.json
│
└── gestion-reclamations-backend/  # Laravel backend API
    ├── app/
    │   ├── Http/Controllers/  # API controllers
    │   ├── Models/           # Eloquent models
    │   └── Policies/        # Authorization policies
    ├── routes/
    │   └── api.php          # API routes
    └── database/
        └── migrations/      # Database migrations
```

## 🔒 Security Features

- **CORS Configuration**: Environment-based allowed origins (no wildcards in production)
- **File Upload Validation**: Restricted file types and size limits (5MB max)
- **Input Validation**: Server-side validation on all endpoints
- **Authorization Policies**: Role-based access control using Laravel Policies
- **Token-based Authentication**: Secure API authentication with Laravel Sanctum
- **Password Hashing**: Bcrypt password hashing

## 🧪 Testing

### Backend Tests
```bash
cd gestion-reclamations-backend
php artisan test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/login` - User login
- `GET /api/me` - Get authenticated user
- `POST /api/logout` - Logout (revoke token)
- `POST /api/change-password` - Change password

### Complaint Endpoints (Protected)
- `GET /api/reclamations` - List all complaints (Admin)
- `GET /api/reclamations/mine` - Get user's complaints (Client)
- `POST /api/reclamations` - Create new complaint
- `GET /api/reclamations/{id}` - Get complaint details
- `PUT /api/reclamations/{id}/statut` - Update complaint status
- `DELETE /api/reclamations/{id}` - Delete complaint

### Client Endpoints (Protected)
- `GET /api/clients` - List all clients (Admin)
- `GET /api/clients/{id}` - Get client details
- `PUT /api/clients/{id}` - Update client information

## 🚀 Deployment

### Production Checklist

1. **Backend**:
   - Set `APP_ENV=production` in `.env`
   - Set `APP_DEBUG=false`
   - Configure proper CORS allowed origins
   - Set up proper database credentials
   - Run `php artisan config:cache`
   - Run `php artisan route:cache`

2. **Frontend**:
   - Update `REACT_APP_API_URL` to production API URL
   - Build for production: `npm run build`
   - Serve the `build` directory

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 👥 Authors

- Intern Project Team

## 🙏 Acknowledgments

- Laravel Framework
- React Community
- Bootstrap for UI components

