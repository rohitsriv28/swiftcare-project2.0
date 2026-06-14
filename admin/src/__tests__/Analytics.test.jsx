import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import Analytics from "../pages/Admin/Analytics";
import { AdminContext } from "../context/AdminContext";
import axios from "axios";

vi.mock("axios");

vi.mock("recharts", async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    ResponsiveContainer: ({ children }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
  };
});

const mockRevenueData = [
  { label: "2026-06-14", revenue: 500, appointments: 1 },
];

const mockBookingData = [{ day: 1, hour: 10, value: 5 }];

const mockDemandData = [{ day: 2, hour: 14, value: 8 }];

const renderAnalytics = (contextValue) => {
  return render(
    <AdminContext.Provider value={contextValue}>
      <MemoryRouter>
        <Analytics />
      </MemoryRouter>
    </AdminContext.Provider>,
  );
};

describe("Analytics Component Tests", () => {
  test("Should render trend charts granularity buttons and heatmap grids", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("revenue-trends")) {
        return Promise.resolve({
          data: { success: true, data: mockRevenueData },
        });
      }
      if (url.includes("peak-booking-analysis")) {
        return Promise.resolve({
          data: { success: true, data: mockBookingData },
        });
      }
      if (url.includes("peak-demand-visualization")) {
        return Promise.resolve({
          data: { success: true, data: mockDemandData },
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    renderAnalytics({
      aToken: "valid-admin-jwt",
      backendURL: "http://localhost:8001",
    });

    await waitFor(() => {
      expect(screen.getAllByText(/Revenue Trends/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Daily/i)).toBeInTheDocument();
      expect(screen.getByText(/Weekly/i)).toBeInTheDocument();
      expect(screen.getByText(/Monthly/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Peak Booking Time Analysis/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Peak Demand Visualization/i),
      ).toBeInTheDocument();
    });

    // Test granularity toggle
    const weeklyButton = screen.getByText(/Weekly/i);
    fireEvent.click(weeklyButton);
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("granularity=weekly"),
      expect.any(Object),
    );
  });
});
