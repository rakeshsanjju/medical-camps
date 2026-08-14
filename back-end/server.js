require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

const PORT = process.env.PORT || 3000;


/* =====================================================
   ALLOWED FRONTEND ORIGINS
===================================================== */

const allowedOrigins = [

    // Local development
    "http://127.0.0.1:5501",
    "http://localhost:5501",
    "http://127.0.0.1:3001",
    "http://localhost:3001",

    // Railway production frontend
    "https://peaceful-courtesy-production-1ef1.up.railway.app",
    "https://medical-camps-production.up.railway.app/"

];


/* =====================================================
   CORS
===================================================== */

app.use(
    cors({

        origin: function (origin, callback) {

            /*
             * Allow requests without an Origin header
             * such as Postman, Railway health checks, etc.
             */
            if (!origin) {

                return callback(
                    null,
                    true
                );

            }


            if (
                allowedOrigins.includes(origin)
            ) {

                return callback(
                    null,
                    true
                );

            }


            console.log(
                "Blocked CORS origin:",
                origin
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


        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]

    })
);


/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(
    express.json()
);


app.use(
    express.urlencoded({
        extended: true
    })
);


/* =====================================================
   ROOT TEST
===================================================== */

app.get(
    "/",
    (req, res) => {

        res.status(200).json({

            success: true,

            message:
                "Medical Camps Backend API is running"

        });

    }
);


/* =====================================================
   SERVER STATUS
===================================================== */

app.get(
    "/api/status",
    (req, res) => {

        res.status(200).json({

            success: true,

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
   404
===================================================== */

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "Route not found"

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


        res.status(500).json({

            success: false,

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
            `Server running successfully on port ${PORT}`
        );


        console.log(
            `Environment: ${
                process.env.NODE_ENV ||
                "development"
            }`
        );

    }
);