import doctorModel from "../models/doctorModel.js";

/**
 * Automatically prunes slots_booked properties older than today
 * Mutates the passed docData directly and asynchronously saves it if changes occurred.
 * This effectively implements Option B safely preventing MongoDB payloads from bloating forever.
 * 
 * @param {Object} docData 
 */
export const pruneDoctorSlots = async (docData) => {
  if (!docData || !docData.slots_booked) return docData;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let modified = false;
  // Shallow copy object mapping preventing memory lock errors natively
  const newSlotsBooked = { ...docData.slots_booked };

  for (const dateKey of Object.keys(newSlotsBooked)) {
    const parts = dateKey.split("_");
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      const slotDateObj = new Date(year, month - 1, day);
      
      if (slotDateObj < today) {
        delete newSlotsBooked[dateKey];
        modified = true;
      }
    }
  }

  if (modified) {
    await doctorModel.findByIdAndUpdate(docData._id, { slots_booked: newSlotsBooked });
    docData.slots_booked = newSlotsBooked;
  }

  return docData;
};
