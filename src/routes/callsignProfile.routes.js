const express = require('express');
const {
  getCallsignProfiles,
  getCallsignProfile,
  createCallsignProfile,
  updateCallsignProfile,
  deleteCallsignProfile,
  setDefaultCallsignProfile,
  getDefaultCallsignProfile
} = require('../controllers/callsignProfile.controller');

const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// 保护所有路由
router.use(authMiddleware);

router
  .route('/')
  .get(getCallsignProfiles)
  .post(createCallsignProfile);

router
  .route('/default')
  .get(getDefaultCallsignProfile);

router
  .route('/:id')
  .get(getCallsignProfile)
  .put(updateCallsignProfile)
  .delete(deleteCallsignProfile);

router
  .route('/:id/set-default')
  .put(setDefaultCallsignProfile);

module.exports = router;

