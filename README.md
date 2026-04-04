# iMentorsPro - Digital Mentorship Platform

A world-class digital mentorship platform built with Nuxt 4 and NuxtUI v3, featuring role-specific dashboards for mentors, mentees, and administrators.

## 🚀 Features

### **Role-Specific Dashboards**
- **Mentee Dashboard**: Session tracking, mentor discovery, learning progress
- **Mentor Dashboard**: Earnings overview, mentee management, performance metrics
- **Admin Dashboard**: Platform analytics, user management, system monitoring

### **Core Functionality**
- **Authentication System**: Role-based signup/login with persistent sessions
- **Mentor Discovery**: Advanced filtering by skills, categories, ratings, and availability
- **Session Booking**: Interactive calendar with confirmation workflows
- **Real-time Messaging**: Conversation management with typing indicators
- **Profile Management**: Comprehensive profile editing with completion tracking

### **UI/UX Excellence**
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Dark Mode Support**: Automatic theme switching
- **Modern Animations**: Smooth transitions and micro-interactions
- **Professional Polish**: Consistent branding and typography

## 🛠 Setup

Install dependencies:

```bash
npm install
```

## 🔧 Development

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 🧪 Testing Different Roles

### Demo Credentials
Use these emails to test different dashboard views:

- **Mentee**: `demo@example.com` (default)
- **Mentor**: `mentor@example.com` 
- **Admin**: `admin@example.com`

Password for all: `password123`

### Role-Based Features

**Mentee Dashboard:**
- Browse and filter mentors
- Book sessions with calendar integration
- Track learning progress and goals
- Message mentors directly

**Mentor Dashboard:**
- View earnings and session analytics
- Manage mentee relationships
- Set availability and pricing
- Track performance metrics

**Admin Dashboard:**
- Monitor platform-wide metrics
- Manage users and permissions
- View system health indicators
- Handle pending approvals

## 📁 Project Structure

```
app/
├── components/          # Reusable UI components
│   ├── AppHeader.vue   # Navigation header
│   ├── DashboardMentor.vue
│   └── DashboardAdmin.vue
├── composables/        # State management
│   ├── useAuth.ts      # Authentication logic
│   └── useMentors.ts   # Mentor data management
├── layouts/            # Page layouts
│   ├── default.vue     # Main app layout
│   └── auth.vue        # Authentication pages layout
├── middleware/         # Route protection
│   └── auth.ts         # Authentication middleware
├── pages/              # Application routes
│   ├── auth/           # Authentication pages
│   ├── mentors/        # Mentor discovery and profiles
│   ├── dashboard.vue   # Role-aware dashboard router
│   ├── sessions.vue    # Session management
│   ├── messages.vue    # Messaging interface
│   └── profile/        # Profile management
└── types/              # TypeScript definitions
    └── index.ts        # Core type definitions
```

## 🎨 Design System

Built with **NuxtUI v3** components featuring:
- Consistent color palette with blue/purple gradients
- Modern card-based layouts
- Smooth hover effects and transitions
- Accessible form controls and navigation
- Professional typography hierarchy

## 🔮 Future Enhancements

The architecture supports easy integration of:
- Real backend API connections
- Video calling functionality
- Payment processing
- Advanced analytics
- Mobile app development
- Multi-language support

## 📄 License

MIT License - Built for demonstration and educational purposes.
