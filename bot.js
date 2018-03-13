let url = require('url');
let express = require('express');
let bodyParser = require('body-parser');
let admin = require('firebase-admin');
let fs = require('fs');
let path = require('path');
let fetch = require('node-fetch');

let app, server;

const headers = {
    orgAuthToken: "EIxAn52pE8CFUQOQJDvjWbapqVeFjQJ1",
    'Content-Type': 'application/json'
};
let options = {};

/**
 *
 *      Initializing Firebase
 *
 *
 */
let fbAdminSecret = path.join(__dirname, '.credentials/marchmadness-d7b1f-firebase-admin.json');

fs.readFile(fbAdminSecret, function processClientSecrets(err, content) {
    if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
    }
    // Authorize a client with the loaded credentials.
    initializeDB(JSON.parse(content));
});

function initializeDB(credentials) {
    admin.initializeApp({
        credential: admin.credential.cert(credentials),
        databaseURL: 'https://marchmadness-d7b1f.firebaseio.com/'
    });
}

function endpoint(endpoint, handler) {
    console.log("--> endpoint created " + endpoint);

    app.post(endpoint, function (req, res) {
        console.log("\nENDPOINT: " + endpoint + "\n");

        res.succeed = function (obj) {
            obj = obj || {};
            obj.success = "true";
            console.log('resp> SUCCESS %s', JSON.stringify(obj));
            this.status(200).send(obj);
        };

        res.fail = function (text) {
            console.log('resp> FAIL %s', text);
            this.status(200).send({success: "false", text: text});
        };

        if (req.body) {
            handler(req, req.body, res);
        } else {
            res.succeed();
        }
    });

    app.get("/sendInstantApp", function (req, res) {
        console.log("/sendInstantApp");
        const message = "Click here to fill out your bracket!";
        const instantAppSchemaCode = "marchmadness";
        let params = url.parse(req.url, true).query;
        getPhoneNumber(params.number, function (phoneNumber) {
            bot.sendInstantApp(req, res, phoneNumber, message, instantAppSchemaCode);
        });
        res.status(200).send();
    });

    app.get("/updatePick", function (req, res) {
        console.log("/updatePick");
        let params = url.parse(req.url, true).query;
        getPhoneNumber(params.userId, function (phoneNumber) {
            bot.updatePicks(req, res, phoneNumber, params.gameId, params.selection);
        });
        res.status(200).send();
    });

    app.post("/saveName", function (req, res) {
        console.log("/saveName");
        getPhoneNumber(req.body.userId, function (phoneNumber) {
            bot.saveName(req, res, phoneNumber, req.body.name);
        });
    })

}

// this function sets up all the endpoints for the server
function createEndpoints(bot) {
    app = express();
    app.use(bodyParser.json());

    endpoint("/sendInstantApp", bot.sendInstantApp);
    endpoint("/updatePick", bot.updatePicks);
    endpoint("/saveName", bot.saveName)
}

function getPhoneNumber(userIdNull, callback) {
    let getCustomerNumberURL = 'https://babblebox.io/rest/1.0/customer/';
    //getCustomerNumberURL = getCustomerNumberURL.concat(params.number);

    //------------------------
    //Take out once .addParameter bug is fixed
    //------------------------

    let userId = userIdNull.substring(0, userIdNull.indexOf('n'));
    if (!userId) {
        userId = userIdNull;
    }
    getCustomerNumberURL = getCustomerNumberURL.concat(userId.toString());

    //--------------------------
    // NOTE: Uncomment the above getCustomerNumberURL
    //--------------------------

    options = {};
    options['headers'] = headers;
    fetch(getCustomerNumberURL, options)
        .then(function (response) {
            response.json().then(function (json) {
                if (response.status == "200") {
                    let phoneNumber = json.identities[0].key;
                    callback(phoneNumber);
                } else {
                    console.log("Unknown error in getPhoneNumber");
                    console.log(json);
                }
            })
                .catch(error => {
                    console.log("Error getting JSON in getPhoneNumber");
                    console.log(error.stack);
                })
        })
        .catch(error => {
            console.log("Error getting customer phone number from chatbox");
            console.log(error.stack);
        })
}

let MarchMadnessBot = function () {
    let self = this;

    self.port = 7555;

    const orgChannelCode = "twilio_1_206_7851770";
    const sendMessageURL = "https://babblebox.io/rest/1.0/message/sendToCustomer";

    self.sendInstantApp = function (req, res, number, message, instantAppSchemaCode) {
        console.log("In sendInstantApp");

        options['headers'] = headers;
        options['method'] = 'POST';

        // Get a database reference to our blog
        const db = admin.database();
        // creating a starting path in our database
        const ref = db.ref('users');

        console.log("Adding Picks to Firebase");
        var update = {};
        update[number] = ['place', 'holder'];
        ref.update(update, function (error) {
            if (error) {
                console.log(error);
            } else {
                console.log("Successfully updated Firebase");
            }
        });
        let body = {
            message: message,
            instantAppSchemaCode: instantAppSchemaCode,
            instantAppParameters: {
                TopLeft1: bracket[0],
                TopLeft16: bracket[1],
                TopLeft_8: bracket[2],
                TopLeft_9: bracket[3],
                TopLeft_5: bracket[4],
                TopLeft_12: bracket[5],
                TopLeft_4: bracket[6],
                TopLeft_13: bracket[7],
                TopLeft_6: bracket[8],
                TopLeft_11: bracket[9],
                TopLeft_3: bracket[10],
                TopLeft_14: bracket[11],
                TopLeft_7: bracket[12],
                TopLeft_10: bracket[13],
                TopLeft_2: bracket[14],
                TopLeft_15: bracket[15],
                BottomLeft_1: bracket[16],
                BottomLeft_16: bracket[17],
                BottomLeft_8: bracket[18],
                BottomLeft_9: bracket[19],
                BottomLeft_5: bracket[20],
                BottomLeft_12: bracket[21],
                BottomLeft_4: bracket[22],
                BottomLeft_13: bracket[23],
                BottomLeft_6: bracket[24],
                BottomLeft_11: bracket[25],
                BottomLeft_3: bracket[26],
                BottomLeft_14: bracket[27],
                BottomLeft_7: bracket[28],
                BottomLeft_10: bracket[29],
                BottomLeft_2: bracket[30],
                BottomLeft_15: bracket[31],
                TopRight_1: bracket[32],
                TopRight_16: bracket[33],
                TopRight_8: bracket[34],
                TopRight_9: bracket[35],
                TopRight_5: bracket[36],
                TopRight_12: bracket[37],
                TopRight_4: bracket[38],
                TopRight_13: bracket[39],
                TopRight_6: bracket[40],
                TopRight_11: bracket[41],
                TopRight_3: bracket[42],
                TopRight_14: bracket[43],
                TopRight_7: bracket[44],
                TopRight_10: bracket[45],
                TopRight_2: bracket[46],
                TopRight_15: bracket[47],
                BottomRight_1: bracket[48],
                BottomRight_16: bracket[49],
                BottomRight_8: bracket[50],
                BottomRight_9: bracket[51],
                BottomRight_5: bracket[52],
                BottomRight_12: bracket[53],
                BottomRight_4: bracket[54],
                BottomRight_13: bracket[55],
                BottomRight_6: bracket[56],
                BottomRight_11: bracket[57],
                BottomRight_3: bracket[58],
                BottomRight_14: bracket[59],
                BottomRight_7: bracket[60],
                BottomRight_10: bracket[61],
                BottomRight_2: bracket[62],
                BottomRight_15: bracket[63],
            },
            orgChannelCode: orgChannelCode,
            customerChannelKey: number
        };
        options['body'] = JSON.stringify(body);
        console.log("Attempting to send Instant App");
        fetch(sendMessageURL, options)
            .then(function (response) {
                response.json().then(function (json) {
                    if (response.status == 200) {
                        console.log("Successfully sent Instant App " + body.instantAppSchemaCode + "!");
                    } else {
                        console.log(json);
                    }
                })
                    .catch(error => {
                        console.log("Unknown Error in /sendInstantApp");
                        console.log(error.stack);
                    })
            })
            .catch(function (error) {
                console.log("Error sending Instant App");
                console.log(error.stack);
            })
    };

    self.updatePicks = function (req, res, number, gameId, selection) {
        // Get a database reference to our blog
        const db = admin.database();
        // creating a starting path in our database
        const ref = db.ref('users');

        ref.once('value', function (snapshot) {

            console.log("checking for user");
            // if user is in firebase, update pick
            if (snapshot.val()[number]) {
                var picks = snapshot.val()[number];
                picks[gameId]=selection;
                const newRef = db.ref('users/'+number);
                newRef.set(picks);
            }
        });
        console.log("Success?");
    };

    self.saveName = function(req, res, number, name) {
        // Get a database reference to our blog
        const db = admin.database();
        // creating a starting path in our database
        const ref = db.ref('names');

        console.log("Adding Name to Firebase");
        let update = {};
        update[number] = name;
        ref.update(update, function (error) {
            if (error) {
                console.log(error);
            } else {
                console.log("Successfully updated Firebase");
            }
        });
    };

    // set up the endpoints and server
    createEndpoints(self);
    server = app.listen(self.port, function () {
        console.log('Example app listening on port %s', server.address().port);
    });
};

let bot = new MarchMadnessBot();

const bracket = [
    "1 Virginia",
    "16 UMBC",
    "8 Creighton",
    "9 Kansas St",
    "5 Kentucky",
    "12 Davidson",
    "4 Arizona",
    "13 Buffalo",
    "6 Miami (FL)",
    "11 Loyola-Chicago",
    "3 Tennessee",
    "14 Wright St",
    "7 Nevada",
    "10 Texas",
    "2 Cincinnati",
    "15 Georgia St",
    "1 Xavier",
    "16 NCCU/Texas Southern",
    "8 Missouri",
    "9 Florida St",
    "5 Ohio St",
    "12 South Dakota St",
    "4 Gonzaga",
    "13 UNC-Greensboro",
    "6 Houston",
    "11 San Diego St",
    "3 Michigan",
    "14 Montana",
    "7 Texas A&M",
    "10 Providence",
    "2 N Carolina",
    "15 Lipscomb",
    "1 Villanova",
    "16 LIU/Radford",
    "8 Va. Tech",
    "9 Alabama",
    "5 West Virginia",
    "12 Murray St",
    "4 Wichita St",
    "13 Marshall",
    "6 Florida",
    "11 St. Bon/UCLA",
    "3 Texas Tech",
    "14 SF Austin",
    "7 Arkansas",
    "10 Butler",
    "2 Purdue",
    "15 Cal St Fullerton",
    "1 Kansas",
    "16 Penn",
    "8 Seton Hall",
    "9 NC State",
    "5 Clemson",
    "12 New Mexico St",
    "4 Auburn",
    "13 Charleston",
    "6 TCU",
    "11 ASU/Syracuse",
    "3 Michigan St",
    "14 Bucknell",
    "7 Rhode Island",
    "10 Oklahoma",
    "2 Duke",
    "15 Iona"
];