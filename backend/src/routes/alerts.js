const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

// GET all alerts — latest 50, unacknowledged first
router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find()
      .sort({ acknowledged: 1, timestamp: -1 })
      .limit(50);
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET unacknowledged alert count — for navbar badge
router.get('/count', async (req, res) => {
  try {
    const count = await Alert.countDocuments({ acknowledged: false });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH acknowledge a single alert
router.patch('/:id/acknowledge', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { acknowledged: true },
      { new: true }
    );
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH acknowledge all alerts
router.patch('/acknowledge-all', async (req, res) => {
  try {
    await Alert.updateMany({ acknowledged: false }, { acknowledged: true });
    res.json({ success: true, message: 'All alerts acknowledged' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE clear all acknowledged alerts
router.delete('/clear', async (req, res) => {
  try {
    await Alert.deleteMany({ acknowledged: true });
    res.json({ success: true, message: 'Cleared acknowledged alerts' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;