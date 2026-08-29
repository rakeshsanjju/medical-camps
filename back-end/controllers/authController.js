const crypto = require("crypto");

const transporter = require("../config/mailer");
const otpStore = require("../utils/otpStore");

/* =========================================================
   AUTH CONTROLLER VERSION
========================================================= */

const AUTH_VERSION = "2026-08-20-super-admin-login-v6";

/* =========================================================
   ROLE CONFIGURATION
========================================================= */

const ROLE_CONFIG = {
  super_admin: {
    dashboard: "super-admin-dashboard.html",
  },

  admin: {
    dashboard: "admin-dashboard.html",
  },

  campaigner: {
    dashboard: "dashboard.html",
  },

  counsellor: {
    dashboard: "counsellor.html",
  },

  telesales: {
    dashboard: "telesales.html",
  },
};

/* =========================================================
   AUTHORIZED USERS
========================================================= */

const ALLOWED_USERS = {
  /* -------------------------
       ADMIN
    ------------------------- */

  "rakesh@avishospitals.com": {
    role: "admin",
  },

  "praveen@avishospitals.com": {
    role: "admin",
  },

  /* -------------------------
       CAMPAIGNER
    ------------------------- */

  "sanjurakeshdasari4@gmail.com": {
    role: "campaigner",
  },

  "reception.avis@gmail.com": {
    role: "campaigner",
  },

  "chintalajagadesh@avisvascularcentre.com": {
    role: "campaigner",
  },

  /* -------------------------
       COUNSELLORS
    ------------------------- */

  "srinivasoman2017@gmail.com": {
    role: "counsellor",
  },

  "umamaheshavis@gmail.com": {
    role: "counsellor",
  },

  "avishospitalrjy1@gmail.com": {
    role: "counsellor",
  },

  "nazeer.shaike2@gmail.com": {
    role: "counsellor",
  },

  "babashaik@avisvascularcentre.com": {
    role: "counsellor",
  },

  "richard@avishospitals.com": {
    role: "counsellor",
  },

  "rakeshdev7465@gmail.com": {
    role: "super_admin",
  },

  /* -------------------------
       TELESALES
    ------------------------- */

  "tele.sales@avisvascularcentre.com": {
    role: "telesales",
  },

  "rakeshdasari0705@gmail.com": {
    role: "telesales",
  },
};

/* =========================================================
   NORMALIZE EMAIL
========================================================= */

function normalizeEmail(value) {
  return String(value == null ? "" : value)
    .trim()
    .toLowerCase();
}

/* =========================================================
   NORMALIZE ROLE
========================================================= */

function normalizeRole(value) {
  return String(value == null ? "" : value)
    .trim()
    .toLowerCase();
}

/* =========================================================
   VALIDATE EMAIL
========================================================= */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* =========================================================
   AUTHORIZED USER LOOKUP
========================================================= */

function getAuthorizedUser(email) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  let user = ALLOWED_USERS[normalizedEmail];

  /*
   * Additional explicit safeguard
   * for Telesales login.
   */

  if (!user && normalizedEmail === "tele.sales@avisvascularcentre.com") {
    user = {
      role: "telesales",
    };
  }

  if (!user) {
    return null;
  }

  const role = normalizeRole(user.role);

  if (!ROLE_CONFIG[role]) {
    console.error(
      "INVALID ROLE:",

      normalizedEmail,

      role,
    );

    return null;
  }

  return {
    email: normalizedEmail,

    role: role,

    dashboard: ROLE_CONFIG[role].dashboard,
  };
}

/* =========================================================
   REMOVE OTP
========================================================= */

function removeOtp(email) {
  try {
    otpStore.delete(email);
  } catch (error) {
    console.error("OTP DELETE ERROR:", error);
  }
}

/* =========================================================
   SEND OTP
========================================================= */

const sendOtp = async (req, res) => {
  let email = "";

  try {
    /* =========================================
               GET EMAIL
            ========================================= */

    email = normalizeEmail(req.body?.email);

    console.log("AUTH VERSION:", AUTH_VERSION);

    console.log("LOGIN ATTEMPT:", email);

    /* =========================================
               EMAIL REQUIRED
            ========================================= */

    if (!email) {
      return res.status(400).json({
        success: false,

        message: "Email is required",

        authVersion: AUTH_VERSION,
      });
    }

    /* =========================================
               EMAIL FORMAT
            ========================================= */

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,

        message: "Enter a valid email address",

        authVersion: AUTH_VERSION,
      });
    }

    /* =========================================
               AUTHORIZATION
            ========================================= */

    const user = getAuthorizedUser(email);

    if (!user) {
      console.log("UNAUTHORIZED LOGIN:", email);

      return res.status(403).json({
        success: false,

        message: "You don't have permission to access this dashboard.",

        authVersion: AUTH_VERSION,
      });
    }

    console.log(
      "AUTHORIZED LOGIN:",

      user.email,

      user.role,

      user.dashboard,
    );

    /* =========================================
               SMTP SETTINGS
            ========================================= */

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("SMTP CONFIGURATION MISSING");

      return res.status(500).json({
        success: false,

        message: "Email service is not configured.",

        authVersion: AUTH_VERSION,
      });
    }

    /* =========================================
               GENERATE OTP
            ========================================= */

    const otp = crypto.randomInt(100000, 1000000).toString();

    const expiresAt = Date.now() + 5 * 60 * 1000;

    /* =========================================
               STORE OTP
            ========================================= */

    otpStore.set(email, {
      otp: otp,

      expiresAt: expiresAt,

      role: user.role,

      dashboard: user.dashboard,

      attempts: 0,
    });

    /* =========================================
               SEND OTP EMAIL
            ========================================= */

    try {
      const info = await transporter.sendMail({
        from: `"Medical Dashboard" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,

        to: email,

        subject: "Medical Dashboard Login OTP",

        text: `Your Medical Dashboard login OTP is ${otp}. This OTP expires in 5 minutes.`,

        html: `

                                <div
                                    style="
                                        font-family: Arial, sans-serif;
                                        max-width: 500px;
                                        margin: 0 auto;
                                        padding: 30px;
                                        background: #ffffff;
                                        border: 1px solid #e5e7eb;
                                        border-radius: 12px;
                                    "
                                >

                                    <h2
                                        style="
                                            color: #0D5174;
                                            text-align: center;
                                            margin: 0 0 24px;
                                        "
                                    >
                                        Medical Dashboard
                                    </h2>


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
                                            background: #f1f5f9;
                                            padding: 20px;
                                            margin: 20px 0;
                                            border-radius: 10px;
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
                                        <strong>
                                            5 minutes
                                        </strong>.
                                    </p>


                                    <p
                                        style="
                                            color: #94a3b8;
                                            font-size: 12px;
                                            margin-top: 24px;
                                        "
                                    >
                                        If you did not request this OTP,
                                        you can ignore this email.
                                    </p>

                                </div>

                            `,
      });

      console.log(
        "OTP EMAIL SENT:",

        info.messageId,
      );
    } catch (mailError) {
      removeOtp(email);

      console.error("SMTP ERROR:", mailError);

      return res.status(500).json({
        success: false,

        message: "Unable to send OTP. Email service error.",

        authVersion: AUTH_VERSION,
      });
    }

    /* =========================================
               SUCCESS
            ========================================= */

    return res.status(200).json({
      success: true,

      message: "OTP sent successfully",

      role: user.role,

      dashboard: user.dashboard,

      authVersion: AUTH_VERSION,

      isSuperAdmin: user.role === "super_admin",
    });
  } catch (error) {
    if (email) {
      removeOtp(email);
    }

    console.error("SEND OTP ERROR:", error);

    return res.status(500).json({
      success: false,

      message: error.message || "Unable to send OTP",

      authVersion: AUTH_VERSION,
    });
  }
};

/* =========================================================
   VERIFY OTP
========================================================= */

const verifyOtp = async (req, res) => {
  try {
    /* =========================================
               EMAIL
            ========================================= */

    const email = normalizeEmail(req.body?.email);

    /* =========================================
               OTP
            ========================================= */

    const otp = String(req.body?.otp || "").trim();

    console.log(
      "VERIFY OTP:",

      email,

      "AUTH VERSION:",

      AUTH_VERSION,
    );

    /* =========================================
               EMAIL REQUIRED
            ========================================= */

    if (!email) {
      return res.status(400).json({
        success: false,

        message: "Email is required",

        authVersion: AUTH_VERSION,
      });
    }

    /* =========================================
               EMAIL VALIDATION
            ========================================= */

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,

        message: "Enter a valid email address",

        authVersion: AUTH_VERSION,
      });
    }

    /* =========================================
               AUTHORIZATION
            ========================================= */

    const user = getAuthorizedUser(email);

    if (!user) {
      return res.status(403).json({
        success: false,

        message: "You don't have permission to access this dashboard.",

        authVersion: AUTH_VERSION,
      });
    }

    /* =========================================
               OTP REQUIRED
            ========================================= */

    if (!otp) {
      return res.status(400).json({
        success: false,

        message: "OTP is required",

        authVersion: AUTH_VERSION,
      });
    }

    /* =========================================
               OTP FORMAT
            ========================================= */

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,

        message: "Enter a valid 6-digit OTP",

        authVersion: AUTH_VERSION,
      });
    }

    /* =========================================
               GET STORED OTP
            ========================================= */

    const stored = otpStore.get(email);

    if (!stored) {
      return res.status(400).json({
        success: false,

        message: "OTP not found. Please request a new OTP.",

        authVersion: AUTH_VERSION,
      });
    }

    /* =========================================
               CHECK EXPIRY
            ========================================= */

    if (Date.now() > stored.expiresAt) {
      removeOtp(email);

      return res.status(400).json({
        success: false,

        message: "OTP expired. Please request a new OTP.",

        authVersion: AUTH_VERSION,
      });
    }

    /* =========================================
               ATTEMPTS
            ========================================= */

    stored.attempts = (stored.attempts || 0) + 1;

    otpStore.set(email, stored);

    if (stored.attempts > 5) {
      removeOtp(email);

      return res.status(429).json({
        success: false,

        message: "Too many incorrect attempts. Please request a new OTP.",

        authVersion: AUTH_VERSION,
      });
    }

    /* =========================================
               CHECK OTP
            ========================================= */

    if (stored.otp !== otp) {
      return res.status(400).json({
        success: false,

        message: "Invalid OTP",

        authVersion: AUTH_VERSION,
      });
    }

    /* =========================================
               FINAL ROLE
            ========================================= */

    const role = normalizeRole(stored.role || user.role);

    if (!ROLE_CONFIG[role]) {
      removeOtp(email);

      return res.status(403).json({
        success: false,

        message: "Invalid user role.",

        authVersion: AUTH_VERSION,
      });
    }

    /* =========================================
               DASHBOARD
            ========================================= */

    const dashboard = stored.dashboard || ROLE_CONFIG[role].dashboard;

    /* =========================================
               OTP SINGLE USE
            ========================================= */

    removeOtp(email);

    console.log(
      "LOGIN SUCCESS:",

      email,

      role,

      dashboard,
    );

    /* =========================================
               LOGIN SUCCESS
            ========================================= */

    return res.status(200).json({
      success: true,

      message: "Login successful",

      email: email,

      role: role,

      dashboard: dashboard,

      authVersion: AUTH_VERSION,
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);

    return res.status(500).json({
      success: false,

      message: error.message || "Unable to verify OTP",

      authVersion: AUTH_VERSION,

      isSuperAdmin: role === "super_admin",

      accessLevel: role,
    });
  }
};

/* =========================================================
   STARTUP DEBUG
========================================================= */

console.log(
  "AUTH CONTROLLER VERSION:",

  AUTH_VERSION,
);

console.log(
  "TELESALES AUTHORIZED:",

  Boolean(
    ALLOWED_USERS[
      ("tele.sales@avisvascularcentre.com", "rakeshdasari0705@gmail.com")
    ],
  ),
);

console.log(
  "SUPER ADMIN AUTHORIZED:",

  Boolean(
    ALLOWED_USERS["rakeshdev7465@gmail.com"] &&
    ALLOWED_USERS["rakeshdev7465@gmail.com"].role === "super_admin",
  ),
);

module.exports = {
  sendOtp,

  verifyOtp,
};
