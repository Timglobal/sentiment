// utils/scheduler.js
import Room from '../models/Room.js';
import { sendRoomNotification } from './email.js';

// This runs every 10 seconds and checks room durations
export const startRoomMonitor = () => {
  setInterval(async () => {
    const now = new Date();

    try {
      const rooms = await Room.find({ status: 'occupied', notifySent: false });

      for (const room of rooms) {
        if (!room.startTime || !room.endTime) continue

        const now = new Date();
        const start = new Date(room.startTime)
        const end = new Date(room.endTime)
        const totalTime = end - start
        const timeLeft = end - now
        const percentLeft = (timeLeft / totalTime) * 100

        if (timeLeft <= 0) {
          room.status = 'available'
          room.occupant = null
          room.startTime = null
          room.endTime = null
          room.notifySent = false
          await room.save()
          console.log(`✅ Room ${room.roomNumber} is now available.`)
          continue
        }

        if (percentLeft <= 20 && !room.notifySent) {
          const email = room.occupant?.email

          if (email) {
            let message = ''
            if (room.roomType === 'healthcare') {
              message = `Your healthcare room ${room.roomNumber} will soon become available.`
            } else {
              const baseURL = 'https://localhost:5173'; // change to your real frontend base URL

                message = `
                Hello,

                Your stay in Room ${room.roomNumber} is almost over. Do you want to extend it?

                👉 Yes: ${baseURL}/extend/${room._id}?decision=yes
                ❌ No: ${baseURL}/extend/${room._id}?decision=no

                Thanks,
                Sentiment Health
                `
            }

            await sendRoomNotification(email, 'Room Duration Alert', message)
          }

          room.notifySent = true
          await room.save()
        }
      }
    } catch (error) {
      console.error('Scheduler error:', error.message);
    }
  }, 10000); // every 10 seconds
}
