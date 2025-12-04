# Rodactiva Website

Modern website for Rodactiva adventure sports association, built with Vite, React, Tailwind CSS, and Firebase.

## 🚀 Features

- **Modern Design**: Hybrid minimalist + dynamic adventure aesthetic
- **Responsive Layout**: Mobile-first approach optimized for all devices
- **Dark Mode**: User preference-based theme switching
- **Firebase Integration**:
  - Firestore for real-time data management
  - Firebase Storage for images and files
  - Firebase Analytics for user tracking
  - Firebase AppCheck for security
- **Real-time Data**: All content synced with Firestore
- **SEO Optimized**: Meta tags and structured data
- **Accessibility**: ARIA roles and semantic HTML

## 📋 Pages

- **Home**: Landing page with featured events
- **About**: Organization history and mission
- **Activities**: Event listings with filtering
- **Routes**: GPS routes for download
- **Gallery**: Photos, videos, and posters
- **Members**: Team information
- **Contact**: Contact form and information

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS 4
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Analytics**: Firebase Analytics
- **Language**: TypeScript
- **Package Manager**: npm

## 📦 Installation

### Prerequisites

- Node.js 22.x or higher
- npm 10.x or higher
- Firebase account with project created

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/rodactiva-website.git
   cd rodactiva-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Create `.env.development` with your Firebase credentials:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_FIREBASE_RECAPTCHA_KEY=your_recaptcha_key
   ```

4. **Populate Firestore with initial data**
   ```bash
   node scripts/seed-firestore.mjs
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The site will be available at `http://localhost:5173`

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run check

# Format code
npm run format
```

### Project Structure

```
rodactiva-website/
├── client/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities (Firebase, storage)
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── App.tsx          # Main app component
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── public/              # Static assets
│   └── index.html           # HTML template
├── scripts/
│   └── seed-firestore.mjs   # Firestore data seeding
├── firestore.rules          # Firestore security rules
├── .env.example             # Environment variables template
└── README.md                # This file
```

## 🔐 Firebase Configuration

### Firestore Collections

- **events**: Event information and details
- **routes**: GPS routes for activities
- **gallery**: Photos, videos, and posters
- **members**: Team member information
- **usefulLinks**: External links
- **contactSubmissions**: Contact form submissions
- **eventRegistrations**: User event registrations

### Security Rules

Security rules are defined in `firestore.rules`. Key points:

- Public read access to all collections
- Admin-only write access for content management
- User-specific access for registrations

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## 🚀 Deployment

### Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Build and deploy**
   ```bash
   npm run build
   firebase deploy
   ```

### GitHub Actions

Automated deployment is configured via `.github/workflows/deploy.yml`:

1. Set up GitHub secrets with Firebase credentials
2. Push to `main` branch for production deployment
3. Push to `staging` branch for staging deployment

See [GITHUB_SETUP.md](./GITHUB_SETUP.md) for detailed instructions.

## 📊 Firebase Analytics

The site tracks:

- Page views
- Event registrations
- Gallery interactions
- Route downloads
- User engagement

Access analytics in [Firebase Console](https://console.firebase.google.com)

## 🎨 Customization

### Colors

Edit `client/src/index.css` to customize the color palette using OKLCH format:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.235 0.015 65);
  /* ... more colors */
}
```

### Typography

Add custom fonts in `client/index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=YourFont&display=swap" rel="stylesheet">
```

### Content

Update content by editing Firestore collections in [Firebase Console](https://console.firebase.google.com)

## 🐛 Troubleshooting

### Dev server not starting
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Firebase connection issues
- Verify credentials in `.env.development`
- Check Firebase project is active
- Ensure Firestore is initialized
- Check network connectivity

### Build errors
```bash
# Type check
npm run check

# Clear build cache
rm -rf dist .vite
npm run build
```

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev)

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Contact: rodactiva.trilhos@gmail.com

## 🙏 Acknowledgments

- Rodactiva adventure sports association
- Firebase for backend services
- React and Tailwind CSS communities
