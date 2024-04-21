import { authenticate, authorize } from "./controllers/CredentialController";
import { JournalEntryController } from "./controllers/JournalEntryController";
import { LedgerController } from "./controllers/LedgerController";
import { TrialBalanceController } from "./controllers/AccountReportController";
import { sequelizeConnect } from "./sequelize/connection";
import { multiFormMiddleware } from "./services/mutiFormHandler";
import { LedgerHeadTypeController } from "./controllers/LedgerHeadTypeController";

let express = require("express");
let app = express();
let http = require("http");
let router = express.Router();
let bodyParser = require("body-parser");
let helmet = require("helmet");
let featurePolicy = require('feature-policy')
let cors=require('cors');

const port = 4000;

sequelizeConnect("account_db");
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



router.get("/JournalEntries", (req, res) => {
    JournalEntryController.GetJournals(req, res);
});

// router.post("/JournalEntries/Files", multiFormMiddleware.single('xlsx'), [authenticate, authorize], (req, res) => {
//     JournalEntryController.PostJournal(req, res);
// });

router.post("/JournalEntries/Files", multiFormMiddleware.single('xlsx'), [authenticate, authorize], (req, res) => {
    JournalEntryController.MapJournalDataFromFile(req, res);
});

router.get('/Ledgers', [authenticate, authorize], (req, res) => {
    LedgerController.GetLedgers(req, res);
})

router.get('/Ledgers/:ledgerid', [authenticate, authorize], (req, res) => {
    LedgerController.GetLedger(req, res);
})

router.post('/Ledgers', [authenticate, authorize], (req, res) => {
    LedgerController.PostLedger(req, res);
})
router.post('/Ledgers/:ledgerid/Send', [authenticate, authorize], (req, res) => {
    LedgerController.sendLedger(req, res);
})
// router.get('/Ledgers/Link/Users', [authenticate, authorize], (req, res) => {
//     LedgerController.LinkLedgerToUser(req, res);
// })
router.post('/JournalEntries/Upsert', [authenticate, authorize], (req, res) => {
    JournalEntryController.UpsertJournal(req, res);
})

router.get('/TrialBalance',[authenticate],(req,res)=>{
    TrialBalanceController.GenerateTrailBalance(req,res);
});

router.get('/PLAccount',[authenticate],(req,res)=>{
    TrialBalanceController.generateProfitandLossAccount(req,res);
});
router.get('/BalanceSheet',[authenticate],(req,res)=>{
    TrialBalanceController.generateBalanceSheet(req,res);
});

router.get('/LedgerTypes',[authenticate],(req,res)=>{
    LedgerHeadTypeController.GetLedgerHeadTypes(req,res);
})


app.use(function (req, res, next) {
    console.log("Nodeapi request not found");
    res.status(400).send({ message: "Node api Bad Request!!" });
});
