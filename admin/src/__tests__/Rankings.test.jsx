import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import Rankings from "../pages/Admin/Rankings";
import { AdminContext } from "../context/AdminContext";
import axios from "axios";

vi.mock("axios");

const mockLeaderboard = [
  {
    doctorId: "doc1",
    doctor: {
      name: "Marcus Aurelius",
      image: "marcus.jpg",
      speciality: "Neurology",
    },
    completedAppointments: 15,
    revenue: 3000,
    averageRating: 4.8,
    scores: {
      totalScore: 92,
    },
  },
  {
    doctorId: "doc2",
    doctor: {
      name: "Galen Pergamum",
      image: "galen.jpg",
      speciality: "General Health",
    },
    completedAppointments: 10,
    revenue: 1500,
    averageRating: 4.5,
    scores: {
      totalScore: 80,
    },
  },
];

const renderRankings = (contextValue) => {
  return render(
    <AdminContext.Provider value={contextValue}>
      <MemoryRouter>
        <Rankings />
      </MemoryRouter>
    </AdminContext.Provider>,
  );
};

describe("Rankings Component Tests", () => {
  test("Should render doctor rankings leaderboard and podium top lists", async () => {
    axios.get.mockResolvedValue({
      data: {
        success: true,
        data: mockLeaderboard,
      },
    });

    renderRankings({
      aToken: "valid-admin-jwt",
      backendURL: "http://localhost:8001",
    });

    await waitFor(() => {
      expect(screen.getByText(/Leaderboard/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Marcus Aurelius/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Galen Pergamum/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/92\/100/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/80\/100/i).length).toBeGreaterThan(0);
    });
  });
});
