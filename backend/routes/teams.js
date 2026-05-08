const express = require('express');
const router = express.Router();
const { Team } = require('../models/Others');
const { protect, authorize } = require('../middleware/auth');
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const teams = await Team.find()
      .populate({ path: 'members', populate: { path: 'user', select: 'name avatar email' } })
      .populate({ path: 'leader', populate: { path: 'user', select: 'name avatar' } })
      .populate('projects', 'title status progress');
    res.json({ success: true, data: teams });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate({ path: 'members', populate: { path: 'user', select: 'name avatar email phone' } })
      .populate({ path: 'leader', populate: { path: 'user', select: 'name avatar' } })
      .populate('projects', 'title status progress');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, data: team });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', authorize('admin'), async (req, res) => {
  try {
    const team = await Team.create({ ...req.body, createdBy: req.user._id });
    if (req.body.members?.length) {
      const Intern = require('../models/Intern');
      await Intern.updateMany({ _id: { $in: req.body.members } }, { team: team._id });
    }
    res.status(201).json({ success: true, data: team });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: team });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Team deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
