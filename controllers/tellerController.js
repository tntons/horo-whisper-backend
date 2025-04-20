const tellerService = require('../services/tellerService.js');

const invalidInputTypeMsg={
  status: 'error',
  code: 'INVALID_ID',
  message: 'Invalid Input Type'
}

// GET /tellers
exports.getAllTellers = async (req, res, next) => {
  try {
    const tellers = await tellerService.getAllTellers();
    return res.status(200).json({
      success: true,
      data: tellers,
    });
  } catch (err) {
    next(err);
  }
};

// GET /tellers/browse
exports.getAllBrowseTellers = async (req, res, next) => {
  try {
    const tellers = await tellerService.getAllBrowseTellers();
    res.json(tellers);
  } catch (err) {
    next(err);
  }
};

exports.getTellerByUserId = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const teller = await tellerService.getTellerByUserId(userId);
    if (!teller) {
      return res.status(404).json({ message: 'Teller not found' });
    }
    res.json(teller);
  } catch (err) {
    next(err);
  }
}

// GET /tellers/:id
exports.getTellerById = async (req, res, next) => {
  try {
    const tellerId = parseInt(req.params.id, 10);
    const teller = await tellerService.getTellerById(tellerId);
    if (!teller) {
      return res.status(404).json({ message: 'Teller not found' });
    }
    res.json(teller);
  } catch (err) {
    next(err);
  }
};

exports.patchTellerById = async (req, res, next) => {
  try {
    const tellerId = parseInt(req.params.id, 10);

    // Validate tellerId
    if (isNaN(tellerId)) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_ID',
        message: 'Invalid Input Type',
      });
    }

    const updateData = req.body; // Expecting JSON with fields to update

    // Call the service to update the teller
    const updatedTeller = await tellerService.updateTellerById(tellerId, updateData);

    return res.status(200).json({
      success: true,
      data: updatedTeller,
    });
  } catch (err) {
    next(err);
  }
};

exports.patchTellerByUserId = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body; // Expecting JSON with fields to update

    // Call the service to update the teller
    const updatedTeller = await tellerService.updateTellerByUserId(userId, updateData);

    return res.status(200).json({
      success: true,
      data: updatedTeller,
    });
  } catch (err) {
    next(err);
  }
};

// POST /tellers
exports.createTeller = async (req, res, next) => {
  try {
    const tellerData = req.body; // Expecting JSON: { name, email }
    const newTeller = await tellerService.createTeller(tellerData);
    res.status(200).json(newTeller);
  } catch (err) {
    next(err);
  }
};

exports.postTellerPackageByTellerId = async (req, res, next) => {
  try {
    const tellerId = parseInt(req.params.tellerId, 10);

    // Validate tellerId
    if (isNaN(tellerId)) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_ID',
        message: 'Invalid Input Type',
      });
    }

    const packageData = req.body; // Expecting JSON: { packageDetail, questionNumber, price }

    // Call the service to create the package
    const newPackage = await tellerService.createTellerPackage(tellerId, packageData);

    return res.status(201).json({
      success: true,
      data: newPackage,
    });
  } catch (err) {
    next(err);
  }
};

exports.patchTellerPackageByUserId = async (req, res, next) => {
  try {
    const userId = req.user.userId
    const updateData = req.body

    if (!updateData || typeof updateData !== 'object') {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_INPUT',
        message: 'Request body must be an object with fields to update'
      })
    }

    const updated = await tellerService.patchTellerPackageByUserId(userId, updateData)

    return res.status(200).json({
      success: true,
      data: updated
    })
  } catch (err) {
    next(err)
  }
}

exports.deleteTellerPackageByTellerId = async (req, res, next) => {
  try {
    const tellerId = parseInt(req.params.tellerId, 10);

    // Validate tellerId
    if (isNaN(tellerId)) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_ID',
        message: 'Invalid Input Type',
      });
    }

    const packageId = parseInt(req.body.packageId, 10); // Assuming packageId is sent in the request body

    // Validate packageId
    if (isNaN(packageId)) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_PACKAGE_ID',
        message: 'Invalid Package ID',
      });
    }

    // Call the service to delete the package
    await tellerService.deleteTellerPackage(tellerId, packageId);

    return res.status(200).json({
      success: true,
      message: 'Teller package deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

exports.getTellerPackageByTellerId = async (req, res, next) => {
  try {
    const tellerId = parseInt(req.params.tellerId, 10);

    // check if tellerId is a number
    if (isNaN(tellerId)) {
      return res.status(400).json(invalidInputTypeMsg);
    }

    const package = await tellerService.getTellerPackageByTellerId(tellerId);
    return res.status(200).json({
      success: true,
      data: package
    })
    res.json(package);
  } catch (err) {
    next(err);
  }
};

exports.patchTellerPackageByTellerId = async (req, res, next) => {
  try {
    const tellerId = parseInt(req.params.tellerId, 10);

    if (isNaN(tellerId)) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_ID',
        message: 'Invalid Input Type',
      });
    }

    const { packages } = req.body;

    if (!Array.isArray(packages)) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_BODY',
        message: 'Expected an array of packages in request body',
      });
    }

    // Split by status
    const newPackages = packages.filter(pkg => pkg.status === 'New');
    const deletedPackages = packages.filter(pkg => pkg.status === 'Deleted');

    // Create new packages
    const createdResults = await Promise.all(
      newPackages.map(pkg =>
        tellerService.createTellerPackage(tellerId, {
          packageDetail: pkg.packageDetail,
          questionNumber: pkg.questionNumber,
          price: pkg.price,
        })
      )
    );

    // Mark deleted packages
    const deletedResults = await Promise.all(
      deletedPackages.map(pkg =>
        tellerService.markTellerPackageDeleted(tellerId, pkg.id)
      )
    );

    return res.status(200).json({
      success: true,
      message: 'Packages updated',
      created: createdResults,
      deleted: deletedResults,
    });
  } catch (err) {
    next(err);
  }
};


exports.getUpcomingSessionByTellerId = async (req, res, next) => {
  try {
    const tellerId = parseInt(req.params.tellerId, 10);

    // check if tellerId is a number
    if (isNaN(tellerId)) {
      return res.status(400).json(invalidInputTypeMsg);
    }

    const result = await tellerService.getSessionByTellerId("upcoming",tellerId);


    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (err) {
    next(err);
  }
};

exports.getPastSessionByTellerId = async (req, res, next) => {
  try {
    const tellerId = parseInt(req.params.tellerId, 10);
    //check if tellerId is a number
    if (isNaN(tellerId)) {
      return res.status(400).json(invalidInputTypeMsg);
    }

    const result = await tellerService.getSessionByTellerId("past",tellerId);

    return res.status(200).json({
      success:true,
      data: result
    });

  } catch (err) {
    next(err);
  }
};

exports.getCurrentSessionByTellerId = async (req, res, next) => {
  try {
    const tellerId = parseInt(req.params.tellerId, 10);

    // check if tellerId is a number
    if (isNaN(tellerId)) {
      return res.status(400).json(invalidInputTypeMsg);
    }

    const result = await tellerService.getSessionByTellerId("current",tellerId);

    return res.status(200).json({ 
      success:true,
      data: result
    });

  } catch (err) {
    next(err);
  }
}

exports.patchAcceptSession = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.sessionId, 10);

    // check if sessionId is a number
    if (isNaN(sessionId)) {
      return res.status(400).json(invalidInputTypeMsg);
    }

    const acceptSession = await tellerService.patchSessionStatus(sessionId,"Processing");

    return res.status(200).json({
      success: true,
      data: acceptSession
    });

  } catch (err) {
    next(err);
  }
};


exports.patchDeclineSession = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.sessionId, 10);

    // check if sessionId is a number
    if (isNaN(sessionId)) {
      return res.status(400).json(invalidInputTypeMsg);
    }

    const declineSession = await tellerService.patchSessionStatus(sessionId,"Declined");

    return res.status(200).json({
      success: true,
      data: declineSession
    });
  } catch (err) {
    next(err);
  }
}

exports.patchEndSession = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.sessionId, 10);

    // check if sessionId is a number
    if (isNaN(sessionId)) {
      return res.status(400).json(invalidInputTypeMsg);
    }

    const endSession = await tellerService.patchSessionStatus(sessionId,"Ended");

    return res.status(200).json({
      success: true,
      data: endSession
    });
  } catch (err) {
    next(err);
  }
}

exports.postReview = async (req, res, next) => {
  try {
    const { sessionId, rating, comment } = req.body;

    // Validate input
    if (!sessionId || isNaN(rating) || rating < 0 || rating > 5) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_INPUT',
        message: 'Invalid sessionId or rating. Rating must be between 0 and 5.',
      });
    }

    // Check if the session exists and has a status of "Ended"
    const session = await tellerService.getSessionById(sessionId);
    if (!session) {
      return res.status(404).json({
        status: 'error',
        code: 'SESSION_NOT_FOUND',
        message: 'Session not found',
      });
    }

    if (session.sessionStatus !== 'Ended') {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_SESSION_STATUS',
        message: 'Review can only be created for past-session".',
      });
    }

    // Call the service to create the review
    const newReview = await tellerService.createReview({ sessionId, rating, comment });

    return res.status(201).json({
      success: true,
      data: newReview,
    });
  } catch (err) {
    next(err);
  }
};