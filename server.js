var restify = require('restify');
var builder = require('botbuilder');
var storage = require('azure-storage');

var blobSvc = storage.createBlobService("storagefordemodfsrram", "RUTukQbuykqb1LS1+3Az4rubAbuS/gY1N8b3nNvKg+HPdSW0TZtbk6PvCOyvQqNj8SOJvAYv7f/T+5icX+5/nQ==");

/*blobSvc.createAppendBlobFromLocalFile('chatbot', 'userresponses.txt', 'appendblob.txt', function(error, result, response){
  if(!error){
    console.log("file uploaded");
  }
});
*/

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
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
var intents = new builder.IntentDialog({ recognizers: [recognizer] });

//var intents = new builder.IntentDialog();
bot.dialog('/', intents);

intents.matches('chooseactivity', [
function (session,results) {

             session.send("I see you are looking for some tips");
             if (!results.entities[0] | !results) {

                    var pic1 = new builder.Message(session).attachments([{
                             contentType: "image/jpeg",
                             contentUrl: "http://storagefordemodfsrram.blob.core.windows.net/content/img1.jpg"
                     }]);
                    session.send("Here is a tip dear !!! Take a Massage");
                    session.endConversation(pic1);

             } else {
                 
                session.endConversation("Here is a tip dear !!! do some :: %s", results.entities[0].type);
             }
            // session.endConversation("Here are sometips :: %s", JSON.stringify(results));
             
}

]);

intents.matches(/^(hi|hello|howdy|how|who|hey)/i, [
    function (session) {
        session.beginDialog('/myservice',session.userData.profile);
    },
    function (session, results) {
        session.userData.profile = results.response;
        
        session.userData.profile.loggedttm = getDateTime();
        var myjson = JSON.stringify(session.userData.profile);

        session.send('Thank you logged your input %s !!!',myjson);
        
        blobSvc.appendFromText('chatbot', 'userresponses.txt', myjson.concat("\n"), function(error, result, response){
            if(!error){
                        console.log("Text is appended");
                }
        });

        session.endConversation("Ok… Goodbye.");
    }
]);

intents.matches(/^.*(help).*$/i, [
    function (session) {

         builder.Prompts.choice(session, "Hi I am Scarlet !!! I can help you with the following?","service|billing");

    },
    function (session,results) {

        if(results.response.entity === 'service') {
             session.beginDialog('/myservice',session.userData.profile);

         } else {

             session.send("Please contact billing department @1-800-myhouse");
             session.endConversation("Ok… Goodbye.");
         }
    },
    function (session, results) {

        session.userData.profile = results.response;
        
        session.userData.profile.loggedttm = getDateTime();
        var myjson = JSON.stringify(session.userData.profile);

        session.send('Thank you logged your input %s !!!',myjson);
        
        blobSvc.appendFromText('chatbot', 'userresponses.txt', myjson.concat("\n"), function(error, result, response){
            if(!error){
                        console.log("Text is appended");
                }
        });

        session.endConversation("Ok… Goodbye.");
    }

]);


/*
bot.dialog('/', [
    function (session) {
        session.beginDialog('/myservice',session.userData.profile);
    },
    function (session, results) {
        session.userData.profile = results.response;
        
        session.userData.profile.loggedttm = getDateTime();
        var myjson = JSON.stringify(session.userData.profile);

        session.send('Thank you logged your input %s !!!',myjson);
        
        blobSvc.appendFromText('chatbot', 'userresponses.txt', myjson.concat("\n"), function(error, result, response){
            if(!error){
                        console.log("Text is appended");
                }
        });

        session.endConversation("Ok… Goodbye.");
    }
]);
*/

bot.dialog('/myservice', [
    function (session,args,next) {
    session.dialogData.profile = args || {};
            if (!session.dialogData.profile.greeting) {
                    builder.Prompts.text(session, 'From Scarlet with Love : How is your day so far?');
                    
                    
            } else {
                    next();
            }

    },
    function (session,results,next) {

            if (results.response) {
                if(results.response.indexOf ('bad') > -1 | results.response.indexOf ('tir') > -1 | results.response.indexOf ('stress') > -1 ) {
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
    function(session,results,next) {

            if (results.response) {
                session.dialogData.profile.service = results.response;
            }

            if (!session.dialogData.profile.trainer) {
            builder.Prompts.text(session, 'who is your favorite trainer?');
            } else {
            next();
            }
    },
    function(session,results) {
            if (results.response) {
            session.dialogData.profile.trainer = results.response;
            }
            session.endDialogWithResult({ response: session.dialogData.profile });
    }
]);

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}

