import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import Appointment from "../pages/Appointment";
import { AppContext } from "../context/AppContext";
import axios from "axios";

vi.mock("axios");

const mockDoctors = [
  {
    _id: "doc1",
    name: "Jane Smith",
    speciality: "General physician",
    degree: "MBBS",
    experience: "5 Years",
    about: "General healthcare expert.",
    fee: 400,
    image: "jane.jpg",
    availability: true,
    slots_booked: {},
  },
];

const renderAppointment = (
  contextValue,
  initialEntry = "/appointment/doc1",
) => {
  return render(
    <AppContext.Provider value={contextValue}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/appointment/:docId" element={<Appointment />} />
          <Route path="/login" element={<div>Mock Login Page</div>} />
          <Route
            path="/my-appointments"
            element={<div>Mock My Appointments Page</div>}
          />
        </Routes>
      </MemoryRouter>
    </AppContext.Provider>,
  );
};

describe("Appointment Component Tests", () => {
  test("Should show not-logged-in error message when token is missing", () => {
    renderAppointment({
      doctors: mockDoctors,
      currencySymbol: "₹",
      backendUrl: "http://localhost:8001",
      token: false,
      getDoctorsData: vi.fn(),
    });

    expect(screen.getByText(/You are not logged in!/i)).toBeInTheDocument();
    expect(screen.getByText(/Go to Login/i)).toBeInTheDocument();
  });

  test("Should render doctor profile details when token is active", async () => {
    renderAppointment({
      doctors: mockDoctors,
      currencySymbol: "₹",
      backendUrl: "http://localhost:8001",
      token: "valid-jwt",
      getDoctorsData: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
      expect(screen.getAllByText(/General physician/i).length).toBeGreaterThan(
        0,
      );
      expect(screen.getByText(/Appointment Fee/i)).toBeInTheDocument();
    });
  });

  test("Should book an appointment when slot is selected and book button clicked", async () => {
    axios.post.mockResolvedValue({
      data: { success: true, message: "Appointment Booked Successfully" },
    });

    const getDoctorsDataMock = vi.fn();
    renderAppointment({
      doctors: mockDoctors,
      currencySymbol: "₹",
      backendUrl: "http://localhost:8001",
      token: "valid-jwt",
      getDoctorsData: getDoctorsDataMock,
    });

    // Wait for doctor info to render
    await waitFor(() => {
      expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
    });

    // Select first slot time button if any exist (since today's date starts slots calculation)
    const timeButtons = await screen.findAllByRole("button");
    const selectTimeButton = timeButtons.find((btn) =>
      btn.textContent.match(/\d{2}:\d{2}\s+(AM|PM)/),
    );

    if (selectTimeButton) {
      fireEvent.click(selectTimeButton);
      const bookButton = screen.getByText(/Book an appointment/i);
      expect(bookButton).toBeInTheDocument();
      fireEvent.click(bookButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining("/api/user/book-appointment"),
          expect.any(Object),
          expect.any(Object),
        );
        expect(getDoctorsDataMock).toHaveBeenCalled();
        expect(
          screen.getByText(/Mock My Appointments Page/i),
        ).toBeInTheDocument();
      });
    }
  });
});
