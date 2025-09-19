# 🥊 Gym Power - PHP Backend Setup

## 📋 Overview
This document explains how to set up and use the PHP backend for the Gym Power application.

## 🛠️ Prerequisites

### Required Software
- **XAMPP** or **WAMP** (includes Apache, MySQL, PHP)
- **MySQL** database
- **Web browser** (Chrome, Firefox, Edge)

### Recommended Versions
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache 2.4 or higher

## 🚀 Installation Steps

### 1. Download and Install XAMPP
1. Download XAMPP from [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Install XAMPP with Apache, MySQL, and PHP components
3. Start Apache and MySQL services from XAMPP Control Panel

### 2. Setup Project Files
1. Copy the entire project folder to your XAMPP's `htdocs` directory:
   ```
   C:\xampp\htdocs\gym-power\
   ```

2. The project structure should look like:
   ```
   C:\xampp\htdocs\gym-power\
   ├── index.html
   ├── backend/
   │   ├── api/
   │   ├── config/
   │   ├── models/
   │   ├── database/
   │   └── utils/
   ├── css/
   ├── js/
   └── ...
   ```

### 3. Database Setup
1. Open your web browser and go to: `http://localhost/gym-power/backend/setup.php`
2. This will automatically:
   - Create the `gym_power` database
   - Create all necessary tables
   - Insert the default admin user
   - Set up indexes and constraints

**Alternative Manual Setup:**
1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Create a new database named `gym_power`
3. Import the SQL file: `backend/database/schema.sql`

### 4. Frontend Integration
The frontend has been automatically updated to use the PHP backend. The `index.html` file now references:
- `js/api.js` - API communication layer
- `js/app-php.js` - Main application logic
- `js/auth-php.js` - Authentication handling
- `js/admin-php.js` - Admin panel functionality

No manual file replacement is needed.

### 5. Configuration
1. Update database configuration in `backend/config/database.php` if needed:
   ```php
   private $host = 'localhost';
   private $db_name = 'gym_power';
   private $username = 'root';
   private $password = '';
   ```

2. Update API base URL in `js/api.js` if needed:
   ```javascript
   this.baseURL = 'http://localhost/gym-power/backend';
   ```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth.php?action=login` - User login
- `POST /api/auth.php?action=signup` - User registration

### Users
- `GET /api/users.php` - Get all users
- `GET /api/users.php?id={id}` - Get specific user
- `POST /api/users.php` - Create new user
- `PUT /api/users.php?id={id}` - Update user
- `DELETE /api/users.php?id={id}` - Delete user

### Tournaments
- `GET /api/tournaments.php` - Get all tournaments
- `GET /api/tournaments.php?id={id}` - Get specific tournament
- `GET /api/tournaments.php?id={id}&action=participants` - Get tournament participants
- `POST /api/tournaments.php` - Create tournament
- `POST /api/tournaments.php?action=participate` - Join tournament
- `PUT /api/tournaments.php?id={id}` - Update tournament
- `DELETE /api/tournaments.php?id={id}` - Delete tournament

### Fights
- `GET /api/fights.php` - Get all fights
- `GET /api/fights.php?tournament_id={id}` - Get fights by tournament
- `POST /api/fights.php?action=organize` - Organize fights for tournament
- `PUT /api/fights.php?id={id}` - Update fight
- `DELETE /api/fights.php?id={id}` - Delete fight

### Notifications
- `GET /api/notifications.php?user_id={id}` - Get user notifications
- `GET /api/notifications.php?user_id={id}&action=unread-count` - Get unread count
- `POST /api/notifications.php` - Create notification
- `PUT /api/notifications.php?id={id}&action=mark-read` - Mark as read

### File Upload
- `POST /api/upload.php` - Upload files (images)

## 🧪 Testing

### 1. Test Database Connection
Visit: `http://localhost/gym-power/backend/api/status`
Should return API status information.

### 2. Test Authentication
1. Go to: `http://localhost/gym-power/`
2. Login with default admin:
   - **Email:** admin@admin.com
   - **Password:** admin123

### 3. Test Features
1. **Admin Panel:** Create users, tournaments, organize fights
2. **User Registration:** Create a new fighter account
3. **Tournament Participation:** Join tournaments as a fighter
4. **Fight Organization:** Use the smart matching algorithm

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Error
- Ensure MySQL is running in XAMPP
- Check database credentials in `config/database.php`
- Verify database exists and tables are created

#### 2. CORS Errors
- Ensure `.htaccess` file is in the backend directory
- Check that Apache mod_rewrite is enabled
- Access the application through `http://localhost/` not `file://`

#### 3. File Upload Issues
- Check that `uploads/` directory exists and is writable
- Verify PHP file upload settings in `php.ini`
- Ensure file size limits are appropriate

#### 4. API Not Found Errors
- Verify the API base URL in `js/api.js`
- Check that all API files are in the correct directories
- Ensure Apache is serving PHP files correctly

### Debug Steps
1. Check browser console for JavaScript errors
2. Check Apache error logs in XAMPP
3. Enable PHP error reporting in development
4. Test API endpoints directly using a tool like Postman

## 🔒 Security Notes

### For Production
1. **Change default admin password**
2. **Hash passwords** (currently stored as plain text for development)
3. **Update database credentials**
4. **Enable HTTPS**
5. **Validate and sanitize all inputs**
6. **Set up proper file upload restrictions**

### Current Security Features
- Input sanitization for database queries
- CORS headers for cross-origin requests
- Admin access restrictions
- File type and size validation for uploads

## 📚 Additional Features

### Smart Fight Matching Algorithm
- **Weight difference:** Maximum 5kg
- **Age difference:** Maximum 3 years
- **Optimal pairing:** Finds best compatible matches
- **Detailed feedback:** Shows matched and unmatched fighters

### Notification System
- **Automatic notifications** for fight assignments
- **Detailed fight information** with opponent details
- **Real-time updates** for tournament participation

### File Management
- **Profile photos** for users
- **Tournament images** for events
- **Automatic file organization** by type
- **Secure file storage** in uploads directory

## 🚀 Next Steps

1. **Test all functionality** thoroughly
2. **Customize styling** if needed
3. **Add additional features** as required
4. **Deploy to production server** when ready
5. **Set up proper backup procedures**

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all installation steps were followed
3. Test with the default admin account first
4. Check browser developer tools for errors

The PHP backend provides all the same functionality as the original version with improved performance and local control!
