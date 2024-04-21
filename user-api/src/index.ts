import { authenticate, authorize } from "./controllers/CredentialController";
import { UserController } from "./controllers/UserController";
import { UserRoleController } from './controllers/UserRoleController';
import { sequelizeConnect } from "./sequelize/sequelize";

let express = require("express");
let app = express();
let http = require("http");
let router = express.Router();
let bodyParser = require("body-parser");
let helmet = require("helmet");
let featurePolicy = require('feature-policy')
let cors = require('cors')
const port = 3000;

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

}))
app.use(cors({
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE"
}));


app.use(function customErrorHandler(err, req, res, next) {
  console.log("customErrorHandler...Error" + err);
  res.status(400).send({ message: "Not allowed!" });
});


app.use("/", router);
// user related route here
// UserRoute start here
// router.post("/User/Upsert", [authenticate, authorize], (req, res) => {
//   UserController.UpsertUser(req, res);
// });

router.get("/User", [authenticate, authorize], (req, res) => {
  UserController.GetUsers(req, res);
})

router.get("/User/:userid", [authenticate, authorize], (req, res) => {
  UserController.GetUser(req, res);
});

router.post("/User", [authenticate, authorize], (req, res) => {
  UserController.UpsertUserProfile(req, res);
});
//UserRoute end here

// UserRoute start here
router.post("/UserRole/Upsert", [authenticate, authorize], (req, res) => {
  UserRoleController.UpsertUserRole(req, res);
});
//UserRoute end here



app.use(function (req, res, next) {
  console.log("Nodeapi request not found");
  res.status(400).send({ message: "Node api Bad Request!!" });
});
