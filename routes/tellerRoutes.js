const express = require('express');
const router = express.Router();
const tellerController = require('../controllers/tellerController.js');

router.get('/', tellerController.getAllTellers);
router.get('/browse', tellerController.getAllBrowseTellers);
router.get('/:id', tellerController.getTellerById);
router.post('/', tellerController.createTeller);

router.get('/teller-package/:tellerId', tellerController.getTellerPackageById);
router.get('/upcoming-session/:tellerId', tellerController.getUpcomingSessionByTellerId);
router.get('/past-session/:tellerId', tellerController.getPastSessionByTellerId);
router.patch('/accept-session/:sessionId', tellerController.patchAcceptSession);
router.patch('/decline-session/:sessionId', tellerController.patchDeclineSession);

module.exports = router;