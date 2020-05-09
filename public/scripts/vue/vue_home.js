var socket = null;

var vue_home_app = new Vue({
	el: '#home',
	data: {
		title: 'Leaderboards Admin Page',
		leaderboards: [],
		newBoardName: "",
		newBoardID: "",
		newBoardType: "",
		newBoardExpiryDate: "",
		newBoardExpiryTimeHours: "",
		newBoardExpiryTimeMinutes: "",
		newBoardHasExpiry: false,
		idError: false,
		expiryError: false,
		submitSuccess: false,
		isAdmin: false,
		txtAdminPassword: ''
	},
	methods: {
		AdminCheck: function() {
			this.isAdmin = this.txtAdminPassword == "Password123";
			this.txtAdminPassword = "";
		},
		getLeaderboards: function() {
			socket.emit("requestLeaderboards");
		},
		createNewLeaderboard: function(boardName, boardID, boardType, boardExpiryDate, boardExpiryHours, boardExpiryMinutes) {
			let tmpDate = new Date(boardExpiryDate);
			let expiryDate = null;
			let hasError = false;
			this.idError = false;
			this.expiryError = false;
			this.submitSuccess = false;

			// Check identifier doesn't already exist
			for (let i = 0; i < this.leaderboards.length; i++) {
				if (this.leaderboards[i].identifier == boardID) {
					hasError = true;
					this.idError = true;
				}
			}
			
			// Check date is not in past
			if (this.newBoardHasExpiry && boardExpiryDate != "" && boardExpiryDate != null) {
				if (boardExpiryHours == "") {
					boardExpiryHours = 0;
				}
				if (boardExpiryMinutes == "") {
					boardExpiryMinutes = 0;
				}

				expiryDate = new Date(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate(), boardExpiryHours, boardExpiryMinutes, 0, 0);

				if (expiryDate <= new Date()) {
					hasError = true;
					this.expiryError = true;
				}
			}

			if (!hasError) {
				socket.emit("createNewLeaderboard", {name: boardName, id: boardID, type: boardType, expiry: expiryDate});

				this.submitSuccess = true;
				
				this.newBoardName = "";
				this.newBoardID = "";
				this.newBoardType = "";
				this.newBoardExpiryDate = "";
				this.newBoardExpiryTimeHours = "";
				this.newBoardExpiryTimeMinutes = "";
				this.newBoardHasExpiry = false;
			}
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
