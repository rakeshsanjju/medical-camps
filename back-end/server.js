require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

const PORT = process.env.PORT || 3000;


/* =========================
   CORS
========================= */

app.use(
    cors({
        origin: [
            "http://127.0.0.1:5501",
            "http://localhost:5501",
            "http://localhost:3001",
            "https://peaceful-courtesy-production-1ef1.up.railway.app",
            "*"
        ],
        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);


/* =========================
   MIDDLEWARE
========================= */

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =========================
   ROUTES
========================= */

app.use(
    "/api/auth",
    authRoutes
);


/* =========================
   SERVER TEST
========================= */

app.get(
    "/api/status",
    (req, res) => {

        res.status(200).json({
            success: true,
            message:
                "Node.js server running successfully"
        });

    }
);


/* =========================
   404
========================= */

app.use(
    (req, res) => {

        res.status(404).json({
            success: false,
            message: "Route not found"
        });

    }
);


/* =========================
   START SERVER
========================= */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Server running successfully on port ${PORT}`
        );

        console.log(
            `API status: http://localhost:${PORT}/api/status`
        );

    }
);