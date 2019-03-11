var socket = null;

var vue_board_app = new Vue({
	el: '#board',
	data: {
		title: "Board",
		items: [],
		//newest: null,
		latest: null,
		logs: [],
		board: {},
		editedItem: {},
		editedTime: {
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0,
		}
	},
	computed: {
		OrderedItems: function() {
			var scoreSort = "desc";
			
			if (this.board.type == "time") {
				scoreSort = "asc";
			}

			return _.orderBy(this.items, "score", scoreSort);
		},
	},
	methods: {
		// AddLots: function() {
		// 	for (var i = 0; i < 1000; i++) {
		// 		this.AddItem("Name " + i, Math.floor(Math.random() * 100));
		// 	}
		// },
		AddItem: function(name, score) {
			
			if (name == null || name == "" || score == null) {
				console.log("Name: " + name + ". Score: " + score);
				return;
			}
			
			var d = new Date();
			var index = this.GetItem(name);
			
			if (index != -1) {

				//if (this.board.type == "score" && score > this.items[index].score || this.board.type == "time" && score < this.items[index].score) { 
					this.logs.push({info: "Updated " + name + ": Old score: " + this.GetTimeString(this.TimeFromScore(this.items[index].score)) + " New score: " + this.GetTimeString(this.TimeFromScore(score)), datetimestamp: d.toUTCString()} );
				
					this.items[index].score = score;
					this.items[index].updated = d.toUTCString();
	
					this.latest = this.items[index];
	
					socket.emit("updateScore", {item: this.items[index], leaderboardID: this.board.identifier});
				// }
				// else {
				// 	this.logs.push({info: "Score not updated " + name + ": Current score: " + this.items[index].score + " New score: " + score, datetimestamp: d.toUTCString()} );
				// }
			}
			else {
				var item = {board_id: this.board.identifier, name: name, score: score, created: d.toUTCString(), updated: d.toUTCString()};
				this.latest = this.newest;
				this.logs.push({info: "Inserted " + name + " Score: " + this.GetTimeString(this.TimeFromScore(score)), datetimestamp: d.toUTCString()});

				socket.emit("addScoreToLeaderboard", {item: item, leaderboardID: this.board.identifier});
			}
		   
			this.logs = this.logs.keySort({timestamp: "desc"});

			this.editedItem = {};
		},
		EditItem: function(item) {
			this.editedItem = JSON.parse(JSON.stringify(item));
			if (this.board.type == "time") {
				this.editedTime = this.TimeFromScore(this.editedItem.score);
			}
		},
		GetItem: function(name) {
			for (var i = 0; i < this.items.length; i++) {
				if (this.items[i].name == name) {
					return i;
				}
			}
		   
			return -1;
		},
		EditedItemComputedScore: function() {
			if (this.board.type == 'score') {
				return this.editedItem.score;
			}
			else if (this.board.type == 'time') {
				var milliHours = 0;
				var milliMinutes = 0;
				var milliSeconds = 0;
				var milliMilliseconds = 0;

				//  TODO: get value as number
				if (this.editedTime.hours != null && this.editedTime.hours != "") {
					milliHours = this.editedTime.hours * 60 * 60 * 1000;
				}

				if (this.editedTime.minutes != null && this.editedTime.minutes != "") {
					milliMinutes = this.editedTime.minutes * 60 * 1000;
				}

				if (this.editedTime.seconds != null && this.editedTime.seconds != "") {
					milliSeconds = this.editedTime.seconds * 1000;
				}

				if (this.editedTime.milliseconds != null && this.editedTime.milliseconds != "") {
					milliMilliseconds = this.editedTime.milliseconds * 1; // Already in milliseconds. *1 converts to a number
				}

				console.log("Hours: " + milliHours + " Mins: " + milliMinutes + " Secs: " + milliSeconds + " Milli: " + milliMilliseconds);
				console.log((milliHours + milliMinutes + milliSeconds + milliMilliseconds));
				return (milliHours + milliMinutes + milliSeconds + milliMilliseconds);
			}
		},
		TimeFromScore: function(score) {
			//0:00:00.000
			var time = {};
			var timeRemaining = score;
  
			if (Math.floor(timeRemaining / 60 / 60 / 1000) > 0) {
				time.hours = Math.floor(timeRemaining / 60 / 60 / 1000);
				timeRemaining = timeRemaining - (time.hours * 60 * 60 * 1000);
			}
			else {
				time.hours = 0;
			}

			if (Math.floor(timeRemaining / 60 /  1000) > 0) {
				time.minutes = Math.floor(timeRemaining / 60 / 1000);
				timeRemaining = timeRemaining - (time.minutes * 60 * 1000);
			}
			else {
				time.minutes = 0;
			}

			if (Math.floor(timeRemaining / 1000) > 0) {
				time.seconds = Math.floor(timeRemaining / 1000);
				timeRemaining = timeRemaining - (time.seconds * 1000);
			}
			else {
				time.seconds = 0;
			}

			if (timeRemaining > 0 && timeRemaining < 1000) {
				time.milliseconds = timeRemaining;
			}
			else {
				time.milliseconds = 0;
			}

			return time;
		},
		GetTimeString: function(time) {
			var timeString = "";
			if (time.hours > 0) {
				if (time.hours < 10) {
					timeString += "0";
				}
				timeString += time.hours + ":" + (time.minutes < 10 ? "0" + time.minutes : time.minutes) + ":" + (time.seconds < 10 ? "0" + time.seconds : time.seconds);
			}
			else {
				timeString += (time.minutes < 10 ? "0" + time.minutes : time.minutes) + ":" + (time.seconds < 10 ? "0" + time.seconds : time.seconds);
			}

			if (time.milliseconds > 0) {
				timeString += "." + (time.milliseconds < 100 ? (time.milliseconds < 10 ? "00" + time.milliseconds : "0" + time.milliseconds) : time.milliseconds);
			}

			return timeString;
		},
		GetComputedScore: function(score) {
			if (this.board.type == "score") {
				return score;
			}
			else if (this.board.type == "time") {
				return this.GetTimeString(this.TimeFromScore(score));
			}
		}
	},
	created: function() {
		//socket = io.connect('http://localhost:3000');
		socket = io();
	},
	mounted: function() {
		var id = window.location.href.substr(window.location.href.lastIndexOf('/') + 1); // "board1";
		socket.emit("requestLeaderboard", id);
		
		// Use Vue object name to assign variables

		// Socket responses from server
		socket.on('requestLeaderboard', function(data){
			vue_board_app.board = data.board;
		});

		socket.on('leaderboardItems', function(data){
			vue_board_app.items = data.items;
			//vue_board_app.OrderItems();
		});

		socket.on('leaderboardUpdated', function(data){
			vue_board_app.items.push(data);
			//vue_board_app.OrderItems();
		});
	}
});
