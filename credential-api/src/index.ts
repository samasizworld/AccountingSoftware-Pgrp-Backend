import { CredentialController } from "./controller/CredentialController";
import { sequelizeConnect } from "./sequelize/sequelize";

let express = require("express");
let app = express();
let http = require("http");
let router = express.Router();
let bodyParser = require("body-parser");
let helmet = require("helmet");
let featurePolicy = require('feature-policy');
let cors=require('cors');
const port = 5000;

sequelizeConnect("user_db");
var httpServer = http.createServer(app).listen(port, () => {
    console.log(`Server Running on port ${port}`);
});
httpServer.timeout = 300000;

app.use(bodyParser.json({ limit: "100mb" }));
app.use(
    bodyParser.urlencoded({
        limit: "100mb",
        extended: true,
        parameterLimit: 100000,
    })
);
app.use(
    helmet({
        frameguard: {
            action: "sameorigin",
        },
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            },
        },
        hsts: {
            maxAge: 5184000,
        },
        referrerPolicy: {
            policy: "same-origin",
        },
    })
);
app.use(featurePolicy({

    features: {
        camera: ["'none'"],
        microphone: ["'none'"],
        geolocation: ["'none'"],
    },

}));
app.use(cors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE"
}));

app.use("/", router);

app.use(function customErrorHandler(err, req, res, next) {
    console.log("customErrorHandler...Error" + err);
    res.status(400).send({ message: "Not allowed!" });
});

// route here
router.post("/Login", (req, res) => { CredentialController.Login(req, res) });
router.post("/Logout", (req, res) => { CredentialController.Logout(req, res) });
router.post('/Authorize', (req, res) => { CredentialController.Authorize(req, res) });
router.post('/Authenticate', (req, res) => { CredentialController.Authenticate(req, res) });

app.use(function (req, res, next) {
    console.log("Nodeapi request not found");
    res.status(400).send({ message: "Node api Bad Request!!" });
});
