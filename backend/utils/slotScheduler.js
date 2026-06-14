import cron from "node-cron";
import mongoose from "mongoose";

/**
 * Removes stale slots_booked date keys with a database-side update pipeline.
 * The job never hydrates doctor documents, which keeps memory usage bounded.
 */
export const pruneExpiredDoctorSlots = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const doctorsCollection = mongoose.connection.collection("doctors");

  await doctorsCollection.updateMany({}, [
    {
      $set: {
        slots_booked: {
          $arrayToObject: {
            $filter: {
              input: { $objectToArray: { $ifNull: ["$slots_booked", {}] } },
              as: "slot",
              cond: {
                $or: [
                  {
                    $not: {
                      $regexMatch: {
                        input: "$$slot.k",
                        regex: /^\d{1,2}_\d{1,2}_\d{4}$/,
                      },
                    },
                  },
                  {
                    $let: {
                      vars: {
                        parts: {
                          $map: {
                            input: { $split: ["$$slot.k", "_"] },
                            as: "part",
                            in: { $toInt: "$$part" },
                          },
                        },
                      },
                      in: {
                        $gte: [
                          {
                            $dateFromParts: {
                              year: { $arrayElemAt: ["$$parts", 2] },
                              month: { $arrayElemAt: ["$$parts", 1] },
                              day: { $arrayElemAt: ["$$parts", 0] },
                            },
                          },
                          today,
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    },
  ]);
};

export const startDoctorSlotPruningJob = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      await pruneExpiredDoctorSlots();
    } catch (error) {
      console.error("Doctor slot pruning job failed:", error);
    }
  });
};
