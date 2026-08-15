const express = require("express");

const router = express.Router();

const {
    sendOtp,
    verifyOtp
} = require(
    "../controllers/authController"
);

router.get(
    "/test",
    (req, res) => {

        res.status(200).json({
            success: true,
            message: "Auth routes are working"
        });

    }
);


router.post(
    "/send-otp",
    sendOtp
);


router.post(
    "/verify-otp",
    verifyOtp
);


module.exports = router;
