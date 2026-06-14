# SwiftCare Admin Portal

The SwiftCare Admin Portal provides a comprehensive dashboard for administrators to manage doctors, appointments, and view advanced analytics. It also includes a specialized Doctor Dashboard for doctors to manage their schedules and view their performance.

## 🚀 Recent Updates

- **Upgraded to Tailwind CSS v4**: Migrated styling engine to the latest Tailwind CSS v4 using Vite plugins for improved performance and modern CSS features.
- **Analytics Dashboard**: Added a new advanced analytics dashboard (`Analytics.jsx`) featuring interactive charts (using Recharts) to visualize revenue trends, peak booking analysis, and peak demand visualization heatmaps.
- **Doctor Rankings & Leaderboard**: Implemented a comprehensive ranking system (`Rankings.jsx`) that evaluates doctors based on appointment volume, revenue generated, and patient ratings.
- **Authentication Improvements**: Enhanced the login flow and context providers to correctly store and persist doctor session information (`doctorInfo`). 
- **Logout Functionality**: Fixed critical bugs in `Navbar.jsx` to correctly clear independent sessions for both Admins and Doctors.
- **UI Enhancements**: Added smooth transitions and polished components for adding doctors and viewing appointments.

## 🛠️ Tech Stack
- React 19
- Vite
- Tailwind CSS v4
- Axios for API requests
- Recharts for data visualization
- React Toastify for notifications
- Lucide React for modern iconography

## 🏃‍♂️ Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables (`.env`):
   ```
   VITE_BACKEND_URL=http://localhost:8001
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
