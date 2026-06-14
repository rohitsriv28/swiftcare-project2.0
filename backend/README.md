# SwiftCare Backend Service

The SwiftCare Backend Service powers the Patient and Admin portals. It is a robust Node.js/Express application handling authentication, appointment scheduling, payment processing, advanced analytics, and security.

## 🚀 Recent Updates & Architectural Improvements

- **Comprehensive Security Overhaul**: 
  - Added strict API rate limiting (`rateLimiter.js`) to prevent brute-force attacks and abuse.
  - Implemented robust request validation using `express-validator` across Admin, Doctor, and User routes.
  - Fixed timing-based email enumeration vulnerabilities in authentication controllers.
- **Advanced Analytics & Scoring Engine**:
  - Implemented `analyticsController.js` to aggregate revenue trends, peak booking times, and demand heatmaps using complex MongoDB aggregation pipelines.
  - Created `scoringService.js` to calculate dynamic doctor performance rankings based on appointment volume, revenue, and average ratings.
  - Added predictive cancellation risk analysis for appointments.
- **Infrastructure & Storage**:
  - Upgraded Multer configuration to use memory storage (`memoryStorage`) to prevent server crashes during file uploads.
  - Implemented direct-to-Cloudinary streaming uploads (`cloudinaryUpload.js`) for faster and more reliable image processing.
- **Test Coverage**:
  - Added a comprehensive testing suite using Jest and Supertest (`__tests__` directory) covering authentication, booking flows, and payment logic.
- **Core Logic Fixes**:
  - Resolved request body parameter wiping issues caused by multipart form-data middleware by migrating to token-extracted `req.userId` and `req.docId`.
  - Updated backend routes to strictly enforce correct HTTP methods (`GET` vs `POST` for profile fetching).

## 🛠️ Tech Stack
- Node.js & Express
- MongoDB & Mongoose
- JSON Web Tokens (JWT) & Bcrypt
- Cloudinary (Image Hosting)
- Jest & Supertest (Testing)

## 🏃‍♂️ Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file based on `.env.example`.
3. Start the development server:
   ```bash
   npm run server
   ```
4. Run tests:
   ```bash
   npm test
   ```
