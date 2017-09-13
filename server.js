var restify = require('restify');
var builder = require('botbuilder');
var storage = require('azure-storage');
var request = require('request');
var uuid = require('node-uuid');
var documentClient = require("documentdb").DocumentClient;
var Connection = require('tedious').Connection;
var config = {
    userName: 'srramadmin',
    password: 'Lz8oq1dn',
    server: 'srramsql.database.windows.net',
    options: {
        encrypt: true,
        database: 'DWR',
        rowCollectionOnDone: true,
        rowCollectionOnRequestCompletion: true
    }
};
// Setup Restify Server
var server = restify.createServer();
var connection = new Connection(config);
module.exports.ex = function () {
    connection.on('connect', function (err) {
    console.log("Connected");

    var blobSvc = storage.createBlobService("storagefordemodfsrram", "RUTukQbuykqb1LS1+3Az4rubAbuS/gY1N8b3nNvKg+HPdSW0TZtbk6PvCOyvQqNj8SOJvAYv7f/T+5icX+5/nQ==");

    /*blobSvc.createAppendBlobFromLocalFile('chatbot', 'userresponses.txt', 'appendblob.txt', function(error, result, response){
      if(!error){
        console.log("file uploaded");
      }
    });
    */
    // Create chat bot
    var connector = new builder.ChatConnector({
        appId: process.env.MICROSOFT_APP_ID,
        appPassword: process.env.MICROSOFT_APP_PASSWORD
    });

    //create bot
    var bot = new builder.UniversalBot(connector);
    server.post('/api/messages', connector.listen());

    //Serve a static web page
    server.get(/.*/, restify.serveStatic({
        'directory': '.',
        'default': 'index.html'
    }));

    var recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v1/application?id=5049bb53-d42e-4d49-b9d4-63753741d13f&subscription-key=ce6ada59f1ac45a7bcc52ce955fe2db2');
    var intents = new builder.IntentDialog({
        recognizers: [recognizer]
    });

    //var intents = new builder.IntentDialog();
    bot.dialog('/', intents);
    //bot.dialog('/chataboutanactivity',intents);
    /*bot.dialog('/', new builder.IntentDialog()
        .matches(/^add/i, '/addTask')
        .matches(/^change/i, '/changeTask')
        .matches(/^delete/i, '/deleteTask')
        .onDefault(builder.DialogAction.send("I'm sorry. I didn't understand."))
    );*/
    intents.matches('chooseactivity', [
        function (session, results) {

            //            session.send("Here are sometips :: %s", JSON.stringify(results));
            if (!results.entities[0] | !results) {

                var pic1 = new builder.Message(session).attachments([{
                    contentType: "image/jpeg",
                    contentUrl: "http://storagefordemodfsrram.blob.core.windows.net/content/img1.jpg"
                }]);
                session.send("Here is a tip dear !!! Take a Massage");
                session.endConversation(pic1);

            } else {

                var k = results.entities[0].type;

                if (k.indexOf("builtin") === 0) {

                    session.endConversation("You silly I am a fitness bot you are asking for ::: %s", k.substring(k.lastIndexOf(".") + 1, k.length));


                } else {

                    if (k === "yoga") {

                        session.send("Here is a tip dear !!! do some :: %s", results.entities[0].type);
                        var pic2 = new builder.Message(session).attachments([{
                            contentType: "image/jpeg",
                            contentUrl: "https://storagefordemodfsrram.blob.core.windows.net/content/balancingstick.jpg"
                        }]);
                        session.send("Try this pose in the class");
                        session.send(pic2);
                        executequery(connection, k, function (error, results) {
                            console.log('Printing Results from Outside Successfully ######' + JSON.stringify(results));
                            session.send("Next Class is " + results.data[0].teacher + " @ " + results.data[0].timeoday + ' for a duration of ' + results.data[0].duration + ' minutes');
                            session.send("Some other classes later in the day");
                            for (i = 1; i < results.data.length; i++) {
                                session.send(results.data[i].teacher + " @ %s", results.data[i].timeoday + ' with duration of ' + results.data[i].duration + ' minutes');
                            }
                            connection.close();

                        });
                        session.endConversation("See you in the class");

                    } else {
                        if (k === "weightlifting") {
                            session.send("Here is a tip dear !!! do some :: %s", results.entities[0].type);
                            var pic3 = new builder.Message(session).attachments([{
                                contentType: "image/jpeg",
                                contentUrl: "https://storagefordemodfsrram.blob.core.windows.net/content/biceps.jpg"
                            }]);
                            session.send("Today Joe is available to help and i can place a call");
                            session.send("I promise you look like this");
                            session.endConversation(pic3);

                        } else {
                            session.endConversation("Here is a tip dear !!! do some :: %s", results.entities[0].type);
                        }
                    }
                }


            }
        }
    ]);

    intents.matches(/^(hi|hello|howdy|how|who|hey|whats|help|what else).*$/i, [
        function (session) {

            session.send("Hello Dear !!! I am Scarlet your fitness friend");
            var dt = new Date();
            var gtngtm = dt.getHours().toString() + dt.getMinutes().toString();
            //console.log(parseInt(gtngtm));
            switch (true) {
                case (parseInt(gtngtm) > 0 && parseInt(gtngtm) <= 1159):
                    session.send("Good Morning !");
                    break;
                case (parseInt(gtngtm) > 1159 && parseInt(gtngtm) <= 1700):
                    session.send("Good Afternoon !");
                    break;
                case (parseInt(gtngtm) > 1700 && parseInt(gtngtm) <= 1900):
                    session.send("Good Evening !");
                    break;
                case (parseInt(gtngtm) > 1900 && parseInt(gtngtm) <= 2359):
                    session.send("Good Night !");
                    break;
                default:
                    session.send("Good Mars Day !");
                    break;
            }
            builder.Prompts.choice(session, "I can help you with the following?", "Ask me Fitnesstip|Feedback|billing");

        },
        function (session, results, next) {

            switch (results.response.entity) {
                case "Feedback":
                    session.beginDialog('/feedback', session.userData.profile);
                    break;
                case "billing":
                    session.send("Please contact billing department @1-800-myhouse");
                    session.endConversation("Ok… Goodbye.");
                    break;
                case "Ask me Fitnesstip":
                    session.replaceDialog("/");
                    break;
                default:
                    session.endConversation(" Bye Sweet heart");
                    //session.beginDialog('/feedback',session.userData.profile);
                    break;
            }
            //  next();
        },
        function (session, results) {

            session.userData.profile = results.response;

            session.userData.profile.loggedttm = getDateTime();
            var myjson = JSON.stringify(session.userData.profile);
            var uuid1 = uuid.v1();
            var parsedjson = JSON.parse(myjson);
            var str = '{ "documents": [ {"language": "en", "id": "' + uuid1 + '"' + ',"text": ' + '"' + parsedjson.service.entity + " " + parsedjson.tfeedback + '"' + '}]}';
            var postData = JSON.parse(str);

            var options = {
                method: 'post',
                body: postData,
                json: true,
                url: "https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Ocp-Apim-Subscription-Key": "be6afe2e9d6d4a18acd975e7b55b1d17"
                }
            };


            request(options, function (err, res, body) {
                if (err) {
                    console.log('Error :', err);

                }
                var sumscore = 0;
                for (i = 0; i < res.body.documents.length; i++) {
                    console.log(' Response ::::::', JSON.stringify(res.body.documents[i].score));
                    sumscore += res.body.documents[i].score;
                }
                finalscore = sumscore / res.body.documents.length;
                console.log('Printing final score from batch  :::::: ', finalscore);
                parsedjson.sentiment = finalscore;
                myjson1 = JSON.stringify(parsedjson);
                // session.send('Thank you Very much !!! Logged your Input');
                session.send('Thank you logged your input %s !!!', myjson1);

                blobSvc.appendFromText('chatbot', 'userresponses1.txt', myjson1.concat("\n"), function (error, result, response) {
                    if (!error) {
                        console.log("Text is appended");
                    }
                });

                var documentDefinition = '{ "id": "' + uuid1 + '","content": ' + JSON.stringify(parsedjson) + ' }';
                console.log("printing document definition :::", documentDefinition);
                var host = "https://srram.documents.azure.com:443/";
                var masterKey = "QzVNdYOMWHAbMSXO62tB2lEifiuNnonSNTGX93sSU1RhEqJaRYPwsPcllpBEIPdn4tFIL1O2QL9wRYrI5jppVQ==";
                var client = new documentClient(host, { masterKey: masterKey });
                var collectionUrl = "dbs/srrampoc/colls/scarletdata";
                client.createDocument(collectionUrl, JSON.parse(documentDefinition), function (err) {
                    if (err) { console.log("In error :::: ", JSON.stringify(err) + JSON.stringify(parsedjson)); }
                    console.log("Doc is created !!!! in document db");
                });

            });

            session.userData = {};
            //session.reset();
            session.endConversation("Goodbye.");




        }

    ]);


    bot.dialog('/feedback', [
        function (session, args, next) {

            session.dialogData.profile = args || {};
            if (!session.dialogData.profile.greeting) {

                //session.send("You look amazing today !!! I can see the fitness results already");
                builder.Prompts.text(session, 'You look amazing today !!! How is your day so far?');


            } else {
                next();
            }

        },
        function (session, results, next) {

            if (results.response) {
                if (results.response.indexOf('bad') > -1 | results.response.indexOf('tir') > -1 | results.response.indexOf('stress') > -1 | results.response.indexOf('wors') > -1) {
                    session.send("sorry to hear!!!");
                } else {
                    session.send("My day cannot be better than yours dear!!!");
                }
                session.dialogData.profile.greeting = results.response;
            }

            if (!session.dialogData.profile.service) {
                builder.Prompts.choice(session, "How did we treat you at facility today ?", "Worse|Bad|Good|Excellent");
            } else {
                next();
            }

        },
        function (session, results, next) {

            if (results.response) {
                session.dialogData.profile.service = results.response;
            }

            if (!session.dialogData.profile.trainer) {
                builder.Prompts.text(session, 'who is your favorite trainer?');
            } else {
                next();
            }
        },
        function (session, results, next) {

            if (results.response) {
                session.dialogData.profile.trainer = results.response;
            }

            if (!session.dialogData.profile.tfeedback) {
                builder.Prompts.text(session, 'I love to hear of what we could do better!!! Please share your feedback');
            } else {
                next();
            }
        },
        function (session, results) {
            if (results.response) {
                session.dialogData.profile.tfeedback = results.response;
            }
            session.endDialogWithResult({
                response: session.dialogData.profile
            });

        }
    ]);

    //intents.onDefault(builder.DialogAction.send("I'm sorry. I didn't understand."));

    function getDateTime() {

        var date = new Date();

        var hour = date.getHours();
        hour = (hour < 10 ? "0" : "") + hour;

        var min = date.getMinutes();
        min = (min < 10 ? "0" : "") + min;

        var sec = date.getSeconds();
        sec = (sec < 10 ? "0" : "") + sec;

        var year = date.getFullYear();

        var month = date.getMonth() + 1;
        month = (month < 10 ? "0" : "") + month;

        var day = date.getDate();
        day = (day < 10 ? "0" : "") + day;

        return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

    }

    function executequery(connection, acttyp, callback) {

        var Request = require('tedious').Request,
            TYPES = require('tedious').TYPES;
        request = new Request("SELECT [type],[timeoday],[duration],[teacher] FROM [dbo].[fitnessclass] where [type] = @typ ;", function (err, rowcount, rows) {
            if (err) {
                console.log(err);
                callback(err);
            } else {
                // console.log('printing rowslength' + rows.length);
                //  console.log('printing rowcount' + rowcount);

                var fr = "";
                var result = "";
                for (i = 0; i < rows.length; i++) {

                    fr = rows[i];
                    // console.log("printing rows !!!!! ::: " + i + ":::" + JSON.stringify(fr)); 

                    if (i === 0) {
                        result += "{\"data\" : [{";
                    } else {
                        result += "{ ";
                    }

                    for (j = 0; j < fr.length; j++) {

                        //  console.log("printing Columns !!!!! ::: " + j + ":::" + JSON.stringify(fr[j])); 

                        if (j === fr.length - 1) {

                            result += "\"" + fr[j].metadata.colName + "\"" + ":" + "\"" + fr[j].value + "\"";

                        } else {

                            result += "\"" + fr[j].metadata.colName + "\"" + ":" + "\"" + fr[j].value + "\"" + ",";
                        }



                    }

                    if (i === rows.length - 1) {

                        result += " }]}";

                    } else {
                        result += " },";
                    }

                }
                var obj = JSON.parse(result);
                console.log("printing result ::: " + JSON.stringify(obj));
                callback(null, obj);
            }
        });
        request.addParameter('typ', TYPES.VarChar, acttyp);
        connection.execSql(request);
    }

    server.listen(process.env.port || process.env.PORT || 3978, function () {
        console.log('%s listening to %s', server.name, server.url);
    });
});
}



