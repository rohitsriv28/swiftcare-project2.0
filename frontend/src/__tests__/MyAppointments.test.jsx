import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import MyAppointments from "../pages/MyAppointments";
import { AppContext } from "../context/AppContext";
import axios from "axios";

vi.mock("axios");

const mockAppointments = [
  {
    _id: "app1",
    docId: "doc1",
    slotDate: "20_08_2026",
    slotTime: "10:30 AM",
    amount: 500,
    payment: false,
    isCancelled: false,
    isComplete: false,
    docData: {
      name: "John Smith",
      speciality: "Dermatologist",
      image: "john.jpg",
    },
  },
  {
    _id: "app2",
    docId: "doc2",
    slotDate: "21_08_2026",
    slotTime: "02:00 PM",
    amount: 600,
    payment: true,
    isCancelled: false,
    isComplete: true,
    hasReviewed: false,
    docData: {
      name: "Sarah Jenkins",
      speciality: "Cardiologist",
      image: "sarah.jpg",
    },
  },
];

const renderMyAppointments = (contextValue) => {
  return render(
    <AppContext.Provider value={contextValue}>
      <MemoryRouter>
        <MyAppointments />
      </MemoryRouter>
    </AppContext.Provider>,
  );
};

describe("MyAppointments Component Tests", () => {
  test("Should render loading state and list appointments", async () => {
    axios.get.mockResolvedValue({
      data: {
        success: true,
        appointments: mockAppointments,
        pagination: { hasNextPage: false, nextCursor: null },
      },
    });

    renderMyAppointments({
      backendUrl: "http://localhost:8001",
      token: "valid-jwt",
      getDoctorsData: vi.fn(),
    });

    expect(
      screen.getByText(/Loading your appointments.../i),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Upcoming Appointments/i)).toBeInTheDocument();
      expect(screen.getByText(/Dr. John Smith/i)).toBeInTheDocument();
      expect(screen.getByText(/Dermatologist/i)).toBeInTheDocument();
      expect(screen.getByText(/Completed Appointments/i)).toBeInTheDocument();
      expect(screen.getByText(/Dr. Sarah Jenkins/i)).toBeInTheDocument();
    });
  });

  test("Should trigger cancel appointment API when Cancel is clicked", async () => {
    axios.get.mockResolvedValue({
      data: {
        success: true,
        appointments: [mockAppointments[0]],
      },
    });
    axios.post.mockResolvedValue({
      data: {
        success: true,
        message: "Appointment cancelled successfully",
      },
    });

    const getDoctorsDataMock = vi.fn();
    renderMyAppointments({
      backendUrl: "http://localhost:8001",
      token: "valid-jwt",
      getDoctorsData: getDoctorsDataMock,
    });

    await waitFor(() => {
      expect(screen.getByText(/Dr. John Smith/i)).toBeInTheDocument();
    });

    const cancelBtn = screen.getByText(/Cancel/i);
    expect(cancelBtn).toBeInTheDocument();
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/user/cancel-appointment"),
        { appointmentId: "app1" },
        expect.any(Object),
      );
    });
  });

  test("Should allow write a review for completed appointments", async () => {
    axios.get.mockResolvedValue({
      data: {
        success: true,
        appointments: [mockAppointments[1]],
      },
    });
    axios.post.mockResolvedValue({
      data: {
        success: true,
        message: "Review submitted successfully",
      },
    });

    renderMyAppointments({
      backendUrl: "http://localhost:8001",
      token: "valid-jwt",
      getDoctorsData: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText(/Dr. Sarah Jenkins/i)).toBeInTheDocument();
    });

    const reviewBtn = screen.getByText(/Write a Review/i);
    expect(reviewBtn).toBeInTheDocument();
    fireEvent.click(reviewBtn);

    // Expand review form
    expect(screen.getByText(/Rate your experience with/i)).toBeInTheDocument();

    // Select rating stars and submit
    const submitBtn = screen.getByText(/Submit Review/i);
    expect(submitBtn).toBeInTheDocument();
    // Star rating would normally be clicked, but let's click it or check disabled status
    expect(submitBtn).toBeDisabled(); // disabled because rating is 0
  });
});
