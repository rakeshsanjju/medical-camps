require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes =
    require("./routes/authRoutes");


const app =
    express();


const PORT =
    process.env.PORT || 3000;


/* =====================================================
   ALLOWED FRONTEND ORIGINS
===================================================== */

const allowedOrigins = [

    /* Local development */

    "http://127.0.0.1:5501",

    "http://localhost:5501",

    "http://127.0.0.1:3001",

    "http://localhost:3001",


    /* Railway production frontend */

    "https://peaceful-courtesy-production-1ef1.up.railway.app"

];


/* =====================================================
   NORMALIZE ORIGIN
===================================================== */

function normalizeOrigin(origin) {

    if (!origin) {

        return "";

    }


    return origin
        .trim()
        .replace(/\/+$/, "");

}


/* =====================================================
   CORS OPTIONS
===================================================== */

const corsOptions = {


    origin: function (
        origin,
        callback
    ) {


        /*
         * Allow requests without Origin
         *
         * Example:
         * Postman
         * curl
         * Railway health checks
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


        const isAllowed =
            allowedOrigins
                .map(normalizeOrigin)
                .includes(
                    normalizedOrigin
                );


        if (isAllowed) {


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
                "Not allowed by CORS"
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
     * DO NOT manually set allowedHeaders.
     *
     * cors will automatically allow headers
     * requested by browser preflight.
     *
     * Example:
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
   CORS - MUST COME BEFORE ROUTES
===================================================== */

app.use(
    cors(
        corsOptions
    )
);


/* =====================================================
   REQUEST LOGGER
===================================================== */

app.use(
    (
        req,
        res,
        next
    ) => {


        console.log(
            "-------------------------------------"
        );


        console.log(
            `${req.method} ${req.originalUrl}`
        );


        console.log(
            "Origin:",
            req.headers.origin ||
            "NO ORIGIN"
        );


        console.log(
            "Requested Method:",
            req.headers[
                "access-control-request-method"
            ] ||
            "NONE"
        );


        console.log(
            "Requested Headers:",
            req.headers[
                "access-control-request-headers"
            ] ||
            "NONE"
        );


        console.log(
            "-------------------------------------"
        );


        next();

    }
);


/* =====================================================
   BODY MIDDLEWARE
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
    (
        req,
        res
    ) => {


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
    (
        req,
        res
    ) => {


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
    (
        req,
        res
    ) => {


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
   CORS TEST
===================================================== */

app.get(
    "/api/cors-test",
    (
        req,
        res
    ) => {


        return res
            .status(200)
            .json({

                success:
                    true,

                message:
                    "CORS is working",

                origin:
                    req.headers.origin ||
                    null

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
   404
===================================================== */

app.use(
    (
        req,
        res
    ) => {


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
            "SERVER ERROR:",
            error
        );


        /* =============================================
           CORS ERROR
        ============================================= */

        if (
            error.message ===
            "Not allowed by CORS"
        ) {


            return res
                .status(403)
                .json({

                    success:
                        false,

                    message:
                        "Frontend origin is not allowed by CORS.",

                    origin:
                        req.headers.origin ||
                        null

                });

        }


        /* =============================================
           INVALID JSON
        ============================================= */

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
                        "Invalid JSON request."

                });

        }


        /* =============================================
           GENERAL ERROR
        ============================================= */

        return res
            .status(500)
            .json({

                success:
                    false,

                message:
                    error.message ||
                    "Internal server error"

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
            "========================================"
        );


        console.log(
            "Medical Camps Backend Started"
        );


        console.log(
            `Server running on port ${PORT}`
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
            "Allowed Origins:"
        );


        allowedOrigins.forEach(
            (
                origin
            ) => {


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
            "Available Routes:"
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
            "========================================"
        );

    }
);