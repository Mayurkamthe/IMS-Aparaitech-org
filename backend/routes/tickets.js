const express = require('express');
const router = express.Router();
const { SupportTicket } = require('../models/Others');
const Intern = require('../models/Intern');
const { protect, authorize } = require('../middleware/auth');
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { intern: (await Intern.findOne({ user: req.user._id }))?._id };
    const { status } = req.query;
    if (status) query.status = status;
    const tickets = await SupportTicket.find(query)
      .populate({ path: 'intern', populate: { path: 'user', select: 'name avatar email' } })
      .populate('replies.user', 'name role avatar').sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', authorize('intern'), async (req, res) => {
  try {
    const intern = await Intern.findOne({ user: req.user._id });
    const ticket = await SupportTicket.create({ ...req.body, intern: intern._id });
    res.status(201).json({ success: true, data: ticket });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/:id/reply', async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { $push: { replies: { user: req.user._id, message: req.body.message, isAdmin: req.user.role === 'admin' } } },
      { new: true }
    ).populate('replies.user', 'name role avatar');
    res.json({ success: true, data: ticket });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id/status', authorize('admin'), async (req, res) => {
  try {
    const update = { status: req.body.status };
    if (req.body.status === 'resolved') { update.resolvedAt = new Date(); update.resolvedBy = req.user._id; }
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, data: ticket });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
