	var chat = {};

	var chatsessions = new Array(); // keeping number of sessions and the chatlog outside.
	var chatlog      = new Array();
		
	chat = (function() {
	
		var self = {};
				
		self.chatobject = function() {
			
			var username = "User " + String.fromCharCode(65 + chatsessions.length );
			
			this.username = username;
			
			chatsessions.push(username);
		
			var header = $("#header");
			
			var chatwrapper = $("<div/>", {"class":"chatwrapper"});
			
			var userheader   = $("<h1/>").html(username);
			var inputmessage = $("<input/>", {"id":"message", "type":"text", "placeholder":"Type your message here"});
			
			var inputbutton = $("<button/>", {"id":"button", "type":"button"}).html("Send").data("username", username).data("message", inputmessage).on("click", function() {
					
					var message = $(this).data("username") + ": " + $(this).data("message").val() 
					
					chatlog.push(message);
					chat.updatechat();
				
			});
			
			
			var chatdiv     = $("<div/>", {class:"thread"})
			
			chatwrapper.append(userheader).append(inputmessage).append(inputbutton).append(chatdiv);
			header.append(chatwrapper);
			
		}

		self.updatechat = function() {
			
			var chatdiv = $(".thread");
			chatdiv.html("");
			
			$.each(chatlog, function(k, v){
				var chatdiv = $(".thread");

				var message = $("<h1/>").html(v);
				chatdiv.append(message);
								
			});
			
		};
	
	
	return self;
	
}());

$( document ).ready(function() {
    
	var session1 = new chat.chatobject();  // Create Instance
	var session2 = new chat.chatobject();
	var session3 = new chat.chatobject();
			
	console.log(session1);
	
});