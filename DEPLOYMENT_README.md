# Kusanyiko - Member Management System

A full-stack web application for managing church/organization members with profile pictures, built with Django REST Framework and React.

## 🚀 Live Demo

- **Backend API**: [Your Render Backend URL]
- **Frontend App**: [Your Render Frontend URL]

## 🛠️ Technology Stack

### Backend
- **Django 4.2.7** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Database
- **Gunicorn** - WSGI server
- **WhiteNoise** - Static file serving
- **Pillow** - Image processing

### Frontend
- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Redux Toolkit** - State management
- **React Hook Form** - Form handling

## 📋 Features

- **User Authentication** - JWT-based auth with role management
- **Member Management** - CRUD operations for member data
- **Profile Pictures** - Upload and manage member photos
- **Multi-step Forms** - Intuitive member registration
- **Responsive Design** - Mobile-first approach
- **Search & Filter** - Advanced member search capabilities
- **Data Export** - Export member data to CSV
- **Real-time Updates** - Live data synchronization

## 🔧 Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 16+
- PostgreSQL 12+

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/MrINstructor333/kusanyiko.git
cd kusanyiko

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up database
cd kusanyikoo
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### Frontend Setup
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm start
```

## 🌐 Deployment on Render

### Backend Deployment

1. **Create a new Web Service** on Render
2. **Connect your GitHub repository**
3. **Configure the service:**
   - **Build Command**: `./build.sh`
   - **Start Command**: `cd kusanyikoo && gunicorn kusanyikoo.wsgi:application --bind 0.0.0.0:$PORT --workers 3`
   - **Environment**: Python 3.11

4. **Set Environment Variables:**
   ```
   SECRET_KEY=your-secret-key-here
   DEBUG=False
   DATABASE_URL=postgresql://user:password@host:port/database
   RENDER_EXTERNAL_HOSTNAME=your-app-name.onrender.com
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```

5. **Create PostgreSQL Database**:
   - Add a PostgreSQL service on Render
   - Copy the DATABASE_URL to your web service environment variables

### Frontend Deployment

1. **Create a new Static Site** on Render
2. **Connect your GitHub repository**
3. **Configure the build:**
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`

4. **Set Environment Variables:**
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

## 📱 Mobile Development

The application includes mobile camera integration for profile pictures:

- **Camera access** for taking photos
- **File upload** from device gallery
- **Image preview** and cropping
- **Responsive design** for all screen sizes

## 🔐 Environment Variables

### Backend (.env)
```
SECRET_KEY=your-django-secret-key
DEBUG=False
DATABASE_URL=postgresql://user:password@host:port/database
FRONTEND_URL=https://your-frontend-domain.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Frontend (.env)
```
REACT_APP_API_URL=https://your-api-domain.com
```

## 📊 Database Schema

### User Model
- Authentication and role management
- Admin/Registrant roles

### Member Model
- Personal information
- Contact details
- Church/organization data
- Profile pictures

### Analytics Model
- Usage statistics
- Member registration tracking

## 🛡️ Security Features

- **JWT Authentication** with refresh tokens
- **CORS protection** configured for production
- **Rate limiting** on API endpoints
- **Input validation** and sanitization
- **Secure file uploads** with type checking

## 📈 Performance Optimizations

- **Image compression** for profile pictures
- **Lazy loading** for member lists
- **Pagination** for large datasets
- **Static file caching** with WhiteNoise
- **Database query optimization**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@kusanyiko.org

## 🙏 Acknowledgments

- Django REST Framework team
- React and TypeScript communities
- Tailwind CSS for styling
- Render for hosting platform