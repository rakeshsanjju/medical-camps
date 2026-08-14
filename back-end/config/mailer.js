const nodemailer =
    require("nodemailer");


/* =========================================
   SMTP SETTINGS
========================================= */

const SMTP_HOST =
    process.env.SMTP_HOST ||
    "smtp.gmail.com";

const SMTP_PORT =
    Number(
        process.env.SMTP_PORT ||
        587
    );

const SMTP_USER =
    process.env.SMTP_USER;

const SMTP_PASS =
    process.env.SMTP_PASS;


/* =========================================
   CHECK VARIABLES
========================================= */

console.log(
    "SMTP HOST:",
    SMTP_HOST
);

console.log(
    "SMTP PORT:",
    SMTP_PORT
);

console.log(
    "SMTP USER:",
    SMTP_USER
        ? SMTP_USER
        : "MISSING"
);

console.log(
    "SMTP PASSWORD:",
    SMTP_PASS
        ? "SET"
        : "MISSING"
);


/* =========================================
   CREATE TRANSPORTER
========================================= */

const transporter =
    nodemailer.createTransport({

        host:
            SMTP_HOST,

        port:
            SMTP_PORT,

        secure:
            SMTP_PORT === 465,

        auth: {

            user:
                SMTP_USER,

            pass:
                SMTP_PASS

        },

        connectionTimeout:
            15000,

        greetingTimeout:
            15000,

        socketTimeout:
            20000

    });


/* =========================================
   VERIFY SMTP
========================================= */

transporter
    .verify()
    .then(() => {

        console.log(
            "✅ SMTP SERVER READY"
        );

        console.log(
            "✅ SMTP LOGIN SUCCESSFUL"
        );

    })
    .catch((error) => {

        console.error(
            "❌ SMTP VERIFICATION FAILED"
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
            "COMMAND:",
            error.command
        );

        console.error(
            "RESPONSE:",
            error.response
        );

    });


module.exports =
    transporter;