import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import AddDoctor from "../pages/Admin/AddDoctor";
import { AdminContext } from "../context/AdminContext";
import axios from "axios";

vi.mock("axios");

const renderAddDoctor = (contextValue) => {
  return render(
    <AdminContext.Provider value={contextValue}>
      <MemoryRouter>
        <AddDoctor />
      </MemoryRouter>
    </AdminContext.Provider>,
  );
};

describe("AddDoctor Component Tests", () => {
  test("Should show validation errors when form fields are empty or invalid", async () => {
    renderAddDoctor({
      aToken: "valid-admin-token",
      backendURL: "http://localhost:8001",
      getAllDoctors: vi.fn(),
    });

    const submitButton = screen.getByText(/Add doctor/i);
    expect(submitButton).toBeInTheDocument();
    fireEvent.click(submitButton);

    // Form inputs should show default html or local error validators below fields
    // Let's type numeric value in name and verify error triggers
    const nameInput = screen.getByPlaceholderText(/Enter full name/i);
    fireEvent.change(nameInput, { target: { value: "Richard 123" } });

    // Trigger submit
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Check that invalid name error message is shown (validateForm sets name error if matches digit)
      expect(
        screen.getByText(/Name should not contain numbers/i),
      ).toBeInTheDocument();
    });
  });

  test("Should compile FormData and trigger post request upon valid inputs submission", async () => {
    axios.post.mockResolvedValue({
      data: { success: true, message: "Doctor added successfully" },
    });
    const getAllDoctorsMock = vi.fn();

    renderAddDoctor({
      aToken: "valid-admin-token",
      backendURL: "http://localhost:8001",
      getAllDoctors: getAllDoctorsMock,
    });

    // Fill in required fields using placeholders (no htmlFor bindings on labels)
    fireEvent.change(screen.getByPlaceholderText(/Enter full name/i), {
      target: { value: "Jane Smith" },
    });
    fireEvent.change(screen.getByPlaceholderText(/doctor@example.com/i), {
      target: { value: "janesmith@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), {
      target: { value: "securepassword123" },
    });
    fireEvent.change(document.querySelector('select[name="experience"]'), {
      target: { value: "5 Years" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter fee amount/i), {
      target: { value: "350" },
    });
    fireEvent.change(screen.getByPlaceholderText(/MBBS, MD, MS/i), {
      target: { value: "MD Psychiatry" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Street address/i), {
      target: { value: "First Line St" },
    });
    fireEvent.change(screen.getByPlaceholderText(/optional/i), {
      target: { value: "Second Line St" },
    });
    fireEvent.change(screen.getByPlaceholderText(/minimum 50 characters/i), {
      target: {
        value:
          "Expert in cognitive behavior and psychology since early years of development.",
      },
    });

    // Mock file upload (Select Image label is associated with input id="doc-img")
    const file = new File(["dummy image content"], "jane.png", {
      type: "image/png",
    });
    const imgInput = screen.getByLabelText(/Select Image/i);
    fireEvent.change(imgInput, { target: { files: [file] } });

    // Click submit
    fireEvent.click(screen.getByText(/Add doctor/i));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/add-doctor"),
        expect.any(FormData),
        expect.any(Object),
      );
      expect(getAllDoctorsMock).toHaveBeenCalled();
    });
  });
});
