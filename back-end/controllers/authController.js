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

    try {

        const email =
            String(
                req.body.email || ""
            )
            .trim()
            .toLowerCase();


        console.log(
            "Login attempt:",
            email
        );


        /* Email required */

        if (!email) {

            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        "Email is required"

                });

        }


        /* Email validation */

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailRegex.test(email)
        ) {

            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        "Enter a valid email address"

                });

        }


        /* =====================================
           CHECK PERMISSION BEFORE SENDING OTP
        ===================================== */

        const user =
            allowedUsers[email];


        if (!user) {

            console.log(
                "Unauthorized login:",
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
            "Authorized user:",
            email,
            user.role
        );


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


        otpStore.set(
            email,
            {

                otp,

                expiresAt,

                role:
                    user.role

            }
        );


        /* =====================================
           SEND OTP
        ===================================== */

        await transporter.sendMail({

            from:
                `"Medical Dashboard" <${process.env.SMTP_USER}>`,

            to:
                email,

            subject:
                "Medical Dashboard Login OTP",

            html: `

                <div
                    style="
                        font-family:Arial,sans-serif;
                        max-width:500px;
                        margin:auto;
                        padding:25px;
                    "
                >

                    <h2>
                        Medical Dashboard
                    </h2>

                    <p>
                        Your login OTP is:
                    </p>

                    <h1
                        style="
                            letter-spacing:6px;
                        "
                    >
                        ${otp}
                    </h1>

                    <p>
                        This OTP expires in
                        5 minutes.
                    </p>

                </div>

            `

        });


        return res
            .status(200)
            .json({

                success: true,

                message:
                    "OTP sent successfully"

            });


    } catch (error) {

        console.error(
            "SEND OTP ERROR:",
            error
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
                req.body.email || ""
            )
            .trim()
            .toLowerCase();


        const otp =
            String(
                req.body.otp || ""
            )
            .trim();


        /* Check permission again */

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


        if (!otp) {

            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        "OTP is required"

                });

        }


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


        const role =
            stored.role;


        otpStore.delete(
            email
        );


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