var socket = null;

var vue_home_app = new Vue({
	el: '#home',
	data: {
		title: 'Leaderboards Admin Page',
		items: [],
		newest: null,
		logs: [],
		leaderboards: [],
		newBoardName: "",
		newBoardID: "",
		newBoardType: "",
	},
	methods: {
		// addItem: function(name, score) {
		// 	var d = new Date();
		// 	var name = 'Test ' + Math.floor(Math.random() * 5);
		// 	var score = Math.floor(Math.random() * 100);
		// 	var index = this.getItem(name);
		   
		// 	if (index != -1) {
		// 		this.logs.push({info: "Updated " + name + ": Old score: " + this.items[index].score + " New score: " + score, datetimestamp: d.toUTCString()});
		// 		this.items[index].score = score;
		// 		this.items[index].updatedDate = d.toUTCString();
		// 	}
		// 	else {
		// 		this.newest = {index: this.items.length, name: name, score: score, addedDate: d.toUTCString(), updatedDate: d.toUTCString()};
		// 		this.items.push(this.newest);
			   
		// 		this.logs.push({info: "Inserted " + name + " Score: " + score, datetimestamp: d.toUTCString()});
		// 	}
		   
		// 	this.items = this.items.keySort({score: "desc", date: "asc"});
		// 	this.logs = this.logs.keySort({timestamp: "desc"});
		// },
		// getItem: function(name) {
		// 	for (var i = 0; i < this.items.length; i++) {
		// 		if (this.items[i].name == name) {
		// 			return i;
		// 		}
		// 	}
		   
		// 	return -1;
		// },
		getLeaderboards: function() {
			socket.emit("requestLeaderboards");
		},
		createNewLeaderboard: function(boardName, boardID, boardType) {
			socket.emit("createNewLeaderboard", {name: boardName, id: boardID, type: boardType});
		}
	},
	created: function() {
		//socket = io.connect('http://localhost:3000');
		socket = io();
	},
	mounted: function() {
		socket.emit("requestLeaderboards");
		
		// Socket responses from server
		socket.on('requestLeaderboards', function(data){
			vue_home_app.leaderboards = data.boards;
			//vue_home_app.data.leaderboards = data;
		});
	}
});
