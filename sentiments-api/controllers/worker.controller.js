import User from '../models/User.js'
import Company from '../models/Company.js'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { sendMemberWelcomeEmail } from '../utils/email.js'

// Create new member
export const createWorker = async (req, res) => {
  try {
    // Get the admin's company details
    const adminUser = await User.findById(req.user.id).populate('company');
    if (!adminUser || !adminUser.company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Generate random password
    const generateRandomPassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let password = '';
      for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const randomPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create member with generated password
    const memberData = {
      ...req.body,
      password: hashedPassword,
      company: adminUser.company._id
    };

    const member = new User(memberData);
    await member.save();

    // Get company details for email
    const company = await Company.findById(adminUser.company._id);

    // Send welcome email with role-specific content
    try {
      await sendMemberWelcomeEmail(
        member.email,
        member.name,
        member.role,
        randomPassword,
        company.companyId,
        company.companyName,
        member.department || null
      );
      console.log('✅ Member welcome email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send member welcome email:', emailError.message);
      // Don't fail the member creation if email fails
    }

    // Return member without password
    const { password, ...memberResponse } = member.toObject();
    return res.status(201).json(memberResponse);
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
}

// Get all members
export const getWorkers = async (req, res) => {
  try {
    console.log("workers")
    const adminUser = await User.findById(req.user.id).populate('company');
    if (!adminUser || !adminUser.company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    const members = await User.find({
      company: adminUser.company._id,
      role: { $in: ['staff', 'patient'] }
    }).select('-password -resetToken -resetTokenExpires');
    console.log({members})
    return res.status(200).json(members)
  } catch (err) {
   return res.status(500).json({ message: err.message })
  }
}

// Update worker
export const updateWorker = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id).populate('company');
    if (!adminUser || !adminUser.company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Verify the worker belongs to the same company
    const existingWorker = await User.findById(req.params.id);
    if (!existingWorker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    if (existingWorker.company.toString() !== adminUser.company._id.toString()) {
      return res.status(403).json({ message: 'Access denied: Worker belongs to different company' });
    }

    // Don't allow updating password, company, or role to admin
    const { password, company, role: newRole, ...updateData } = req.body;
    if (newRole === 'admin') {
      return res.status(400).json({ message: 'Cannot change role to admin' });
    }
    if (newRole) {
      updateData.role = newRole;
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    ).select('-password -resetToken -resetTokenExpires');

   return res.status(200).json(updated)
  } catch (err) {
   return res.status(400).json({ message: err.message })
  }
}

// Delete worker
export const deleteWorker = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id).populate('company');
    if (!adminUser || !adminUser.company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Verify the worker belongs to the same company
    const existingWorker = await User.findById(req.params.id);
    if (!existingWorker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    if (existingWorker.company.toString() !== adminUser.company._id.toString()) {
      return res.status(403).json({ message: 'Access denied: Worker belongs to different company' });
    }

    // Don't allow deleting admin users
    if (existingWorker.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(req.params.id);
   return res.status(204).send()
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}
