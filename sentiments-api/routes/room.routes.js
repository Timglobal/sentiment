// routes/room.routes.js
import express from 'express';
import { createRoom, assignOccupant, getRooms, getRoomById, handleExtensionDecision, } from '../controllers/room.controller.js';
import { getUploader } from '../middleware/upload.js';
import { handleRenewal } from '../controllers/renewal.controller.js';


const router = express.Router();

const upload = getUploader('rooms');

router.post('/', upload.single('image'), createRoom);

router.post('/:id/renew', handleRenewal);

router.put('/:id/assign', assignOccupant);

router.put('/:id/extend', handleExtensionDecision)

router.get('/', getRooms);

router.get('/:id', getRoomById)

export default router;
