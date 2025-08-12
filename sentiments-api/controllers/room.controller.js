// controllers/room.controller.js
import Room from '../models/Room.js'
import Tenant from '../models/Tenant.js';


export const createRoom = async (req, res) => {
  try {
    const {
      roomNumber,
      roomType,
      price, durationInMonths
    } = req.body;

    const imagePath = req.file ? `/uploads/rooms/${req.file.filename}` : null;

    let totalPrice = null;
    if (roomType === 'landlord') {
        if(!price ||  !durationInMonths){
            return res.status(400).json({ message: 'Price and duration are required for landlord rooms.'});
        }
        totalPrice = Number(price) * Number(durationInMonths);
    }

    const newRoom = new Room({
      roomNumber,
      roomType,
      price: totalPrice,
      imagePath,
    });

    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Error creating room', error: error.message });
  }
};


export const assignOccupant = async (req, res) => {
  try {
    const roomId = req.params.id;
    const {
      name,
      age,
      gender,
      reason,
      illness,
      startTime,
      endTime,
      status,
      email
    } = req.body;

    const isReleasing = !name && !age && !gender && !reason && !startTime && !endTime;

    const updateFields = isReleasing
      ? {
          occupant: null,
          startTime: null,
          endTime: null,
          status: 'available',
          notifySent: false,
        }
        : {
          occupant: { name, age, gender, reason, illness, email },
          startTime,
          endTime,
          status: status || 'occupied',
          notifySent: false,
        };

    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      updateFields,
      { new: true }
    );

    if (!updatedRoom) return res.status(404).json({ message: 'Room not found' });

    if (!isReleasing) {
        await Tenant.create({
            name,
            age,
            gender,
            email,
            reason,
            illness,
            roomNumber: updatedRoom.roomNumber,
            roomId: updatedRoom._id,
            roomType: updatedRoom.roomType,
            startTime,
            endTime
        });
    }

    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Error assigning occupant', error: error.message });
  }
};

export const getRooms = async (req, res) => {
  try {
    const { status, type } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.roomType = type;

    const rooms = await Room.find(query);
    const now = new Date();

    const updatedRooms = await Promise.all(
      rooms.map(async (room) => {
        const hasExpired = room.endTime && new Date(room.endTime) < now;
        const isOccupied = room.status === 'occupied';

        if (isOccupied && hasExpired) {
          room.status = 'available';
          room.occupant = null;
          room.startTime = null;
          room.endTime = null;
          room.notifySent = false;
          await room.save();
        }
        return room;
      })
    );

    res.status(200).json(updatedRooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
};


export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
    if (!room) return res.status(404).json({ message: 'Room not found' })

    const now = new Date()
    const end = new Date(room.endTime)

    if (room.status === 'occupied' && end < now) {
      // auto-release logic
      room.status = 'available'
      room.occupant = null
      room.startTime = null
      room.endTime = null
      room.notifySent = false
      await room.save()
    }

    res.json(room)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room', error: error.message })
  }
}


export const handleExtensionDecision = async (req, res) => {
  try {
    const roomId = req.params.id
    const { decision } = req.body

    const room = await Room.findById(roomId)
    if (!room || room.status !== 'occupied') {
      return res.status(404).json({ message: 'Room not found or not occupied' })
    }

    if (decision === 'yes') {
      const start = new Date(room.startTime)
      const end = new Date(room.endTime)
      const duration = end - start

      const newStart = new Date()
      const newEnd = new Date(newStart.getTime() + duration)

      room.startTime = newStart
      room.endTime = newEnd
      room.notifySent = false

      await room.save()

      return res.status(200).json({ message: `✅ Your stay in Room ${room.roomNumber} has been extended.` })
    }

    if (decision === 'no') {
      return res.status(200).json({ message: `❌ Thank you. Room ${room.roomNumber} will expire as scheduled.` })
    }

    res.status(400).json({ message: 'Invalid decision' })
  } catch (err) {
    res.status(500).json({ message: 'Error processing decision', error: err.message })
  }
}
