# ReWear - Frontend (React + Vite + Tailwind CSS)

This is the frontend for the ReWear platform, built with React, Vite, and Tailwind CSS.

## Getting Started

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Build for production: `npm run build`

## Features

- **Landing Page**: Introduction and call-to-actions
- **Authentication**: Login/Signup forms with JWT
- **Dashboard**: User profile, items, swaps overview
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Routing**: React Router for navigation

## Tech Stack

- React 19
- Vite
- Tailwind CSS 3
- React Router DOM
- Axios for API calls
- Context API for state management

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── context/       # React Context providers
├── hooks/         # Custom hooks
├── utils/         # Utility functions
├── App.jsx        # Main app component
├── main.jsx       # Entry point
└── index.css      # Global styles with Tailwind
```

## API Integration

The frontend connects to the backend API at `http://localhost:5000`. Make sure the backend is running.

## Next Steps

- Implement item listing and detail pages
- Add item creation form with image upload
- Integrate swap functionality
- Add admin panel for moderators
- Implement real-time notifications
