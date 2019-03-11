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
		newBoardExpiryDate: "",
		newBoardExpiryTimeHours: "",
		newBoardExpiryTimeMinutes: ""
	},
	methods: {
		getLeaderboards: function() {
			socket.emit("requestLeaderboards");
		},
		createNewLeaderboard: function(boardName, boardID, boardType, boardExpiryDate, boardExpiryHours, boardExpiryMinutes) {
			let tmpDate = new Date(boardExpiryDate);
			let expiryDate = null;

			if (boardExpiryDate != "" && boardExpiryDate != null) {
				
				expiryDate = new Date(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate(), boardExpiryHours, boardExpiryMinutes, 0, 0);
			}

			socket.emit("createNewLeaderboard", {name: boardName, id: boardID, type: boardType, expiryDate: expiryDate});
		}
	},
	created: function() {
		//socket = io.connect('http://localhost:3000');
		socket = io();
		this.newBoardExpiryDate = moment().format('L');
	},
	mounted: function() {
		socket.emit("requestLeaderboards");
		
		// Socket responses from server
		socket.on('requestLeaderboards', function(data){
			vue_home_app.leaderboards = data.boards;
		});
	}
});
