import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import {
  MAX_EXPECTED_APPOINTMENTS,
  MAX_EXPECTED_REVENUE,
} from "../config/constants.js";

export const calculatePerformanceScore = async (doctorId) => {
  try {
    // Fetch doctor's average rating
    const doctor = await doctorModel.findById(doctorId).select("averageRating");
    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const averageRating = doctor.averageRating || 0;

    // Fetch all completed appointments for this doctor
    const appointments = await appointmentModel.find({
      docId: doctorId,
      isComplete: true,
      isCancelled: false,
    });

    const completedAppointments = appointments.length;

    // Calculate revenue (only completed and paid appointments)
    const revenue = appointments.reduce((sum, app) => {
      // Assuming cash appointments that are complete are considered paid revenue
      // (same logic as in doctor dashboard)
      return sum + app.amount;
    }, 0);

    // Score Calculation (Max 100)
    // 1. Completed Appointments (35%)
    const appointmentScore = Math.min(
      35,
      (completedAppointments / MAX_EXPECTED_APPOINTMENTS) * 35,
    );

    // 2. Revenue (35%)
    const revenueScore = Math.min(35, (revenue / MAX_EXPECTED_REVENUE) * 35);

    // 3. Rating (30%)
    const ratingScore = (averageRating / 5) * 30;

    const totalScore = Number(
      (appointmentScore + revenueScore + ratingScore).toFixed(1),
    );

    return {
      doctorId,
      completedAppointments,
      revenue,
      averageRating,
      scores: {
        appointmentScore: Number(appointmentScore.toFixed(1)),
        revenueScore: Number(revenueScore.toFixed(1)),
        ratingScore: Number(ratingScore.toFixed(1)),
        totalScore,
      },
    };
  } catch (error) {
    console.error("Error calculating performance score:", error);
    throw error;
  }
};

export const calculateCancellationRisk = async (appointmentInput) => {
  try {
    // appointmentInput can be an ID string/ObjectId or the full appointment object
    const isId =
      typeof appointmentInput === "string" ||
      appointmentInput instanceof String ||
      (appointmentInput &&
        appointmentInput.toString &&
        appointmentInput.toString().length === 24 &&
        !appointmentInput.userId);

    const appointment = isId
      ? await appointmentModel.findById(appointmentInput)
      : appointmentInput;
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    let riskScore = 0;
    const factors = [];

    // Factor 1: Payment method
    // Unpaid/Cash appointments have a higher risk of cancellation
    if (!appointment.payment) {
      riskScore += 35;
      factors.push("Unpaid/Cash appointment");
    } else {
      riskScore -= 10; // Paid appointments are less likely to cancel
    }

    // Factor 2: Time between booking and appointment
    // More than 7 days ahead increases risk
    const bookingDate = new Date(appointment.createdAt);

    // Parse slotDate (DD_MM_YYYY)
    const parts = appointment.slotDate.split("_");
    const slotDateObj = new Date(
      parseInt(parts[2]),
      parseInt(parts[1]) - 1,
      parseInt(parts[0]),
    );

    const daysBetween =
      (slotDateObj.getTime() - bookingDate.getTime()) / (1000 * 3600 * 24);

    if (daysBetween > 14) {
      riskScore += 30;
      factors.push("Booked > 14 days in advance");
    } else if (daysBetween > 7) {
      riskScore += 15;
      factors.push("Booked > 7 days in advance");
    }

    // Factor 3: Patient Cancellation History
    const pastAppointments = await appointmentModel.find({
      userId: appointment.userId,
    });
    const pastCancellations = pastAppointments.filter(
      (app) => app.isCancelled,
    ).length;

    if (pastCancellations > 3) {
      riskScore += 35;
      factors.push(`Frequent cancellations (${pastCancellations} past)`);
    } else if (pastCancellations > 0) {
      riskScore += 15;
      factors.push("Has prior cancellation history");
    }

    // Cap the risk score between 0 and 100
    riskScore = Math.max(0, Math.min(100, riskScore));

    let riskLevel = "Low";
    if (riskScore >= 70) riskLevel = "High";
    else if (riskScore >= 40) riskLevel = "Medium";

    return {
      appointmentId: appointment._id,
      riskScore,
      riskLevel,
      factors,
    };
  } catch (error) {
    console.error("Error calculating cancellation risk:", error);
    throw error;
  }
};
