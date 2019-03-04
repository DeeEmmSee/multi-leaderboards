var socket = null;

var vue_board_app = new Vue({
	el: '#board',
	data: {
		title: "Board",
		items: [],
		//newest: null,
		latest: null,
		logs: [],
		board: {}
	},
	computed: {
		OrderedItems: function() {
			var scoreSort = "desc";
			
			if (this.board.type == "time") {
				scoreSort = "asc";
			}

			// this.items = this.items.keySort({score: scoreSort, date: "asc"});

			return _.orderBy(this.items, "score", scoreSort);
		}
	},
	methods: {
		// AddLots: function() {
		// 	for (var i = 0; i < 1000; i++) {
		// 		this.AddItem("Name " + i, Math.floor(Math.random() * 100));
		// 	}
		// },
		AddItem: function(name, score) {
			if (name == null || name == "" || score == null) {
				return;
			}
			
			var d = new Date();
			
			//var name = 'Test ' + Math.floor(Math.random() * 5);
			//var score = Math.floor(Math.random() * 100);
			var index = this.GetItem(name);
						
			if (index != -1) {

				if (this.board.type == "score" && score > this.items[index].score ||
					this.board.type == "time" && score < this.items[index].score) { 
					this.logs.push({info: "Updated " + name + ": Old score: " + this.items[index].score + " New score: " + score, datetimestamp: d.toUTCString()} );
				
					this.items[index].score = score;
					this.items[index].updated = d.toUTCString();
	
					this.latest = this.items[index];
	
					socket.emit("updateScore", {item: this.items[index], leaderboardID: this.board.identifier});
				}
				else {
					this.logs.push({info: "Score not updated " + name + ": Current score: " + this.items[index].score + " New score: " + score, datetimestamp: d.toUTCString()} );
				}
			}
			else {
				var item = {board_id: this.board.identifier, name: name, score: score, created: d.toUTCString(), updated: d.toUTCString()};
				this.latest = this.newest;
				this.logs.push({info: "Inserted " + name + " Score: " + score, datetimestamp: d.toUTCString()});

				socket.emit("addScoreToLeaderboard", {item: item, leaderboardID: this.board.identifier});
			}
		   
			this.logs = this.logs.keySort({timestamp: "desc"});
		},
		GetItem: function(name) {
			for (var i = 0; i < this.items.length; i++) {
				if (this.items[i].name == name) {
					return i;
				}
			}
		   
			return -1;
		},
		GetTimeFromScore: function(score) {

			return score;
		}
		// OrderItems: function() {
		// 	this.items = _.orderBy(this.items, "score", "desc");			
		// }
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
