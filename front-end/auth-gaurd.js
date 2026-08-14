/* ==========================================
   MEDICAL CAMPS AUTH GUARD
========================================== */


/* ==========================================
   GET AUTH DATA
========================================== */

function getAuthData() {

    return {

        loggedIn:
            sessionStorage.getItem(
                "medical_logged_in"
            ),

        email:
            sessionStorage.getItem(
                "medical_user_email"
            ),

        role:
            sessionStorage.getItem(
                "medical_user_role"
            )

    };

}


/* ==========================================
   CLEAR AUTH DATA
========================================== */

function clearMedicalLogin() {

    sessionStorage.removeItem(
        "medical_logged_in"
    );

    sessionStorage.removeItem(
        "medical_user_email"
    );

    sessionStorage.removeItem(
        "medical_user_role"
    );

}


/* ==========================================
   REQUIRE CAMPAIGNER
========================================== */

function requireCampaigner() {


    const auth =
        getAuthData();


    if (
        auth.loggedIn !== "true"
    ) {


        clearMedicalLogin();


        window.location.replace(
            "./login.html"
        );


        return false;

    }


    if (
        auth.role !==
        "campaigner"
    ) {


        /*
         * If logged in as counsellor,
         * send to counsellor page.
         */

        if (
            auth.role ===
            "counsellor"
        ) {


            window.location.replace(
                "./counsellor.html"
            );


            return false;

        }


        clearMedicalLogin();


        window.location.replace(
            "./login.html"
        );


        return false;

    }


    return true;

}


/* ==========================================
   REQUIRE COUNSELLOR
========================================== */

function requireCounsellor() {


    const auth =
        getAuthData();


    if (
        auth.loggedIn !== "true"
    ) {


        clearMedicalLogin();


        window.location.replace(
            "./login.html"
        );


        return false;

    }


    if (
        auth.role !==
        "counsellor"
    ) {


        /*
         * Campaigner cannot manually
         * open counsellor.html.
         */

        if (
            auth.role ===
            "campaigner"
        ) {


            window.location.replace(
                "./dashboard.html"
            );


            return false;

        }


        clearMedicalLogin();


        window.location.replace(
            "./login.html"
        );


        return false;

    }


    return true;

}


/* ==========================================
   LOGOUT
========================================== */

function logoutMedicalUser() {


    clearMedicalLogin();


    window.location.replace(
        "./login.html"
    );


}