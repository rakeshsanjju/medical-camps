require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes =
    require("./routes/authRoutes");


const app = express();


/* =====================================================
   PORT
===================================================== */

const PORT =
    process.env.PORT || 3000;


/* =====================================================
   FRONTEND URLS
===================================================== */

function normalizeOrigin(origin) {

    if (!origin) {
        return "";
    }

    return origin
        .trim()
        .replace(/\/+$/, "");

}


const allowedOrigins =
    new Set(
        [

            /* Local development */

            "http://127.0.0.1:5501",

            "http://localhost:5501",

            "http://127.0.0.1:3001",

            "http://localhost:3001",


            /* Railway production frontend */

            "https://peaceful-courtesy-production-1ef1.up.railway.app",


            /*
             * Optional Railway environment variable.
             *
             * Add:
             * FRONTEND_URL=https://peaceful-courtesy-production-1ef1.up.railway.app
             *
             * in Railway Variables.
             */

            process.env.FRONTEND_URL

        ]
            .filter(Boolean)
            .map(normalizeOrigin)

    );


/* =====================================================
   REQUEST LOGGER
===================================================== */

app.use(
    (req, res, next) => {

        console.log(
            "====================================="
        );

        console.log(
            `${req.method} ${req.originalUrl}`
        );

        console.log(
            "Origin:",
            req.headers.origin || "NO ORIGIN"
        );

        console.log(
            "Access-Control-Request-Method:",
            req.headers[
                "access-control-request-method"
            ] || "NONE"
        );

        console.log(
            "Access-Control-Request-Headers:",
            req.headers[
                "access-control-request-headers"
            ] || "NONE"
        );

        console.log(
            "====================================="
        );

        next();

    }
);


/* =====================================================
   CORS CONFIGURATION
===================================================== */

const corsOptions = {

    origin:
        function (
            origin,
            callback
        ) {


            /*
             * Allow requests with no Origin header.
             *
             * Examples:
             * Postman
             * curl
             * Railway internal checks
             */

            if (!origin) {

                return callback(
                    null,
                    true
                );

            }


            const normalizedOrigin =
                normalizeOrigin(
                    origin
                );


            if (
                allowedOrigins.has(
                    normalizedOrigin
                )
            ) {

                console.log(
                    "CORS ALLOWED:",
                    normalizedOrigin
                );


                return callback(
                    null,
                    true
                );

            }


            console.error(
                "CORS BLOCKED:",
                normalizedOrigin
            );


            return callback(
                new Error(
                    `CORS_NOT_ALLOWED:${normalizedOrigin}`
                )
            );

        },


    methods: [

        "GET",

        "POST",

        "PUT",

        "PATCH",

        "DELETE",

        "OPTIONS"

    ],


    /*
     * IMPORTANT:
     *
     * Do NOT manually specify allowedHeaders here.
     *
     * cors will automatically reflect:
     *
     * Access-Control-Request-Headers
     *
     * sent by the browser.
     *
     * Your frontend currently sends:
     *
     * Content-Type
     * Accept
     */


    credentials:
        false,


    optionsSuccessStatus:
        204,


    preflightContinue:
        false

};


/* =====================================================
   ENABLE CORS BEFORE ALL ROUTES
===================================================== */

app.use(
    cors(
        corsOptions
    )
);


/*
 * IMPORTANT:
 *
 * app.use(cors()) already handles OPTIONS
 * preflight requests globally.
 *
 * Do NOT put auth routes above this middleware.
 */


/* =====================================================
   BODY PARSERS
===================================================== */

app.use(
    express.json({
        limit:
            "1mb"
    })
);


app.use(
    express.urlencoded({

        extended:
            true,

        limit:
            "1mb"

    })
);


/* =====================================================
   ROOT TEST
===================================================== */

app.get(
    "/",
    (req, res) => {

        return res
            .status(200)
            .json({

                success:
                    true,

                message:
                    "Medical Camps Backend API is running"

            });

    }
);


/* =====================================================
   HEALTH CHECK
===================================================== */

app.get(
    "/api/health",
    (req, res) => {

        return res
            .status(200)
            .json({

                success:
                    true,

                message:
                    "Medical Camps API is healthy",

                environment:
                    process.env.NODE_ENV ||
                    "development",

                timestamp:
                    new Date()
                        .toISOString()

            });

    }
);


/* =====================================================
   SERVER STATUS
===================================================== */

app.get(
    "/api/status",
    (req, res) => {

        return res
            .status(200)
            .json({

                success:
                    true,

                message:
                    "Node.js server running successfully",

                environment:
                    process.env.NODE_ENV ||
                    "development"

            });

    }
);


/* =====================================================
   AUTH ROUTES
===================================================== */

app.use(
    "/api/auth",
    authRoutes
);


/* =====================================================
   CORS DEBUG ROUTE
===================================================== */

app.get(
    "/api/cors-test",
    (req, res) => {

        return res
            .status(200)
            .json({

                success:
                    true,

                message:
                    "CORS connection successful",

                requestOrigin:
                    req.headers.origin ||
                    null

            });

    }
);


/* =====================================================
   404
===================================================== */

app.use(
    (req, res) => {

        return res
            .status(404)
            .json({

                success:
                    false,

                message:
                    "Route not found",

                path:
                    req.originalUrl

            });

    }
);


/* =====================================================
   ERROR HANDLER
===================================================== */

app.use(
    (
        error,
        req,
        res,
        next
    ) => {


        console.error(
            "====================================="
        );

        console.error(
            "SERVER ERROR:"
        );

        console.error(
            error
        );

        console.error(
            "====================================="
        );


        /* =====================================
           CORS ERROR
        ===================================== */

        if (
            error.message &&
            error.message.startsWith(
                "CORS_NOT_ALLOWED:"
            )
        ) {

            return res
                .status(403)
                .json({

                    success:
                        false,

                    message:
                        "This frontend origin is not allowed by the backend.",

                    origin:
                        req.headers.origin ||
                        null

                });

        }


        /* =====================================
           JSON ERROR
        ===================================== */

        if (
            error instanceof SyntaxError &&
            error.status === 400 &&
            "body" in error
        ) {

            return res
                .status(400)
                .json({

                    success:
                        false,

                    message:
                        "Invalid JSON request body"

                });

        }


        /* =====================================
           GENERAL ERROR
        ===================================== */

        return res
            .status(
                error.status || 500
            )
            .json({

                success:
                    false,

                message:
                    process.env.NODE_ENV ===
                    "production"

                        ? "Internal server error"

                        : (
                            error.message ||
                            "Internal server error"
                        )

            });

    }
);


/* =====================================================
   START SERVER
===================================================== */

app.listen(
    PORT,
    "0.0.0.0",
    () => {


        console.log(
            "=========================================="
        );


        console.log(
            "Medical Camps Backend Started"
        );


        console.log(
            `PORT: ${PORT}`
        );


        console.log(
            `Environment: ${
                process.env.NODE_ENV ||
                "development"
            }`
        );


        console.log(
            ""
        );


        console.log(
            "ALLOWED FRONTEND ORIGINS:"
        );


        allowedOrigins.forEach(
            (origin) => {

                console.log(
                    "✅",
                    origin
                );

            }
        );


        console.log(
            ""
        );


        console.log(
            "API ROUTES:"
        );


        console.log(
            "GET  /"
        );


        console.log(
            "GET  /api/health"
        );


        console.log(
            "GET  /api/status"
        );


        console.log(
            "GET  /api/cors-test"
        );


        console.log(
            "POST /api/auth/send-otp"
        );


        console.log(
            "POST /api/auth/verify-otp"
        );


        console.log(
            "=========================================="
        );

    }
);