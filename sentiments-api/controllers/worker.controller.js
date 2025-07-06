import Worker from '../models/worker.model.js'

// Create new worker
export const createWorker = async (req, res) => {
  try {
    const worker = new Worker(req.body)
    await worker.save()
    res.status(201).json(worker)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Get all workers
export const getWorkers = async (req, res) => {
  try {
    const workers = await Worker.find()
    res.status(200).json(workers)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Update worker
export const updateWorker = async (req, res) => {
  try {
    const updated = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.status(200).json(updated)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Delete worker
export const deleteWorker = async (req, res) => {
  try {
    await Worker.findByIdAndDelete(req.params.id)
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
