var ATA = {};
ATA.ID = "Mustafa" + Math.random();

ATA.Peer = {
	ID:null,
	__call:null,
	__peer:null,
	__stream1:null,
	__stream2:null,
	__conns:{},
	__rtcconfig:{iceServers:[{"urls":
		navigator.mozGetUserMedia?"stun:stun.services.mozilla.com":
		navigator.webkitGetUserMedia?"stun:stun.l.google.com:19302":"stun:23.21.150.121"},
		{urls:"stun:stun.l.google.com:19302"},
		{urls:"stun:stun1.l.google.com:19302"},
		{urls:"stun:stun2.l.google.com:19302"},
		{urls:"stun:stun3.l.google.com:19302"},
		{urls:"stun:stun4.l.google.com:19302"},
		{urls:"stun:23.21.150.121"},
		{urls:"stun:stun01.sipphone.com"},
		{urls:"stun:stun.ekiga.net"},
		{urls:"stun:stun.fwdnet.net"},
		{urls:"stun:stun.ideasip.com"},
		{urls:"stun:stun.iptel.org"},
		{urls:"stun:stun.rixtelecom.se"},
		{urls:"stun:stun.schlund.de"},
		{urls:"stun:stunserver.org"},
		{urls:"stun:stun.softjoys.com"},
		{urls:"stun:stun.voiparound.com"},
		{urls:"stun:stun.voipbuster.com"},
		{urls:"stun:stun.voipstunt.com"},
		{urls:"stun:stun.voxgratia.org"},
		{urls:"stun:stun.xten.com"}
	]},
	__call_ready:function(func) {
		this.__call.on("stream",func);
	},
	__conn_ready:function(conn) {
		var id = conn.peer;
		this.__conns[id] = conn;
		this.__conns[id].on("open",function() {
			ATA.Peer.__conns[this.peer].on("data",function(data) {
				ATA.Peer.Receive(this.peer,JSON.parse(data));
			});
			ATA.Peer.Send(this.peer,{
				Task:"GET"
			});
		});
		this.Peer.Send(this.peer,{
			Task:"GET"
		});
	},
	Setup:function() {
		this.__peer = new Peer(null, Object.assign(this.__rtcconfig,{
			debug: 50,
			host: "0.peerjs.com",
			key: "peerjs",
			path: "/",
			port: 443,
			secure: true,
			iceServers: [{ url: 'stun:stun2.1.google.com:19302' }]
		}));
		this.__peer.on("signal",function(data) {
			console.log(data);
		});
		this.__peer.on("open",function(id) {
			ATA.Peer.ID = ATA.Peer.__peer.id;
			ATA.Peer.Open();
		});
		this.__peer.on("disconnected",function() {
			ATA.Peer.__peer.id = ATA.Peer.ID;
			ATA.Peer.__peer._lastServerId = ATA.Peer.ID;
			ATA.Peer.__peer.reconnect();
		});
		this.__peer.on("close",function() {
			ATA.Peer.__conn = null;
		});
		this.__peer.on("connection",function(conn) {
			ATA.Peer.__conn_ready(conn);
		});
		this.__peer.on("error",function(err) {
			ATA.Peer.Error(err);
		});
		this.__peer.on("call",function(call) {
			ATA.Peer.ReceiveCall(call);
		});
	},
	Open:function() {
		console.log("MY ID = " + this.ID);
	},
	Error:function(err) {
		console.log("ERROR",err);
	},
	Receive:function(osender,odata) {
		console.log("\nnew Message:\nFromID : " + osender + "\nFrom : " + odata.ID + "\nTime : " + odata.Time + "\nData : \"" + JSON.stringify(odata.Data) + "\"");
	},
	Connect:function(odestination) {
		if (this.__conns[odestination]) this.__conns[odestination].close();
		var conn = this.__peer.connect(odestination,{
			reliable: true
		});
		this.__conn_ready(conn);
	},
	Send:function(odestination,odata) {
		if ((!odata) || (odata.constructor !== Object)) odata = {};
		odata = {
			ID:ATA.ID,
			Data:odata,
			Time:(new Date()).getTime()
		};
		if (this.__conns[odestination] && this.__conns[odestination].open) {
			this.__conns[odestination].send(JSON.stringify(odata));
		} else {
			if (this.__conns[odestination]) this.__conns[odestination].close();
			delete this.__conns[odestination];
		}
	},
	Call:function(odestination,func,stream) {
		if (this.__call) return;
		this.__call = this.__peer.call(odestination,stream?stream:this.__stream1);
		this.__call_ready(func);
		/*
		function (remoteStream) {
			window.remoteStream = remoteStream;
			var video = document.getElementById("theirVideo")
			video.src = URL.createObjectURL(remoteStream);
		}
		*/
	},
	AnswerCall:function() {
		return true;
	},
	ReceiveCall:function(call) {
		this.__call = call;
		if (this.AnswerCall()) this.__call.answer(this.__stream1);
	}
};
