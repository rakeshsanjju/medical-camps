// front-end/script.js

const emailStep =
    document.getElementById(
        "emailStep"
    );

const otpStep =
    document.getElementById(
        "otpStep"
    );

const emailInput =
    document.getElementById(
        "email"
    );

const otpInput =
    document.getElementById(
        "otp"
    );

const sendOtpBtn =
    document.getElementById(
        "sendOtpBtn"
    );

const verifyOtpBtn =
    document.getElementById(
        "verifyOtpBtn"
    );

const resendOtpBtn =
    document.getElementById(
        "resendOtpBtn"
    );

const changeEmailBtn =
    document.getElementById(
        "changeEmailBtn"
    );

const displayEmail =
    document.getElementById(
        "displayEmail"
    );

const message =
    document.getElementById(
        "message"
    );


/*
=========================================
API BASE URL
=========================================
If frontend and backend run on the
same Node.js server, keep this empty.

If frontend runs separately on Live Server,
use:
http://localhost:3000
*/

const API_BASE_URL =
    "http://localhost:3000";


/*
=========================================
SEND OTP
=========================================
*/

sendOtpBtn.addEventListener(
    "click",
    sendOtp
);

resendOtpBtn.addEventListener(
    "click",
    sendOtp
);


async function sendOtp() {

    const email =
        emailInput.value
            .trim()
            .toLowerCase();


    if (!email) {

        showMessage(
            "Enter your email address.",
            "error"
        );

        emailInput.focus();

        return;
    }


    if (
        !isValidEmail(email)
    ) {

        showMessage(
            "Enter a valid email address.",
            "error"
        );

        emailInput.focus();

        return;
    }


    setSendOtpLoading(
        true
    );


    showMessage(
        "Sending OTP...",
        ""
    );


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/auth/send-otp`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            email
                        })
                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to send OTP."
            );
        }


        displayEmail.textContent =
            email;


        emailStep.classList.add(
            "hidden"
        );


        otpStep.classList.remove(
            "hidden"
        );


        otpInput.value =
            "";


        otpInput.focus();


        showMessage(
            "OTP sent successfully. Check your email.",
            "success"
        );


    } catch (error) {

        console.error(
            "SEND OTP ERROR:",
            error
        );


        showMessage(
            error.message ||
            "Unable to send OTP.",
            "error"
        );


    } finally {

        setSendOtpLoading(
            false
        );

    }
}


/*
=========================================
VERIFY OTP
=========================================
*/

verifyOtpBtn.addEventListener(
    "click",
    verifyOtp
);


async function verifyOtp() {

    const email =
        emailInput.value
            .trim()
            .toLowerCase();


    const otp =
        otpInput.value
            .trim();


    if (
        !/^\d{6}$/.test(otp)
    ) {

        showMessage(
            "Enter a valid 6-digit OTP.",
            "error"
        );

        otpInput.focus();

        return;
    }


    verifyOtpBtn.disabled =
        true;


    verifyOtpBtn.textContent =
        "Verifying...";


    showMessage(
        "Verifying OTP...",
        ""
    );


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/auth/verify-otp`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            email,
                            otp
                        })
                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "OTP verification failed."
            );
        }


        showMessage(
            "Login successful.",
            "success"
        );


        setTimeout(
            function () {

                window.location.href =
                    "dashboard.html";

            },
            800
        );


    } catch (error) {

        console.error(
            "VERIFY OTP ERROR:",
            error
        );


        showMessage(
            error.message ||
            "Invalid OTP.",
            "error"
        );


    } finally {

        verifyOtpBtn.disabled =
            false;


        verifyOtpBtn.textContent =
            "Verify OTP";

    }
}


/*
=========================================
CHANGE EMAIL
=========================================
*/

changeEmailBtn.addEventListener(
    "click",
    function () {

        otpStep.classList.add(
            "hidden"
        );


        emailStep.classList.remove(
            "hidden"
        );


        otpInput.value =
            "";


        showMessage(
            "",
            ""
        );


        emailInput.focus();

    }
);


/*
=========================================
ALLOW ENTER KEY
=========================================
*/

emailInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter"
        ) {

            sendOtp();

        }

    }
);


otpInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter"
        ) {

            verifyOtp();

        }

    }
);


/*
=========================================
OTP NUMBERS ONLY
=========================================
*/

otpInput.addEventListener(
    "input",
    function () {

        otpInput.value =
            otpInput.value
                .replace(
                    /\D/g,
                    ""
                )
                .slice(
                    0,
                    6
                );

    }
);


/*
=========================================
EMAIL VALIDATION
=========================================
*/

function isValidEmail(
    email
) {

    const pattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    return pattern.test(
        email
    );
}


/*
=========================================
BUTTON LOADING
=========================================
*/

function setSendOtpLoading(
    loading
) {

    sendOtpBtn.disabled =
        loading;


    resendOtpBtn.disabled =
        loading;


    sendOtpBtn.textContent =
        loading
            ? "Sending..."
            : "Send OTP";


    resendOtpBtn.textContent =
        loading
            ? "Sending..."
            : "Resend OTP";

}


/*
=========================================
MESSAGE
=========================================
*/

function showMessage(
    text,
    type
) {

    message.className =
        "message";


    if (type) {

        message.classList.add(
            type
        );

    }


    message.textContent =
        text;
}