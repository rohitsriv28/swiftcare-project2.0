# SwiftCare - Doctor Appointment Booking System

SwiftCare is a full-stack, modern web application designed to seamlessly bridge the gap between patients seeking medical care and doctors providing it. It features comprehensive booking management, advanced administrative analytics, ML-powered doctor recommendations, and secure digital payment integrations.

## 🏗️ Project Architecture

The repository is structured as a monorepo consisting of three main modules:

### 1. [Frontend (Patient Portal)](./frontend/README.md)

The user-facing React application where patients can:

- Browse and filter available doctors by specialty.
- Receive personalized AI/ML doctor recommendations based on booking history.
- Book, view, cancel, and submit reviews/ratings for appointments.
- Pay for appointments securely via integrations like Khalti.

### 2. [Admin & Doctor Portal](./admin/README.md)

A secured React dashboard built for administrators and doctors:

- **Admin Features**: Manage doctors (add/edit profiles), view system-wide appointments, monitor real-time revenue trends segmented by cash vs online, analyze peak demand via heatmaps, and track a dynamic Doctor Leaderboard ranking system.
- **Doctor Features**: Manage availability, update profiles, and view upcoming patient appointments and performance metrics.

### 3. [Backend Service](./backend/README.md)

A robust Node.js/Express server backed by MongoDB:

- Handles authentication with JWT and strict rate limiting.
- Comprehensive request validation (`express-validator`).
- Cloudinary integration for streaming image uploads.
- Advanced aggregation pipelines for generating business analytics and scoring algorithms.
- Full test coverage suite using Jest and Supertest.

## 🚀 Getting Started

To run the entire application locally, you will need to start all three services.

**1. Clone the repository:**

```bash
git clone <repository_url>
cd SwiftCare_project2.0
```

**2. Start the Backend:**

```bash
cd backend
npm install
# Configure your .env file
npm run server
```

**3. Start the Admin Portal:**

```bash
cd admin
npm install
npm run dev
```

**4. Start the Frontend (Patient Portal):**

```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing & Quality Assurance

The application includes a comprehensive test suite covering all tiers:

- **Backend**: Unit and integration tests using Jest and Supertest (`npm run test` in `/backend`). Covers authentication, appointment booking atomicity, payment signature verification, analytic algorithms, and core controllers.
- **Frontend & Admin**: Component testing using Vitest and React Testing Library (`npm run test` in `/frontend` and `/admin`). Verifies rendering, component states, and context workflows.
- **Load Testing**: Python-based Locust load testing (`tests/locustfile.py`) simulating concurrent patient, doctor, and admin workflows without hardcoded credentials.

For detailed test execution results and performance metrics, please refer to the [Test Execution Report](./test_execution_report.md).

## 🔒 Security & Performance

The system has recently undergone a comprehensive architectural audit resulting in strict backend rate limiting, improved multi-part form data handling, migration to Tailwind v4 for frontend performance, and automated comprehensive testing protocols.
