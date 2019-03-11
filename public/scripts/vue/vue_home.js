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
		});
	}
});
