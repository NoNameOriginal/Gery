
var builder = require("botbuilder");

var connector = new builder.ConsoleConnector().listen();

var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = '4d179d44-b896-44df-ae30-28985e77b3fa';
var luisAPIKey = 'fe91c416fcd240438baeacb6612a0e33'
var luisAPIHostName = 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/


var uno = 1;
var hora = 0;
var marca = new Date();
bot.dialog('/', intents);
intents.matches('Saludos', [

    function (session){
        hora = marca.getHours();
        if(hora<12){
            session.send('Buenos dias');  
            session.send('¿En que puedo ayudarle?');
        }else if(hora>=12 && hora<18){
            session.send('Buenas tardes'); 
            session.send('¿En que puedo ayudarle?');
        }else if(hora>=18 && hora<24){
            session.send('Buenas noches'); 
            session.send('¿En que puedo ayudarle?');
        }
    }
]); 
intents.matches('precios', [
    function (session, args, next){
    //Llamamos las entidades que nos entrega luis
    var curso = builder.EntityRecognizer.findEntity(args.entities, 'tipoCursos');
    var nivel = builder.EntityRecognizer.findEntity(args.entities, 'builtin.number');
    //Se guardan asi, para evitar el caso en el que no esten
    var pregunta = session.dialogData.duda = {
          curso: curso ? curso.entity : null,
          nivel: nivel ? nivel.entity : null  
        };
    //En caso de no estar el nombre del curso se pide
    if(!pregunta.curso){
        builder.Prompts.text(session, 'Por favor especifique cual curso(Ingles, Español, Frances...)');
    }else{
    //Pasa a la siguiente funcion
        next();
    }
//Funcion encargada de verificar que este el nivel  
},function(session, results, next){
        //Creamos la sesion de dialogo con el micro metodo pregunta
        var pregunta = session.dialogData.duda;
        //Si el usuario responidio igualamos el nombre del curso a su respuesta
        if (results.response) {
            pregunta.curso = results.response;
        }
        //Si tiene el curso pero no el nivel lo pedimos
        if(pregunta.curso && !pregunta.nivel){
             builder.Prompts.number(session, 'Por favor especifique cual nivel del curso');
        }else{
            //Si esta pos pasamos a la otra funcion
            next();
        }
//Funcion de respuesta
},function (session, results) {
    //Guardamos el nivel del curso si se hizo la respuesta
    var pregunta = session.dialogData.duda;
        if (results.response) {
            pregunta.nivel = results.response;
        }
        //Respondemos y ya esta
        if(pregunta.curso && pregunta.nivel){
            session.send('Pos ya esta no mariquee mas, no hay no busque que no hay %s %o',pregunta.curso, pregunta.nivel)
        }
}
]);
intents.matches('matriculas', builder.DialogAction.send('Las matriculas son: '.concat(uno)));
intents.onDefault(builder.DialogAction.send('Hola '.concat(hora)));
//Funcion que maneja entidades


/*if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}*/

