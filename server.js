var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

var appreciations = {}; // object of names: set of senders 

// app.get('/getappreciations', (req, res) => {
//     var user = req.query.user;
//     if(user in appreciations) {
//         res.send(Array.from(appreciations[user]));
//     }else {
//         res.send([]);
//     }
// })
function createViewableAppreciations() {
    var returnobj = {};
    for (var k in appreciations) {
        returnobj[k] = Array.from(appreciations[k])
    }
    return returnobj;
}
app.get('/getusers', (req, res) => {
    console.log(appreciations);
    
    res.send((createViewableAppreciations()));
})

function addReceiverToAppreciations(sender, receiver) {
    var receivers = receiver.split(",");
    for(var i = 0; i < receivers.length; i++) {
        if(receivers[i] in appreciations) {
            appreciations[receivers[i]].add(sender);
        }else {
            appreciations[receivers[i]] = new Set([sender]);
        }
    }
    
}

app.get('/sendappreciation', (req, res) => {
    var sender = req.query.sender;
    var receiver = req.query.receiver;
    console.log(req.query);
    addReceiverToAppreciations(sender, receiver);
    console.log(appreciations)
    io.emit('message', (createViewableAppreciations()));
    res.sendStatus(200);
})

io.on('connection', () =>{
    console.log('a user is connected')
})

var server = http.listen(3001, () => {
    console.log('server is running on port', server.address().port);
});