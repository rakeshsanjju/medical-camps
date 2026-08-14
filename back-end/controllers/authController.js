const crypto = require("crypto");

const { Resend } =
    require("resend");

const otpStore =
    require("../utils/otpStore");


/* =========================================
   RESEND
========================================= */

const resend =
    new Resend(
        process.env.RESEND_API_KEY
    );


/* =========================================
   ONLY THESE USERS CAN LOGIN
========================================= */

const allowedUsers = {

    "rakesh@avishospitals.com": {
        role: "campaigner"
    },

    "sanjurakeshdasari4@gmail.com": {
        role: "campaigner"
    },

    "babashaik@avisvascularcentre.com": {
        role: "counsellor"
    },

    "rakeshdev7465@gmail.com": {
        role: "counsellor"
    },

    "rakeshdasari0705@gmail.com": {
        role: "admin"
    }

};


/* =========================================
   SEND OTP
========================================= */

const sendOtp = async (req, res) => {

    let email = "";

    try {

        /* =====================================
           GET EMAIL
        ===================================== */

        email =
            String(
                req.body?.email || ""
            )
                .trim()
                .toLowerCase();


        console.log(
            "LOGIN ATTEMPT:",
            email
        );


        /* =====================================
           EMAIL REQUIRED
        ===================================== */

        if (!email) {

            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        "Email is required"

                });

        }


        /* =====================================
           EMAIL FORMAT
        ===================================== */

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailRegex.test(email)) {

            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        "Enter a valid email address"

                });

        }


        /* =====================================
           CHECK PERMISSION
        ===================================== */

        const user =
            allowedUsers[email];


        if (!user) {

            console.log(
                "UNAUTHORIZED LOGIN:",
                email
            );


            return res
                .status(403)
                .json({

                    success: false,

                    message:
                        "You don't have permission to access this dashboard."

                });

        }


        console.log(
            "AUTHORIZED USER:",
            email,
            user.role
        );


        /* =====================================
           CHECK RESEND CONFIGURATION
        ===================================== */

        if (
            !process.env.RESEND_API_KEY
        ) {

            console.error(
                "RESEND_API_KEY IS MISSING"
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Email service is not configured."

                });

        }


        if (
            !process.env.RESEND_FROM_EMAIL
        ) {

            console.error(
                "RESEND_FROM_EMAIL IS MISSING"
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Sender email is not configured."

                });

        }


        /* =====================================
           GENERATE OTP
        ===================================== */

        const otp =
            crypto
                .randomInt(
                    100000,
                    1000000
                )
                .toString();


        const expiresAt =
            Date.now() +
            5 * 60 * 1000;


        /* =====================================
           STORE OTP
        ===================================== */

        otpStore.set(
            email,
            {

                otp: otp,

                expiresAt:
                    expiresAt,

                role:
                    user.role,

                attempts:
                    0

            }
        );


        console.log(
            "OTP GENERATED FOR:",
            email
        );


        /* =====================================
           SEND EMAIL USING RESEND HTTPS API
        ===================================== */

        const {
            data,
            error
        } =
            await resend.emails.send({

                from:
                    `Medical Dashboard <${process.env.RESEND_FROM_EMAIL}>`,

                to: [
                    email
                ],

                subject:
                    "Medical Dashboard Login OTP",

                text:
                    `Your Medical Dashboard login OTP is ${otp}. This OTP expires in 5 minutes.`,

                html: `

                    <div
                        style="
                            font-family: Arial, sans-serif;
                            max-width: 520px;
                            margin: auto;
                            padding: 30px;
                            background: #ffffff;
                            border: 1px solid #e2e8f0;
                            border-radius: 12px;
                        "
                    >

                        <div
                            style="
                                text-align: center;
                                margin-bottom: 25px;
                            "
                        >

                            <h2
                                style="
                                    margin: 0;
                                    color: #0D5174;
                                    font-size: 24px;
                                "
                            >
                                Medical Dashboard
                            </h2>

                        </div>


                        <p
                            style="
                                color: #334155;
                                font-size: 15px;
                            "
                        >
                            Your login OTP is:
                        </p>


                        <div
                            style="
                                margin: 20px 0;
                                padding: 22px;
                                text-align: center;
                                background: #f1f5f9;
                                border-radius: 10px;
                            "
                        >

                            <span
                                style="
                                    font-size: 34px;
                                    font-weight: bold;
                                    letter-spacing: 8px;
                                    color: #0f172a;
                                "
                            >
                                ${otp}
                            </span>

                        </div>


                        <p
                            style="
                                color: #475569;
                                font-size: 14px;
                            "
                        >
                            This OTP will expire in
                            <strong>
                                5 minutes
                            </strong>.
                        </p>


                        <p
                            style="
                                margin-top: 25px;
                                color: #94a3b8;
                                font-size: 12px;
                            "
                        >
                            If you did not request this OTP,
                            please ignore this email.
                        </p>

                    </div>

                `

            });


        /* =====================================
           RESEND ERROR
        ===================================== */

        if (error) {

            otpStore.delete(
                email
            );


            console.error(
                "========== RESEND ERROR =========="
            );

            console.error(
                error
            );

            console.error(
                "=================================="
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        error.message ||
                        "Unable to send OTP."

                });

        }


        /* =====================================
           SUCCESS LOG
        ===================================== */

        console.log(
            "OTP EMAIL SENT"
        );


        console.log(
            "RESEND EMAIL ID:",
            data?.id
        );


        /* =====================================
           SUCCESS RESPONSE
        ===================================== */

        return res
            .status(200)
            .json({

                success: true,

                message:
                    "OTP sent successfully"

            });


    } catch (error) {

        if (email) {

            otpStore.delete(
                email
            );

        }


        console.error(
            "========== SEND OTP ERROR =========="
        );

        console.error(
            "MESSAGE:",
            error.message
        );

        console.error(
            "STACK:",
            error.stack
        );

        console.error(
            "===================================="
        );


        return res
            .status(500)
            .json({

                success: false,

                message:
                    error.message ||
                    "Unable to send OTP"

            });

    }

};


/* =========================================
   VERIFY OTP
========================================= */

const verifyOtp = async (req, res) => {

    try {

        /* =====================================
           GET VALUES
        ===================================== */

        const email =
            String(
                req.body?.email || ""
            )
                .trim()
                .toLowerCase();


        const otp =
            String(
                req.body?.otp || ""
            )
                .trim();


        /* =====================================
           EMAIL REQUIRED
        ===================================== */

        if (!email) {

            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        "Email is required"

                });

        }


        /* =====================================
           AUTHORIZED USER CHECK
        ===================================== */

        const user =
            allowedUsers[email];


        if (!user) {

            return res
                .status(403)
                .json({

                    success: false,

                    message:
                        "You don't have permission to access this dashboard."

                });

        }


        /* =====================================
           OTP REQUIRED
        ===================================== */

        if (!otp) {

            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        "OTP is required"

                });

        }


        /* =====================================
           VALID 6 DIGITS
        ===================================== */

        if (
            !/^\d{6}$/.test(otp)
        ) {

            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        "Enter a valid 6-digit OTP"

                });

        }


        /* =====================================
           GET STORED OTP
        ===================================== */

        const stored =
            otpStore.get(
                email
            );


        if (!stored) {

            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        "OTP not found. Please request a new OTP."

                });

        }


        /* =====================================
           CHECK EXPIRY
        ===================================== */

        if (
            Date.now() >
            stored.expiresAt
        ) {

            otpStore.delete(
                email
            );


            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        "OTP expired. Please request a new OTP."

                });

        }


        /* =====================================
           ATTEMPT LIMIT
        ===================================== */

        stored.attempts =
            (stored.attempts || 0) + 1;


        if (
            stored.attempts > 5
        ) {

            otpStore.delete(
                email
            );


            return res
                .status(429)
                .json({

                    success: false,

                    message:
                        "Too many incorrect attempts. Please request a new OTP."

                });

        }


        /* =====================================
           CHECK OTP
        ===================================== */

        if (
            stored.otp !== otp
        ) {

            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        "Invalid OTP"

                });

        }


        /* =====================================
           GET ROLE
        ===================================== */

        const role =
            stored.role;


        /* =====================================
           REMOVE USED OTP
        ===================================== */

        otpStore.delete(
            email
        );


        console.log(
            "LOGIN SUCCESS:",
            email,
            role
        );


        /* =====================================
           SUCCESS
        ===================================== */

        return res
            .status(200)
            .json({

                success: true,

                message:
                    "Login successful",

                role:
                    role

            });


    } catch (error) {

        console.error(
            "VERIFY OTP ERROR:",
            error
        );


        return res
            .status(500)
            .json({

                success: false,

                message:
                    "Unable to verify OTP"

            });

    }

};


module.exports = {

    sendOtp,

    verifyOtp

};