import appointmentModel from "../models/appointmentModel.js";

// Utility to aggregate revenue trends
export const revenueTrends = async (req, res) => {
  try {
    const { granularity = "daily" } = req.query; // daily, weekly, monthly
    
    // Grouping logic based on granularity
    let groupStage = {};
    if (granularity === "daily") {
      groupStage = {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          revenue: { $sum: "$amount" },
          appointments: { $sum: 1 },
        }
      };
    } else if (granularity === "weekly") {
      groupStage = {
        $group: {
          _id: {
            year: { $isoWeekYear: "$createdAt" },
            week: { $isoWeek: "$createdAt" },
          },
          revenue: { $sum: "$amount" },
          appointments: { $sum: 1 },
        }
      };
    } else if (granularity === "monthly") {
      groupStage = {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$amount" },
          appointments: { $sum: 1 },
        }
      };
    }

    const data = await appointmentModel.aggregate([
      { $match: { isCancelled: false, isComplete: true } },
      groupStage,
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1, "_id.day": 1 } }
    ]);

    // Format output
    const formattedData = data.map(item => {
      let label = "";
      if (granularity === "daily") {
        label = `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`;
      } else if (granularity === "weekly") {
        label = `${item._id.year}-W${item._id.week}`;
      } else {
        label = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      }
      return {
        label,
        revenue: item.revenue,
        appointments: item.appointments
      };
    });

    res.json({ success: true, data: formattedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Heatmap based on when bookings are made (createdAt)
export const peakBookingAnalysis = async (req, res) => {
  try {
    const data = await appointmentModel.aggregate([
      {
        $project: {
          dayOfWeek: { $dayOfWeek: "$createdAt" }, // 1 (Sun) - 7 (Sat)
          hour: { $hour: "$createdAt" } // 0 - 23
        }
      },
      {
        $group: {
          _id: { day: "$dayOfWeek", hour: "$hour" },
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedData = data.map(item => ({
      day: item._id.day,
      hour: item._id.hour,
      value: item.count
    }));

    res.json({ success: true, data: formattedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Heatmap based on when appointments are scheduled for (slotDate, slotTime)
export const peakDemandVisualization = async (req, res) => {
  try {
    // slotDate is stored as "DD_MM_YYYY"
    // slotTime is stored as "10:00 am" or similar string format in SwiftCare
    
    const appointments = await appointmentModel.find({ isCancelled: false }).select("slotDate slotTime");
    
    // We need to parse slotDate to figure out the Day of Week.
    // slotTime format example: "10:00 am". We can extract the hour.
    
    const heatmap = {};
    
    appointments.forEach(app => {
      if (!app.slotDate || !app.slotTime) return;
      
      const parts = app.slotDate.split("_");
      if (parts.length !== 3) return;
      
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // JS months are 0-11
      const year = parseInt(parts[2]);
      
      const dateObj = new Date(year, month, day);
      const dayOfWeek = dateObj.getDay() + 1; // 1(Sun) - 7(Sat)

      // Parse slotTime e.g., "10:00 am" or "10:30 am" -> 10
      let hourStr = app.slotTime.split(":")[0];
      let ampm = app.slotTime.split(" ")[1];
      let hour = parseInt(hourStr);
      
      if (ampm && ampm.toLowerCase() === "pm" && hour < 12) {
        hour += 12;
      } else if (ampm && ampm.toLowerCase() === "am" && hour === 12) {
        hour = 0;
      }
      
      const key = `${dayOfWeek}-${hour}`;
      if (!heatmap[key]) heatmap[key] = { day: dayOfWeek, hour, value: 0 };
      heatmap[key].value += 1;
    });

    const formattedData = Object.values(heatmap);

    res.json({ success: true, data: formattedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
