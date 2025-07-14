# Young Eagles PWA

A modern Progressive Web App (PWA) for educational management, built with React and optimized for mobile devices.

## Features

- 📱 **Progressive Web App**: Install on mobile devices for native app experience
- 🎓 **Educational Management**: Homework tracking, student progress, and class management
- 👨‍👩‍👧‍👦 **Multi-User Support**: Parents, teachers, students, and administrators
- 🎨 **Modern UI**: Responsive design with dark/light theme support
- 🔄 **Real-time Updates**: Live notifications and progress tracking
- 💳 **Payment Integration**: Subscription management and payment processing
- 📊 **Analytics**: Comprehensive progress tracking and reporting
- 🌐 **Offline Support**: Works without internet connection

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **State Management**: React Context API
- **Animations**: Framer Motion
- **PWA**: Workbox Service Worker
- **Build Tool**: Vite
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd YoungEagles_PWA
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3002](http://localhost:3002) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run serve` - Build and serve production
- `npm run lint` - Run ESLint
- `npm run test:build` - Test production build

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React Context providers
├── hooks/          # Custom React hooks
├── pages/          # Route components
├── services/       # API and external services
├── utils/          # Utility functions
└── styles/         # Global styles
```

## User Roles

- **Students**: Complete homework, track progress, submit assignments
- **Parents**: Monitor children's progress, manage payments, communicate with teachers
- **Teachers**: Create assignments, grade work, manage classes
- **Administrators**: User management, payment verification, system analytics

## PWA Features

- **Installation**: Can be installed on mobile devices
- **Offline Support**: Works without internet connection
- **Push Notifications**: Real-time updates and reminders
- **Native Feel**: App-like experience on mobile devices

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact [your-email@example.com](mailto:your-email@example.com)
