const crypto = require("crypto");

const transporter =
    require("../config/mailer");

const otpStore =
    require("../utils/otpStore");


/* =========================================
   ONLY THESE USERS CAN LOGIN
========================================= */

const allowedUsers = {

    "rakesh@avishospitals.com": {
        role: "admin"
    },

    "sanjurakeshdasari4@gmail.com": {
        role: "campaigner"
    },

    "srinivasoman2017@gmail.com":{
        role: "counsellor"
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
     "praveen@avishospitals.com": {
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
           GET EMAIL SAFELY
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

        if (email.startsWith("rakeshdasari0705@gmail.com")) {
            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        "Can't use this email for login"

                });
        }


        /* =====================================
           EMAIL VALIDATION
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
           CHECK AUTHORIZED USER
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
           CHECK SMTP CONFIGURATION
        ===================================== */

        if (
            !process.env.SMTP_USER ||
            !process.env.SMTP_PASS
        ) {

            console.error(
                "SMTP CONFIGURATION MISSING"
            );

            console.error(
                "SMTP_USER:",
                process.env.SMTP_USER
                    ? "SET"
                    : "MISSING"
            );

            console.error(
                "SMTP_PASS:",
                process.env.SMTP_PASS
                    ? "SET"
                    : "MISSING"
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Email service is not configured."

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

                expiresAt: expiresAt,

                role: user.role,

                attempts: 0

            }
        );


        console.log(
            "OTP GENERATED FOR:",
            email
        );


        /* =====================================
           SEND OTP EMAIL
        ===================================== */

        try {

            const info =
                await transporter.sendMail({

                    from:
                        `"Medical Dashboard" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,

                    to:
                        email,

                    subject:
                        "Medical Dashboard Login OTP",

                    text:
                        `Your Medical Dashboard login OTP is ${otp}. This OTP expires in 5 minutes.`,

                    html: `

                        <div
                            style="
                                font-family: Arial, sans-serif;
                                max-width: 500px;
                                margin: auto;
                                padding: 30px;
                                border: 1px solid #e5e7eb;
                                border-radius: 12px;
                                background: #ffffff;
                            "
                        >

                            <div
                                style="
                                    text-align: center;
                                    margin-bottom: 20px;
                                "
                            >

                                <h2
                                    style="
                                        margin: 0;
                                        color: #0D5174;
                                    "
                                >
                                    Medical Dashboard
                                </h2>

                            </div>


                            <p
                                style="
                                    font-size: 15px;
                                    color: #334155;
                                "
                            >
                                Your login OTP is:
                            </p>


                            <div
                                style="
                                    background: #f1f5f9;
                                    border-radius: 10px;
                                    padding: 20px;
                                    margin: 20px 0;
                                    text-align: center;
                                "
                            >

                                <span
                                    style="
                                        font-size: 32px;
                                        font-weight: bold;
                                        letter-spacing: 7px;
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
                                This OTP expires in
                                <strong>5 minutes</strong>.
                            </p>


                            <p
                                style="
                                    color: #94a3b8;
                                    font-size: 12px;
                                    margin-top: 25px;
                                "
                            >
                                If you did not request this OTP,
                                please ignore this email.
                            </p>

                        </div>

                    `

                });


            console.log(
                "OTP EMAIL SENT SUCCESSFULLY"
            );

            console.log(
                "MESSAGE ID:",
                info.messageId
            );


        } catch (mailError) {

            /* Remove OTP when email sending fails */

            otpStore.delete(email);


            console.error(
                "========== SMTP ERROR =========="
            );

            console.error(
                "MESSAGE:",
                mailError.message
            );

            console.error(
                "CODE:",
                mailError.code
            );

            console.error(
                "COMMAND:",
                mailError.command
            );

            console.error(
                "RESPONSE:",
                mailError.response
            );

            console.error(
                "RESPONSE CODE:",
                mailError.responseCode
            );

            console.error(
                "STACK:",
                mailError.stack
            );

            console.error(
                "================================"
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Unable to send OTP. Email service error."

                });

        }


        /* =====================================
           SUCCESS
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

            otpStore.delete(email);

        }


        console.error(
            "========== SEND OTP ERROR =========="
        );

        console.error(
            "MESSAGE:",
            error.message
        );

        console.error(
            "CODE:",
            error.code
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
                    "Unable to send OTP"

            });

    }

};


/* =========================================
   VERIFY OTP
========================================= */

const verifyOtp = async (req, res) => {

    try {

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
           CHECK AUTHORIZED USER
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
           OTP VALIDATION
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


        if (!/^\d{6}$/.test(otp)) {

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
            otpStore.get(email);


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

            otpStore.delete(email);


            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        "OTP expired. Please request a new OTP."

                });

        }


        /* =====================================
           LIMIT WRONG ATTEMPTS
        ===================================== */

        stored.attempts =
            (stored.attempts || 0) + 1;


        if (stored.attempts > 5) {

            otpStore.delete(email);


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
           DELETE USED OTP
        ===================================== */

        otpStore.delete(email);


        console.log(
            "LOGIN SUCCESS:",
            email,
            role
        );


        /* =====================================
           LOGIN SUCCESS
        ===================================== */

        return res
            .status(200)
            .json({

                success: true,

                message:
                    "Login successful",

                role: role

            });


    } catch (error) {

        console.error(
            "VERIFY OTP ERROR:"
        );

        console.error(
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
