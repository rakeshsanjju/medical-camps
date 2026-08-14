const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT =
    process.env.PORT || 3001;

const HOST =
    "0.0.0.0";

const ROOT =
    __dirname;


/* =========================================
   MIME TYPES
========================================= */

const mimeTypes = {

    ".html":
        "text/html; charset=utf-8",

    ".css":
        "text/css; charset=utf-8",

    ".js":
        "application/javascript; charset=utf-8",

    ".json":
        "application/json; charset=utf-8",

    ".png":
        "image/png",

    ".jpg":
        "image/jpeg",

    ".jpeg":
        "image/jpeg",

    ".svg":
        "image/svg+xml",

    ".ico":
        "image/x-icon"

};


/* =========================================
   SERVER
========================================= */

const server =
    http.createServer(
        function(req, res) {


            let requestPath =
                decodeURIComponent(
                    req.url.split("?")[0]
                );


            /*
             * Main Railway URL
             * opens login page.
             */
            if (
                requestPath === "/"
            ) {

                requestPath =
                    "/login.html";

            }


            /*
             * Security:
             * prevent paths such as ../../
             */
            const safePath =
                path.normalize(
                    requestPath
                )
                .replace(
                    /^(\.\.[\/\\])+/,
                    ""
                );


            let filePath =
                path.join(
                    ROOT,
                    safePath
                );


            /*
             * Make sure requested path
             * stays inside front-end folder.
             */
            if (
                !filePath.startsWith(
                    ROOT
                )
            ) {

                res.writeHead(
                    403,
                    {
                        "Content-Type":
                            "text/plain"
                    }
                );

                res.end(
                    "Forbidden"
                );

                return;

            }



            fs.stat(
                filePath,

                function(
                    error,
                    stats
                ) {


                    if (
                        !error &&
                        stats.isDirectory()
                    ) {

                        filePath =
                            path.join(
                                filePath,
                                "index.html"
                            );

                    }



                    fs.readFile(
                        filePath,

                        function(
                            readError,
                            content
                        ) {


                            if (
                                readError
                            ) {


                                /*
                                 * File not found.
                                 */

                                res.writeHead(
                                    404,
                                    {
                                        "Content-Type":
                                            "text/html; charset=utf-8"
                                    }
                                );


                                res.end(`

                                    <!DOCTYPE html>

                                    <html>

                                    <head>

                                        <title>
                                            404
                                        </title>

                                    </head>

                                    <body>

                                        <h2>
                                            Page not found
                                        </h2>

                                    </body>

                                    </html>

                                `);


                                return;

                            }



                            const extension =
                                path
                                    .extname(
                                        filePath
                                    )
                                    .toLowerCase();


                            const contentType =
                                mimeTypes[
                                    extension
                                ]
                                ||
                                "application/octet-stream";


                            res.writeHead(
                                200,
                                {
                                    "Content-Type":
                                        contentType
                                }
                            );


                            res.end(
                                content
                            );


                        }
                    );


                }
            );


        }
    );



/* =========================================
   START
========================================= */

server.listen(
    PORT,
    HOST,
    function() {

        console.log(
            `Medical Camps frontend running on http://${HOST}:${PORT}`
        );

    }
);