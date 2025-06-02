from locust import HttpUser, task, between


class PatientUser(HttpUser):
    wait_time = between(1, 2)

    def on_start(self):
        # Log in as a test patient and store the JWT
        response = self.client.post(
            "/api/user/login",
            json={"email": "cap_rogers@gmail.com", "password": "qwerty"},
        )
        token = response.json().get("token")
        self.headers = {"Authorization": f"Bearer {token}"}
        self.headers = {"token": token}

    @task(3)
    def browse_doctors(self):
        # Fetch all available doctors
        self.client.get("/api/doctor/list", headers=self.headers)

    @task(2)
    def search_doctor(self):
        # Search doctors by speciality keyword
        self.client.post(
            "/api/user/search-doctors", json={"query": "general"}, headers=self.headers
        )
