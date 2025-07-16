import Tenant from '../models/Tenant.js'

export const getTenantsByRoom = async (req, res) => {
  try {
    const { roomId } = req.query
    if (!roomId) return res.status(400).json({ message: 'roomId is required' })

    const tenants = await Tenant.find({ roomId }).sort({ startTime: -1 }) // most recent first
    res.status(200).json(tenants)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tenants', error: error.message })
  }
}

export const getAllTenants = async (req, res) => {
  const filter = {}
  if (req.query.roomId) filter.roomId = req.query.roomId

  try {
    const tenants = await Tenant.find(filter).sort({ startTime: -1 })
    res.status(200).json(tenants)
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tenants' })
  }
}
