const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const PORT = 8081;
const baseUrl = '/leaderboards';

// Schema
const Leaderboard = require('./models/leaderboards');
const Log = require('./models/logs');
const LeaderboardEntrySchema = require('./models/leaderboard_entry_schema');

// Mongoose
const mongoose = require('mongoose');
//mongoose.connect('mongodb+srv://root:yoceda0YVS3mT4De@cluster0-dxypd.mongodb.net/db_leaderboards?retryWrites=true', {useNewUrlParser: true});
mongoose.connect('mongodb+srv://leaderboard_user:ir3nDqp0XwnXEMoK@cluster0-dxypd.mongodb.net/db_leaderboards?retryWrites=true', { useNewUrlParser: true });

mongoose.Promise = global.Promise;

//b04d78d1-b6f3-4326-94d9-7348ccd1d937

const db = mongoose.connection;
db.once('open', function() {
	console.log("Connected to MongoDB.");
	
	// mongoose.connection.db.listCollections().toArray(function(err, collections){
	// 	if (err) {
	// 		console.log(err);
	// 	}
	// 	else {
	// 		leaderboards = collections;
	// 		console.log(leaderboards);
	// 	}
	// });
});

db.on('error', function(err){
	console.log(err);
});

//Site
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(baseUrl + '/scripts', express.static(path.join(__dirname, '../public/scripts')));
app.use(baseUrl + '/css', express.static(path.join(__dirname, '../public/css')));
app.use(baseUrl + '/static', express.static('node_modules'));

var router = express.Router();

router.get('/', (req, res) => {
	res.sendFile('index.html', {root: path.join(__dirname, '../public')});
});

router.get('/leaderboards/:leaderboard', (req, res) => {
	res.sendFile('template.html', {root: path.join(__dirname, '../public')});
});

// API
router.post('/api/:leaderboard', (req, res) => {
	var d = new Date();
	var item = { board_id: req.params.leaderboard, name: req.body.name, score: req.body.score, created: d.toUTCString(), updated: d.toUTCString() };
	console.log(item);

	console.log(req);

	var model = mongoose.model(req.params.leaderboard, LeaderboardEntrySchema);

	model.create(item).then(function(newItem) {
		model.find({"board_id": req.params.leaderboard}, function(err, items) {
			var error = null;

			if (err) {
				error = err;
			}
			else if (items.length == 0) {
				error = "No items found";
			}

			io.emit("leaderboardItems", {items: items});
			
			res.sendStatus(200);
		});
	});

	res.sendStatus(200);
});

app.use(baseUrl, router);

// Sockets
io.on('connection', function (socket) {	
	// Send to ALL connected clients - io.emit('', data);
	
	function GetLeaderboards(sendToAll) {
		// Get list of leaderboards
		Leaderboard.find(function(err, boards) {
			if (sendToAll) {
				io.emit("requestLeaderboards", {boards: boards});
			}
			else {
				socket.emit("requestLeaderboards", {boards: boards});
			}
		});		
	}

	function GetLeaderboard(id){ 
		Leaderboard.find({"identifier": id}, function(err, boards) {
			var error = null;
			var board = null;

			if (err) {
				error = err;
			}
			else if (boards.length == 0) {
				error = "No board found";
			}
			else {
				board = boards[0];
			}

			socket.emit("requestLeaderboard", {board: board, error: error});

			GetLeaderboardItems(id, false);
		});
	}

	function GetLeaderboardItems(leaderboardID, sendToAll) {
		var model = mongoose.model(leaderboardID, LeaderboardEntrySchema);

		model.find({"board_id": leaderboardID}, function(err, items) {
			var error = null;

			if (err) {
				error = err;
			}
			else if (items.length == 0) {
				error = "No items found";
			}

			if (sendToAll) {
				io.emit("leaderboardItems", {items: items});
			}
			else {
				socket.emit("leaderboardItems", {items: items});
			}
		});
	}

	socket.on('requestLeaderboards', function(){
		GetLeaderboards(false);
	});
	
	socket.on('requestLeaderboard', function(leaderboardID){
		GetLeaderboard(leaderboardID);
	});
	
	socket.on('createNewLeaderboard', function(data){
		var success = false;
		var error = "";
		
		// TODO: error handling (duplicate entries)
		
		//data.name
		//data.id
		Leaderboard.create({name: data.name, identifier: data.id, type: data.type, expiry: data.expiry}, function(err, res) {
			success = true;

			if (err) {
				success = false;
				error = err;
				console.log("ERROR: " + err);
			}
			
			// Collection is created when first document is added

			// Send create result
			socket.emit("createNewLeaderboard", {success: success, error: error});
			
			// Refresh list
			GetLeaderboards(true);
		});
		
	});
	
	socket.on('addScoreToLeaderboard', function(data) {
		var model = mongoose.model(data.leaderboardID, LeaderboardEntrySchema);

		model.create(data.item).then(function(newItem) {
			GetLeaderboardItems(data.leaderboardID, true);
		});
	});

	socket.on('updateScore', function(data) {
		var model = mongoose.model(data.leaderboardID, LeaderboardEntrySchema);
		
		model.updateOne({_id: data.item._id}, data.item, {new: true}, function(err, updatedItem){
			if (err) {
				console.log(err);
			}
			else {
				GetLeaderboardItems(data.leaderboardID, true);
			}
		});
	});

	socket.on('disconnected', function(){
		console.log("User disconnected");
	});
});

server.listen(PORT);
