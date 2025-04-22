const express = require('express');
const router = express.Router();
const tellerController = require('../controllers/tellerController.js');

router.get('/', tellerController.getAllTellers);
router.get('/browse', tellerController.getAllBrowseTellers);
router.get('/:id', tellerController.getTellerById);
router.patch('/:id', tellerController.patchTellerById);
router.patch('/patch/:id', tellerController.patchTellerByUserId);
router.post('/', tellerController.createTeller);

router.patch('/accept-session/:sessionId', tellerController.patchAcceptSession);
router.patch('/decline-session/:sessionId', tellerController.patchDeclineSession);
router.patch('/end-session/:sessionId', tellerController.patchEndSession);
router.get('/sessionData/:sessionId', tellerController.getSessionDataBySessionId);
router.get('/get-teller-info/:sessionId', tellerController.getTellerInfoBySessionId);

router.post('/:tellerId/teller-package', tellerController.postTellerPackageByTellerId);
router.delete('/:tellerId/teller-package', tellerController.deleteTellerPackageByTellerId);
router.get('/:tellerId/teller-package', tellerController.getTellerPackageByTellerId);
router.patch('/:tellerId/teller-package', tellerController.patchTellerPackageByTellerId);

router.patch('/teller-package', tellerController.patchTellerPackageByUserId);

router.get('/:tellerId/upcoming-session', tellerController.getUpcomingSessionByTellerId);
router.get('/:tellerId/past-session', tellerController.getPastSessionByTellerId);
router.get('/:tellerId/current-session', tellerController.getCurrentSessionByTellerId);

router.post('/create-review', tellerController.createReview);
router.get('/get-review/:tellerId', tellerController.getReviewByTellerId);

module.exports = router;