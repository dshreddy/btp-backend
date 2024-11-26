const cron = require("node-cron");
const patientModel = require("../models/patient");
const medicineModel = require("../models/medicine");
const { Expo } = require("expo-server-sdk");

const expo = new Expo();
const sendNotification = async (deviceToken, messageTitle, messageBody) => {
  try {
    console.log("Sending notification to:", deviceToken);

    // Construct the message
    const messages = [
      {
        to: deviceToken,
        title: messageTitle,
        body: messageBody,
        sound: "default", // Optional: Include sound for notification
      },
    ];

    // Send the notification
    const receipts = await expo.sendPushNotificationsAsync(messages);
    console.log("Notification receipts:", receipts);

    return receipts;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error; // Re-throw the error to handle it in the caller function
  }
};

// Schedule the task to run every minute
cron.schedule("* * * * *", async () => {
  try {
    console.log("Checking for medicine reminders...");

    // Get the current date and time
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    // Fetch patients with active medicines
    const patients = await patientModel.find({
      medicines: {
        $elemMatch: {
          startDate: { $lte: now },
          endDate: { $gte: now },
          dosageTimes: { $in: [currentTime] }, // Check if currentTime exists in dosageTimes
        },
      },
    });
    // Iterate over each patient and send notifications
    for (const patient of patients) {
      if (patient.deviceToken) {
        patient.medicines.forEach(async (medicine) => {
          if (
            medicine.dosageTimes.includes(currentTime) &&
            now >= medicine.startDate &&
            now <= medicine.endDate
          ) {
            const messageTitle = "Medicine Reminder";
            const medicineName = await medicineModel
              .findById(medicine.medicine)
              .select("name");
            console.log("Medicine Name:", medicineName.name);

            const messageBody = `It's time to take your medicine: ${medicineName.name}`;
            console.log(
              `Sending reminder to ${patient.name} for medicine: ${medicine.medicine}`
            );

            try {
              await sendNotification(
                patient.deviceToken,
                messageTitle,
                messageBody
              );
              console.log(`Notification sent to ${patient.name}`);
            } catch (error) {
              console.error(
                `Failed to send notification to ${patient.name}:`,
                error
              );
            }
          }
        });
      }
    }
  } catch (error) {
    console.error("Error checking for medicine reminders:", error);
  }
});
