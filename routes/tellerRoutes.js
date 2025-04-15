const express = require('express');
const router = express.Router();
const tellerController = require('../controllers/tellerController.js');

router.get('/', tellerController.getAllTellers);
router.get('/browse', tellerController.getAllBrowseTellers);
router.get('/:id', tellerController.getTellerById);
router.patch('/:id', tellerController.patchTellerById);
router.post('/', tellerController.createTeller);

router.patch('/accept-session/:sessionId', tellerController.patchAcceptSession);
router.patch('/decline-session/:sessionId', tellerController.patchDeclineSession);
router.patch('/end-session/:sessionId', tellerController.patchEndSession);

router.post('/:tellerId/teller-package', tellerController.postTellerPackageByTellerId);
router.delete('/:tellerId/teller-package', tellerController.deleteTellerPackageByTellerId);
router.get('/:tellerId/teller-package', tellerController.getTellerPackageByTellerId);

router.get('/:tellerId/upcoming-session', tellerController.getUpcomingSessionByTellerId);
router.get('/:tellerId/past-session', tellerController.getPastSessionByTellerId);
router.get('/:tellerId/current-session', tellerController.getCurrentSessionByTellerId);

module.exports = router;