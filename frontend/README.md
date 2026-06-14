# SwiftCare Patient Portal (Frontend)

The SwiftCare Patient Portal allows users to discover doctors, book appointments, manage their profiles, and make secure payments.

## 🚀 Recent Updates

- **Upgraded to Tailwind CSS v4**: Migrated styling engine to the latest Tailwind CSS v4 for improved performance and access to modern CSS features.
- **ML-Powered Recommendations**: Integrated a new `RecommendedDocs.jsx` component that displays personalized doctor recommendations based on the user's booking history and profile using backend AI integration.
- **Khalti Payment Integration**: Added native support for Khalti digital wallet payments alongside existing payment gateways, complete with a dedicated `VerifyKhalti.jsx` page and robust payment modals.
- **Enhanced UX/UI**:
  - Improved the `MyProfile.jsx` page with better validation handling (specifically for unselected Date of Birth fields).
  - Enhanced the `MyAppointments.jsx` interface for smoother navigation.
  - Refined context handling in `AppContext.jsx` to gracefully manage API failures (e.g. 500 errors) and prevent blank screens.
- **Security Updates**: Ensured secure handling of sensitive data during the appointment booking flow.

## 🛠️ Tech Stack

- React 19
- Vite
- Tailwind CSS v4
- Axios for API requests
- React Router DOM for routing

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
