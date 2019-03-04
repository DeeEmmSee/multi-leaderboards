var socket = null;

var vue_board_admin_app = new Vue({
	el: '#board_admin',
	data: {
		title: 'Admin',
		items: [],
		newest: null,
		logs: [],
		leaderboards: []
	},
	methods: {
		getLeaderboards: function() {
			socket.emit("requestLeaderboard");
		}
	},
	created: function() {
		socket = io.connect('http://localhost:3000');
	},
	mounted: function() {
		socket.emit("requestLeaderboards");
		
		// Socket responses from server
		socket.on('requestLeaderboard', function(data){
			console.log("Get Leaderboard");
			console.log(data);
			vue_home_app.leaderboards = data.boards;
			//vue_home_app.data.leaderboards = data;
		});
	}
});
