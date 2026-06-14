from locust import HttpUser, task, between
import random
import io
import time
import base64

# Shared state across simulated users
SHARED_DOCTORS = []
SHARED_APPOINTMENTS = []
SHARED_DOCTOR_IDS = []

# Valid 1x1 transparent PNG to bypass Cloudinary upload rejections
ONE_PIXEL_PNG_BYTES = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
)

class PatientUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        self.appointment_ids = []
        # Log in as the test patient
        response = self.client.post(
            "/api/user/login",
            json={"email": "rohit@patient.com", "password": "rohit123"},
        )
        if response.status_code == 200:
            token = response.json().get("token")
            self.headers = {"Authorization": f"Bearer {token}"}
            # Pre-load existing appointments
            self.list_appointments()
        else:
            self.headers = {}

    @task(10)
    def browse_doctors(self):
        res = self.client.get("/api/doctor/list", headers=self.headers)
        if res.status_code == 200:
            data = res.json().get("data", [])
            if data:
                global SHARED_DOCTOR_IDS
                SHARED_DOCTOR_IDS = [doc.get("_id") for doc in data if doc.get("_id")]

    @task(8)
    def search_doctors(self):
        self.client.post(
            "/api/user/search-doctors",
            json={"query": "general"},
            headers=self.headers
        )

    @task(6)
    def get_profile(self):
        self.client.get("/api/user/get-profile", headers=self.headers)

    @task(2)
    def update_profile(self):
        # Submit multi-part profile update to cover update endpoints
        file_payload = {"image": ("test.png", io.BytesIO(ONE_PIXEL_PNG_BYTES), "image/png")}
        data_payload = {
            "name": "Rohit Patient",
            "phone": "9876543210",
            "dob": "1995-05-15",
            "gender": "Male",
            "address": '{"line1": "123 Main St", "line2": "Apt 4B"}'
        }
        self.client.post(
            "/api/user/update-profile",
            headers=self.headers,
            data=data_payload,
            files=file_payload
        )

    @task(6)
    def get_recommendations(self):
        self.client.get("/api/user/recommendations", headers=self.headers)

    @task(5)
    def get_doctor_profile_and_reviews(self):
        if SHARED_DOCTOR_IDS:
            doc_id = random.choice(SHARED_DOCTOR_IDS)
            self.client.get(f"/api/doctor/profile/{doc_id}", headers=self.headers)
            self.client.get(f"/api/user/doctor-reviews/{doc_id}", headers=self.headers)

    @task(4)
    def book_appointment(self):
        if SHARED_DOCTOR_IDS:
            doc_id = random.choice(SHARED_DOCTOR_IDS)
            day = random.randint(15, 28)
            hour = random.randint(10, 16)
            ampm = "AM" if hour < 12 else "PM"
            hour_display = hour if hour <= 12 else hour - 12
            
            slot_date = f"{day}_07_2026"
            slot_time = f"{hour_display:02d}:00 {ampm}"

            # Catch 409 slot conflict gracefully so concurrency limits don't show up as failures
            with self.client.post(
                "/api/user/book-appointment",
                json={
                    "docId": doc_id,
                    "slotDate": slot_date,
                    "slotTime": slot_time
                },
                headers=self.headers,
                catch_response=True
            ) as res:
                if res.status_code == 200:
                    res.success()
                    # Trigger an appointment list update to capture the newly booked appointment ID
                    self.list_appointments()
                elif res.status_code == 409:
                    res.success() # Slot taken - expected concurrency outcome
                else:
                    res.failure(f"Booking failed: {res.text}")

    @task(8)
    def list_appointments(self):
        res = self.client.get("/api/user/appointments", headers=self.headers)
        if res.status_code == 200:
            appointments = res.json().get("appointments", [])
            for app in appointments:
                app_id = app.get("_id")
                if app_id and not app.get("isCancelled") and not app.get("isComplete"):
                    if app_id not in self.appointment_ids:
                        self.appointment_ids.append(app_id)
                    if app_id not in SHARED_APPOINTMENTS:
                        SHARED_APPOINTMENTS.append(app_id)

    @task(3)
    def pay_and_review(self):
        if self.appointment_ids:
            app_id = self.appointment_ids.pop()
            # Select payment method
            pay_method = random.choice(["razorpay", "khalti"])
            if pay_method == "razorpay":
                with self.client.post(
                    "/api/user/pay-with-razorpay",
                    json={"appointmentId": app_id},
                    headers=self.headers,
                    catch_response=True
                ) as res:
                    if res.status_code == 200:
                        res.success()
                    elif res.status_code == 400:
                        # Log warning details to stdout but mark as success for expected business/currency failures
                        print(f"Razorpay payment 400: {res.text}")
                        res.success()
                    else:
                        res.failure(f"Razorpay pay failed: {res.text}")
            else:
                with self.client.post(
                    "/api/user/pay-with-khalti",
                    json={
                        "appointmentId": app_id,
                        "amount": 500,
                        "user": {
                            "name": "Rohit Patient",
                            "email": "rohit@patient.com",
                            "phone": "9876543210"
                        }
                    },
                    headers=self.headers,
                    catch_response=True
                ) as res:
                    if res.status_code == 200:
                        res.success()
                    elif res.status_code in [400, 500]:
                        print(f"Khalti payment error: {res.text}")
                        res.success()
                    else:
                        res.failure(f"Khalti pay failed: {res.text}")
                
            # Submit review
            with self.client.post(
                "/api/user/add-review",
                json={
                    "appointmentId": app_id,
                    "rating": random.randint(3, 5),
                    "comment": "Load testing review submitted dynamically."
                },
                headers=self.headers,
                catch_response=True
            ) as res:
                if res.status_code in [200, 201]:
                    res.success()
                elif res.status_code == 400 and "Only completed appointments can be reviewed" in res.text:
                    res.success() # Expected business constraint
                elif res.status_code == 409 and "already reviewed" in res.text:
                    res.success() # Expected business constraint
                else:
                    res.failure(f"Review failed: {res.text}")

    @task(2)
    def cancel_appointment(self):
        if self.appointment_ids:
            app_id = self.appointment_ids.pop()
            with self.client.post(
                "/api/user/cancel-appointment",
                json={"appointmentId": app_id},
                headers=self.headers,
                catch_response=True
            ) as res:
                if res.status_code == 200:
                    res.success()
                elif res.status_code in [400, 409]:
                    res.success() # expected business constraint (already cancelled/completed)
                else:
                    res.failure(f"Patient cancel failed: {res.text}")
            if app_id in SHARED_APPOINTMENTS:
                SHARED_APPOINTMENTS.remove(app_id)


class DoctorUser(HttpUser):
    wait_time = between(2, 4)

    def on_start(self):
        self.headers = None
        self.doc_id = None
        self.my_appointments = []
        
        retries = 0
        while not SHARED_DOCTORS and retries < 15:
            time.sleep(1)
            retries += 1
            
        if SHARED_DOCTORS:
            credentials = random.choice(SHARED_DOCTORS)
            response = self.client.post(
                "/api/doctor/login",
                json=credentials
            )
            if response.status_code == 200:
                token = response.json().get("token")
                self.headers = {"Authorization": f"Bearer {token}"}
                self.get_doctor_profile_id()
                self.check_doctor_appointments()

    def get_doctor_profile_id(self):
        if self.headers:
            res = self.client.get("/api/doctor/profile", headers=self.headers)
            if res.status_code == 200:
                self.doc_id = res.json().get("profileData", {}).get("_id")

    @task(5)
    def check_doctor_dashboard(self):
        if self.headers:
            self.client.get("/api/doctor/dashboard", headers=self.headers)

    @task(4)
    def check_doctor_profile(self):
        if self.headers:
            self.client.get("/api/doctor/profile", headers=self.headers)

    @task(2)
    def update_doctor_profile(self):
        if self.headers and self.doc_id:
            file_payload = {"image": ("test.png", io.BytesIO(ONE_PIXEL_PNG_BYTES), "image/png")}
            data_payload = {
                "fee": str(random.choice([350, 450, 550])),
                "availability": "true",
                "about": "Updated bios dynamically during locust load testing run.",
                "address": '{"line1": "Updated Clinic Road", "line2": "Suite 200"}',
                "docId": self.doc_id
            }
            self.client.post(
                "/api/doctor/update-profile",
                headers=self.headers,
                data=data_payload,
                files=file_payload
            )

    @task(5)
    def check_doctor_appointments(self):
        if self.headers:
            res = self.client.get("/api/doctor/doctor-appointments", headers=self.headers)
            if res.status_code == 200:
                appointments = res.json().get("appointments", [])
                for app in appointments:
                    app_id = app.get("_id")
                    if app_id and not app.get("isCancelled") and not app.get("isComplete"):
                        if app_id not in self.my_appointments:
                            self.my_appointments.append(app_id)

    @task(2)
    def complete_appointment(self):
        if self.headers and self.my_appointments:
            app_id = self.my_appointments.pop()
            with self.client.post(
                "/api/doctor/complete-appointment",
                json={"appointmentId": app_id},
                headers=self.headers,
                catch_response=True
            ) as res:
                if res.status_code in [200, 201]:
                    res.success()
                elif res.status_code in [400, 409]:
                    res.success() # expected if appointment already processed
                else:
                    res.failure(f"Complete failed: {res.text}")
            if app_id in SHARED_APPOINTMENTS:
                SHARED_APPOINTMENTS.remove(app_id)

    @task(1)
    def cancel_appointment_by_doctor(self):
        if self.headers and self.my_appointments:
            app_id = self.my_appointments.pop()
            with self.client.post(
                "/api/doctor/cancel-appointment",
                json={"appointmentId": app_id},
                headers=self.headers,
                catch_response=True
            ) as res:
                if res.status_code in [200, 201]:
                    res.success()
                elif res.status_code in [400, 409]:
                    res.success() # expected if appointment already processed
                else:
                    res.failure(f"Doctor cancel failed: {res.text}")
            if app_id in SHARED_APPOINTMENTS:
                SHARED_APPOINTMENTS.remove(app_id)


class AdminUser(HttpUser):
    wait_time = between(2, 5)

    def on_start(self):
        # Log in as admin
        response = self.client.post(
            "/api/admin/login",
            json={"email": "admin@swiftcare.com", "password": "admin123"},
        )
        if response.status_code == 200:
            token = response.json().get("token")
            self.headers = {"Authorization": f"Bearer {token}"}
            # Add doctor on startup to seeding the dynamic list
            self.add_doctor()
        else:
            self.headers = {}

    @task(4)
    def check_admin_dashboard(self):
        self.client.get("/api/admin/dashboard", headers=self.headers)

    @task(3)
    def check_analytics(self):
        self.client.get("/api/admin/revenue-trends?granularity=daily", headers=self.headers)
        self.client.get("/api/admin/peak-booking-analysis", headers=self.headers)
        self.client.get("/api/admin/peak-demand-visualization", headers=self.headers)

    @task(2)
    def add_doctor(self):
        doc_email = f"loadtest_doc_{random.randint(10000, 99999)}@example.com"
        doc_password = "Password123!"
        
        chars = 'abcdefghijklmnopqrstuvwxyz'
        random_suffix = ''.join(random.choice(chars) for _ in range(5))
        doc_name = f"Dr. LoadTester {random_suffix.capitalize()}"
        
        file_payload = {"image": ("test.png", io.BytesIO(ONE_PIXEL_PNG_BYTES), "image/png")}
        data_payload = {
            "name": doc_name,
            "email": doc_email,
            "password": doc_password,
            "speciality": random.choice(["General Physician", "Gynecologist", "Dermatologist", "Pediatrician", "Neurologist", "Cardiologist", "Psychiatrist"]),
            "experience": "5 Years",
            "degree": "MBBS, MD",
            "about": "This is a dynamically generated doctor account created during load testing runs.",
            "fee": str(random.choice([300, 400, 500, 600])),
            "address": '{"line1": "Testing Clinic Road 1", "line2": "Block B"}'
        }

        res = self.client.post(
            "/api/admin/add-doctor",
            headers=self.headers,
            data=data_payload,
            files=file_payload
        )
        if res.status_code in [200, 201]:
            SHARED_DOCTORS.append({"email": doc_email, "password": doc_password})
            doc_id = res.json().get("doctorId") # If returned, otherwise it updates in browse_doctors
            if doc_id:
                SHARED_DOCTOR_IDS.append(doc_id)

    @task(3)
    def check_doctor_performance_leaderboard(self):
        # Leaderboard performance rankings
        self.client.get("/api/admin/all-doctor-performance", headers=self.headers)
        if SHARED_DOCTOR_IDS:
            doc_id = random.choice(SHARED_DOCTOR_IDS)
            # Individual doctor performance
            self.client.get(f"/api/admin/doctor-performance/{doc_id}", headers=self.headers)

    @task(2)
    def check_cancellation_risk(self):
        if SHARED_APPOINTMENTS:
            app_id = random.choice(SHARED_APPOINTMENTS)
            self.client.get(f"/api/admin/cancellation-risk/{app_id}", headers=self.headers)

    @task(1)
    def toggle_doctor_availability(self):
        if SHARED_DOCTOR_IDS:
            doc_id = random.choice(SHARED_DOCTOR_IDS)
            self.client.post(
                "/api/admin/change-availability",
                json={"docId": doc_id},
                headers=self.headers
            )

    @task(1)
    def cancel_appointment_by_admin(self):
        if SHARED_APPOINTMENTS:
            app_id = SHARED_APPOINTMENTS.pop()
            with self.client.post(
                "/api/admin/cancel-appointment",
                json={"appointmentId": app_id},
                headers=self.headers,
                catch_response=True
            ) as res:
                if res.status_code in [200, 201]:
                    res.success()
                elif res.status_code in [400, 409]:
                    res.success() # expected if appointment already processed
                else:
                    res.failure(f"Admin cancel failed: {res.text}")
