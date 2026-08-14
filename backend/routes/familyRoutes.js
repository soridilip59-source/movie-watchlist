const express = require('express');
const router = express.Router();
const {
  createFamily,
  getFamilyById,
  addFamilyMember,
  removeFamilyMember,
  getFamilyDashboard,
  getFamilyRecommendations,
} = require('../controllers/familyController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, createFamily);
router.get('/:id', protect, getFamilyById);
router.post('/:id/members', protect, authorize('parent'), addFamilyMember);
router.delete('/:id/members/:userId', protect, authorize('parent'), removeFamilyMember);
router.get('/:id/dashboard', protect, getFamilyDashboard);
router.get('/:id/recommendations', protect, getFamilyRecommendations);

module.exports = router;
