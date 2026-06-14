import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import MyProfile from "../pages/MyProfile";
import { AppContext } from "../context/AppContext";
import axios from "axios";

vi.mock("axios");

const mockUserData = {
  name: "Richard Roe",
  email: "richard@example.com",
  phone: "9876543210",
  dob: "1995-10-15",
  gender: "Male",
  image: "richard.png",
  address: {
    line1: "123 Main St",
    line2: "Apt 4B",
  },
  createdAt: "2025-04-10T12:00:00Z",
};

const renderMyProfile = (contextValue) => {
  return render(
    <AppContext.Provider value={contextValue}>
      <MemoryRouter>
        <MyProfile />
      </MemoryRouter>
    </AppContext.Provider>,
  );
};

describe("MyProfile Component Tests", () => {
  test("Should show not-logged-in screen if userData is null", () => {
    renderMyProfile({
      userData: null,
      setUserData: vi.fn(),
      token: false,
      backendUrl: "http://localhost:8001",
      getUserData: vi.fn(),
    });

    expect(screen.getByText(/You are not logged in!/i)).toBeInTheDocument();
    expect(screen.getByText(/Go to Login/i)).toBeInTheDocument();
  });

  test("Should render profile information in read-only mode initially", () => {
    renderMyProfile({
      userData: mockUserData,
      setUserData: vi.fn(),
      token: "valid-jwt",
      backendUrl: "http://localhost:8001",
      getUserData: vi.fn(),
    });

    expect(screen.getByText(/Richard Roe/i)).toBeInTheDocument();
    expect(screen.getByText(/richard@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/9876543210/i)).toBeInTheDocument();
    expect(screen.getByText(/123 Main St/i)).toBeInTheDocument();
    expect(screen.getByText(/Male/i)).toBeInTheDocument();
    expect(screen.getByText(/1995-10-15/i)).toBeInTheDocument();
    expect(screen.getByText(/Member Since:/i)).toBeInTheDocument();
  });

  test("Should toggle edit mode and allow fields editing", async () => {
    const setUserDataMock = vi.fn();
    renderMyProfile({
      userData: mockUserData,
      setUserData: setUserDataMock,
      token: "valid-jwt",
      backendUrl: "http://localhost:8001",
      getUserData: vi.fn(),
    });

    const editButton = screen.getByText(/Edit/i);
    expect(editButton).toBeInTheDocument();
    fireEvent.click(editButton);

    // After clicking edit, inputs should be editable
    const nameInput = screen.getByPlaceholderText(/Your Name/i);
    expect(nameInput).toBeInTheDocument();
    expect(nameInput.value).toBe("Richard Roe");

    fireEvent.change(nameInput, { target: { value: "Richard Changed" } });
    expect(setUserDataMock).toHaveBeenCalled();
  });

  test("Should upload profile update and invoke save API", async () => {
    axios.post.mockResolvedValue({
      data: { success: true, message: "User profile updated successfully" },
    });
    const getUserDataMock = vi.fn();

    renderMyProfile({
      userData: mockUserData,
      setUserData: vi.fn(),
      token: "valid-jwt",
      backendUrl: "http://localhost:8001",
      getUserData: getUserDataMock,
    });

    // Enter edit mode
    fireEvent.click(screen.getByText(/Edit/i));

    // Save profile click
    const saveButton = screen.getByText("Save");
    expect(saveButton).toBeInTheDocument();
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/user/update-profile"),
        expect.any(FormData),
        expect.any(Object),
      );
      expect(getUserDataMock).toHaveBeenCalled();
    });
  });
});
