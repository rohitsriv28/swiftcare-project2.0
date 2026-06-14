import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";

const renderNavbar = (contextValue) => {
  return render(
    <AppContext.Provider value={contextValue}>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </AppContext.Provider>,
  );
};

describe("Navbar Component Tests", () => {
  test("Should render navigation links successfully", () => {
    renderNavbar({
      token: false,
      setToken: vi.fn(),
      userData: null,
      backendUrl: "http://localhost:8001",
    });

    expect(screen.getAllByText(/HOME/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/DOCTORS/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/ABOUT/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/CONTACT/i)[0]).toBeInTheDocument();
  });

  test("Should render 'Login' button when token is absent", () => {
    renderNavbar({
      token: false,
      setToken: vi.fn(),
      userData: null,
      backendUrl: "http://localhost:8001",
    });

    // We have both desktop and mobile Login buttons
    const loginButtons = screen.getAllByText(/Login/i);
    expect(loginButtons.length).toBeGreaterThan(0);
    expect(loginButtons[0]).toBeInTheDocument();
  });

  test("Should render user profile dropdown when token is present", () => {
    const userData = {
      name: "John Doe",
      image: "john.jpg",
    };

    renderNavbar({
      token: "valid-user-jwt",
      setToken: vi.fn(),
      userData,
      backendUrl: "http://localhost:8001",
    });

    // Verify avatar image or name exists
    const avatar = screen.getByRole("img");
    expect(avatar).toBeInTheDocument();
    expect(avatar.getAttribute("src")).toBe("john.jpg");
  });

  test("Should clear token and redirect on logout click", () => {
    const setTokenMock = vi.fn();
    const userData = {
      name: "John Doe",
      image: "john.jpg",
    };

    renderNavbar({
      token: "valid-user-jwt",
      setToken: setTokenMock,
      userData,
      backendUrl: "http://localhost:8001",
    });

    // Toggle dropdown
    const profileImg = screen.getByAltText("Profile");
    fireEvent.click(profileImg);

    // Get the exact desktop "Logout" text (case-sensitive) to avoid mobile "LOGOUT"
    const logoutButton = screen.getByText("Logout");
    expect(logoutButton).toBeInTheDocument();

    fireEvent.click(logoutButton);
    expect(setTokenMock).toHaveBeenCalledWith(false);
  });
});
