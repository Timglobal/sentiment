// controllers/renewal.controller.js
console.log('handleRenewal loaded');
import Room from '../models/Room.js'


export const handleRenewal = async (req, res) => {
  const roomId = req.params.id;
  const { decision, extraDays } = req.body;

  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.status !== 'occupied') {
      return res.status(400).json({ message: 'Room is not currently occupied' });
    }

    if (decision === 'yes') {
      if (!extraDays || isNaN(extraDays)) {
        return res.status(400).json({ message: 'Please provide extraDays to renew.' });
      }

      // Extend endTime by extraDays
      const newEndTime = new Date(room.endTime.getTime() + extraDays * 24 * 60 * 60 * 1000);
      room.endTime = newEndTime;
      room.notifySent = false; // allow new future alert
      await room.save();

      return res.status(200).json({ message: 'Stay renewed successfully.', newEndTime });
    }

    if (decision === 'no') {
      // Mark room available and clear occupant
      room.status = 'available';
      room.occupant = undefined;
      room.startTime = undefined;
      room.endTime = undefined;
      room.notifySent = false;

      await room.save();

      // Simulate triggering ad/listing
      console.log(`🏡 Room ${room.roomNumber} is now available for new listing.`);

      return res.status(200).json({ message: 'Room released and now available.' });
    }

    return res.status(400).json({ message: 'Invalid decision. Use "yes" or "no".' });
  } catch (error) {
    res.status(500).json({ message: 'Error handling renewal.', error: error.message });
  }
};
