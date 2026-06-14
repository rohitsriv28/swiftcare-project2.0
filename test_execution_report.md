# Test Execution Report - SwiftCare Portal

This report documents the unit and integration tests run across the **Backend**, **Frontend**, and **Admin** portals of the SwiftCare application.

---

## 1. Executive Summary

| Scope        | Test Runner | Files Executed | Total Test Cases | Passed | Failed |  Status  |
| :----------- | :---------- | :------------: | :--------------: | :----: | :----: | :------: |
| **Backend**  | Jest        |       8        |        29        |   29   |   0    | **PASS** |
| **Frontend** | Vitest      |       4        |        14        |   14   |   0    | **PASS** |
| **Admin**    | Vitest      |       3        |        4         |   4    |   0    | **PASS** |
| **Combined** | —           |     **15**     |      **47**      | **47** | **0**  | **PASS** |

---

## 2. Backend Test Execution Results

Run command: `npm run test` inside the `/backend` directory.

| Test File             | Test Case Description                                                                        | Expected Outcome                                                    | Actual Outcome                                       |  Status  |
| :-------------------- | :------------------------------------------------------------------------------------------- | :------------------------------------------------------------------ | :--------------------------------------------------- | :------: |
| **review.test.js**    | Should fail if review rating is not between 1 and 5                                          | Returns `400` validation error                                      | Returns `400` validation error                       | **PASS** |
|                       | Should fail review if appointment is not found                                               | Returns `404` not found error                                       | Returns `404` not found error                        | **PASS** |
|                       | Should fail if user attempts to review someone else's appointment                            | Returns `403` unauthorized error                                    | Returns `403` unauthorized error                     | **PASS** |
|                       | Should fail if appointment is not completed yet                                              | Returns `400` bad request status                                    | Returns `400` bad request status                     | **PASS** |
|                       | Should submit review and recalculate doctor average rating                                   | Saves review, updates doctor `averageRating` successfully           | Saves review, updates doctor average successfully    | **PASS** |
| **payment.test.js**   | Should fail if signature strictly mismatches crypto digest                                   | Returns `400` signature verification error                          | Returns `400` signature verification error           | **PASS** |
|                       | Should fail gracefully avoiding crashes if missing bodies entirely                           | Returns `400` status with clear error field messages                | Returns `400` status with clear error field messages | **PASS** |
| **doctor.test.js**    | Should login doctor successfully with valid credentials                                      | Authenticates, returns JWT token successfully                       | Authenticates, returns JWT token successfully        | **PASS** |
|                       | Should fail doctor login with invalid credentials                                            | Returns `400` incorrect credentials error                           | Returns `400` incorrect credentials error            | **PASS** |
|                       | Should fetch doctor appointments list                                                        | Returns all appointments assigned to the logged-in doctor           | Returns doctor appointments list                     | **PASS** |
|                       | Should toggle doctor availability state                                                      | Updates the availability boolean in the database                    | Availability boolean updated successfully            | **PASS** |
|                       | Should retrieve doctor profile info                                                          | Returns full doctor document excluding the password hash            | Profile returned successfully excluding password     | **PASS** |
|                       | Should update doctor profile info successfully                                               | Updates fields (fee, about, address) in database                    | Updates fields in database successfully              | **PASS** |
| **booking.test.js**   | Should fail gracefully preventing double-booking if atomicity $push constraint fails         | Returns `409` conflict error on duplicate slot booking              | Returns `409` conflict error                         | **PASS** |
|                       | Should execute booking sequentially pushing documents accurately upon valid atomic insertion | Saves booking details and assigns slot atomically                   | Saves details and assigns slot atomically            | **PASS** |
| **auth.test.js**      | Should fail if no token is provided                                                          | Returns `401` unauthorized status                                   | Returns `401` unauthorized status                    | **PASS** |
|                       | Should fail if token is invalid                                                              | Returns `401` invalid token status                                  | Returns `401` invalid token status                   | **PASS** |
|                       | Should proceed if token is valid via Bearer schema                                           | Proceeds to the next middleware / controller action                 | Proceeds successfully                                | **PASS** |
| **analytics.test.js** | Should calculate revenue trends daily, weekly, and monthly correctly                         | Computes aggregated revenue grouped by date boundaries              | Computes aggregates accurately                       | **PASS** |
|                       | Should compute peak booking hour heatmap mapping correctly                                   | Group appointments by day of week and hour segment                  | Outputs heatmap metrics                              | **PASS** |
|                       | Should parse slot dates and slot times for peak demand visualization                         | Aggregates slot times to map peak demand intervals                  | Maps peak demand intervals successfully              | **PASS** |
| **admin.test.js**     | Should login admin with correct credentials                                                  | Returns admin JWT token successfully                                | Returns admin JWT token successfully                 | **PASS** |
|                       | Should fail admin login with incorrect credentials                                           | Returns `400` incorrect admin credentials error                     | Returns `400` incorrect credentials error            | **PASS** |
|                       | Should add new doctor when credentials are valid                                             | Creates doctor document and uploads photo                           | Doctor created successfully                          | **PASS** |
|                       | Should return all appointments with pagination details                                       | Returns a paginated list of appointments                            | Returns paginated list                               | **PASS** |
|                       | Should cancel appointment as admin and release slots                                         | Sets `isCancelled` flag and pulls slot from doctor slots list       | Cancels booking and releases slots                   | **PASS** |
|                       | Should retrieve system-wide counts and aggregates for admin dashboard                        | Returns stats summary objects                                       | Stats summary returned successfully                  | **PASS** |
| **scoring.test.js**   | Should calculate composite doctor performance rating correctly                               | Computes weighted rating based on revenue, ratings, and completions | Computes weighted performance correctly              | **PASS** |
|                       | Should calculate patient cancellation risk metrics correctly                                 | Predicts cancellation risk percentage based on history              | Predicts risk percentage correctly                   | **PASS** |

---

## 3. Frontend Test Execution Results

Run command: `npm run test` inside the `/frontend` directory.

| Component / File            | Test Case Description                                                    | Expected Outcome                                              | Actual Outcome                          |  Status  |
| :-------------------------- | :----------------------------------------------------------------------- | :------------------------------------------------------------ | :-------------------------------------- | :------: |
| **Navbar.test.jsx**         | Should render navigation links successfully                              | Renders Navbar links (Home, Doctors, About, Contact)          | Navigation links rendered correctly     | **PASS** |
|                             | Should render 'Login' button when token is absent                        | Renders Guest login button                                    | Guest login button rendered             | **PASS** |
|                             | Should render user profile dropdown when token is present                | Renders user avatar and dropdown menu links                   | Avatar dropdown rendered                | **PASS** |
|                             | Should clear token and redirect on logout click                          | Clears storage, resets context and routes back to login       | Context cleared and routed successfully | **PASS** |
| **MyProfile.test.jsx**      | Should show not-logged-in screen if userData is null                     | Renders warning / login prompts                               | Login prompts rendered                  | **PASS** |
|                             | Should render profile information in read-only mode initially            | Displays name, email, phone as static texts                   | Read-only fields rendered               | **PASS** |
|                             | Should toggle edit mode and allow fields editing                         | Renders input textboxes with interactive values               | Interactive inputs rendered             | **PASS** |
|                             | Should upload profile update and invoke save API                         | Submits updated fields payload to backend update API          | Save API invoked successfully           | **PASS** |
| **MyAppointments.test.jsx** | Should render loading state and list appointments                        | Renders loader first, then list of bookings                   | Loader and list rendered successfully   | **PASS** |
|                             | Should trigger cancel appointment API when Cancel is clicked             | Triggers cancel API call and sets booking status to cancelled | Cancel API triggered and status set     | **PASS** |
|                             | Should allow write a review for completed appointments                   | Displays review modal and captures ratings submissions        | Captures ratings and reviews            | **PASS** |
| **Appointment.test.jsx**    | Should show not-logged-in error message when token is missing            | Prompts user to log in to book                                | Login prompt displayed                  | **PASS** |
|                             | Should render doctor profile details when token is active                | Renders specialty, experience, degree, and fee fields         | Specialties and fee fields rendered     | **PASS** |
|                             | Should book an appointment when slot is selected and book button clicked | Invokes book API and routes to appointments page              | Book API invoked successfully           | **PASS** |

---

## 4. Admin Test Execution Results

Run command: `npm run test` inside the `/admin` directory.

| Component / File       | Test Case Description                                                         | Expected Outcome                                      | Actual Outcome                          |  Status  |
| :--------------------- | :---------------------------------------------------------------------------- | :---------------------------------------------------- | :-------------------------------------- | :------: |
| **Rankings.test.jsx**  | Should render doctor rankings leaderboard and podium top lists                | Displays doctor name card, gold/silver/bronze medals  | Renders leaderboard rankings            | **PASS** |
| **AddDoctor.test.jsx** | Should show validation errors when form fields are empty or invalid           | Displays validation warning text messages             | Validation text messages displayed      | **PASS** |
|                        | Should compile FormData and trigger post request upon valid inputs submission | Packages fields into FormData and triggers API call   | Packs fields and triggers API call      | **PASS** |
| **Analytics.test.jsx** | Should render trend charts granularity buttons and heatmap grids              | Displays granularity buttons (daily, weekly, monthly) | Buttons and grids rendered successfully | **PASS** |

---

## 5. Locust Load Testing Results & Insights

Run command: `locust -f locustfile.py` inside the `/tests` directory.

### A. Load Test Execution Summary

- **Simulated Roles**: `PatientUser` (Auth, Browse, Book, Pay, Review, Cancel), `DoctorUser` (Auth, Appointments, Dashboard, Complete, Update Profile), `AdminUser` (Auth, Dashboard, Analytics, Add Doctor, Performance Scores, Cancellation Risk).
- **Concurrency Level**: 10–17 concurrent users.
- **Ramp Rate**: 2.0 to 7.0 users spawned per second.
- **Total Requests Handled**: **1,101 requests** (completed successfully).

### B. Throughput & Latency Performance

- **RPS Stability**: Averaged a steady **~4 Requests Per Second (RPS)** during load phases.
- **50th Percentile Latency (Median)**: **~10ms** for general reads (browse doctors, read profiles, get recommendations).
- **95th Percentile Latency**: Fluctuated between **1,000ms and 8,000ms** during write-heavy actions:
  - Real Cloudinary image uploads during Doctor profile updates and creation.
  - External network handshakes with payment gateways (Razorpay & Khalti sandbox APIs).

### C. Error Resilience & Validation Checks

- **0% Server-Side Crashes**: The database and server remained stable with 0% runtime exceptions.
- **Rate Limiting Shield**: When standard rate limits were active (`API_RATE_LIMIT_MAX=200`, `AUTH_RATE_LIMIT_MAX=20`), the server successfully protected the endpoints, returning `429 Too Many Requests` status codes.
- **Business Rule Enforcement**:
  - Overlapping concurrent slot bookings returned `409 Conflict` ("Slot is no longer available!").
  - Bookings for doctors toggled as unavailable returned `400 Bad Request` ("Doctor not available!").
  - Already cancelled or completed payments returned `400/409` codes.
  - _All expected business logic conflicts were successfully caught, warnings logged, and processed gracefully without failing the overall test runs._
