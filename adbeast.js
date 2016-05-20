// Adbeast Application
// James Maguire 2015

var noSelected = 0;
var allSelected = 0;
var currentModule = 1;
var playListPos = 0;
var breadCrumbLevels = 0;

var adbeast = {};

adbeast.initialize     = (function() {

   var noSelected = 0;
   var playListPos = 0;

   var self = {};
     
	self.initialize = function() {
   
		var initialize = adbeast.initialize;
		var email      = adbeast.email;
		var general    = adbeast.general;
   
		email.getMailForNav();     // Populate Inbox for Navigation.
		initialize.security();     // Initialize Security - Timeout & User Access
		general.shareFullscreen(); // Check to see if GUID is passed in the URL String
		initialize.initRoot();     // Get top Level folders.	
		initialize.initNav();      // Initialize Navigation Bar.
		
	}
	 
	self.initRoot = function() {

		adbeast.loadObject.module = 1;
	
		document.location.href = "#ui";

		$(".folderOptions").show();
		$("#breadCrumb").html("");
		
		
	
		adbeast.loadObject.loadReels();			
		setTimeout("adbeast.general.initTaskbar();", 1000);			


		var breadCrumbArray = {
			nodename: [],
			oid: []
		}					
					
		adbeast.loadObject.breadCrumb = breadCrumbArray;
		
	  	var leftSideMenu = $("#leftSideMenu");
		var reelContents = $("#reelContents");
		leftSideMenu.show();
		reelContents.show();
		$("#more").hide();

		var reelObj = [];
		var loadObject = adbeast.loadObject;
					
		reelObj.reeloid = 381;
					
		loadObject.reelObj = reelObj;
		adbeast.loadObject.loadReel();

		
   }
   
   self.initNav = function () {
   
   $("#hello").click(function() {
		adbeast.initialize.initRoot();
   });
   
   $("#searchButton").bind("click", function() {
		adbeast.search.search();      
   });
   
   $(".signout_adbeast").click(function() {
      $.get("/logout.asp", {i:1}, function(data){
		document.location.href = "/";
      });          
   });
   
   
   }
   
   self.initCopyMenu = function() {
	
		$('select').chosen();
							
		var chosenResults = $(".chosen-results").eq(0);
							
		chosenResults.find("li").each(function() {
	   
			$(this).unbind().click(function() {
				
				var spotList = {
					spots: []
				};

				var reelOid = $(this).attr("value");
				
				$(".selected:visible").each(function() {

					var spotObject = new Object();
										
					spotOID = $(this).parent().parent().attr("spotoid");
					
					spotList.spots.push({
						"spotoid" : spotOID
					});

 				})

				$.confirm({
					text: "Are you sure you want to copy the selected items?",
					confirm: function(button) {
						addSpotsToReel(spotList, reelOid);				
						$(".modal1").remove();
					},
					cancel: function(button) {
						$(".modal1").remove();
					}
				});
				
			})
		});
   }
   
   self.security = function() {
	
	// Check for Timeout & Security access after all Ajax calls.

	$( document ).ajaxComplete(function( event, xhr, settings ) {
			
		try {
		   var myData = jQuery.parseJSON(xhr.responseText);
			
		   $.each(myData, function() {
			   $.each(this, function(k, v) {
  				   if (this.timeout == "true") {
					   document.location.href = "/";
				       document.location.parent = "_blank"
			   	   }
						   
				   if (this.access == "false") {
					   //adbeast.security.noAccess();
					   Alert("Access Denied");
				   }
			   })
			})
		} catch(e) {
		    // No JSON: Session is active, and access permitted.
		}
	});
	
   }
   
   return self;

}());

adbeast.refreshObject  = (function() {
	
	var self = {};
	var reelObj;
	
	self.refreshGallery = function() {
		
		var saveObject = adbeast.saveObject;
		
		reelObj = saveObject.reelObj;
		
		saveObject.prepareOidList();
		
		var spotList = [];
		
		$(saveObject.spotlist.spots).each(function() {
	
			var galleryItem = $("#theList [spotoid='" + this.spotoid + "']").parentsUntil("li").prevObject;
			
			galleryItem.appendTo("#theList");

		});
	
	}

	return self;
	
}());

adbeast.email  = (function() {
	
	var self = {};
	
	var format = "0"; // 1 for HMTL
	var objectOid;
	var objectName;
	var objectGuid;
	var msgId;
	var msgLoadType; //1 Inbox, 2 Sent Items, 3 Trash
	
	self.sendEmail = function() {
		
		var format     = this.format;
		var MyEmails   = this.MyEmails;
		
		adbeast.email.messageCenter();
	
		$.ajax({
			type: 'GET',
			url: "/adbeast/mailFunctions/newEmail.asp",
			async: false,
			success: function(data) {
			
				var EmailSend = $("#EmailSend");
				EmailSend.show();
				
				$("#messageCenter").html(data).show();
				$(".EmailFrom").focus();
				$(".chosen-container:visible").hide();
				$("#composeNew").hide();
				
				$.ajax({
					type: 'GET',
					url: "/adbeast/general/getCompanyUsers.asp",
					async: false,
					jsonpCallback: 'callback',
					contentType: "application/json",
					dataType: 'json',
					success: function(data) {
							
						var companyUsersSelect = $("<select/>",{class:"companyUsersSelect"}).append($("<option/>").text("Select User"));
						var userToSelect       = $(".addUsers");
						var sendObject         = $(".sendObject");
						
						$.each(data, function() {
							$.each(this, function(k, v) {

							companyUsersSelect.append($("<option/>", {value:this.email}).text(this.fname + " " + this.lname	));
							})
						})
						
						var addUserToEmailButton = $("<button/>", {class:"addUserToEmail"}).text("Add User").unbind("click").bind("click", function() {
							var emailAddress     = $(".addUsers").find(".result-selected:visible").attr("data-value");
							var emailAddresses   = $(".EmailTo").val() + ";" + emailAddress;

							$(".EmailTo").attr("value", emailAddresses);
						});
						
							try {
								var sentItems = $("<div/>", {class:"sentItems"}).data("guid",adbeast.email.objectGuid).html("Attachment: " + adbeast.email.objectName);
							} catch(e) {
								// No Reel Attached.
							}
						
						userToSelect.append(companyUsersSelect).append(addUserToEmailButton);
						sendObject.append(sentItems).show();
						
						$('.companyUsersSelect').chosen();
						$(".chosen-container").css("width","200px").show();
						
					},
					
					error: function(e) {
						console.log(e.message);
					} 
				});
				
				EmailSend.unbind().bind("click", function(){
				
					var EmailList = $(".EmailTo").val();
					var myEmailArray = EmailList.split(";");
				
					var Email = {
						email: []
					}
				
					$(myEmailArray).each(function() {
						Email.email.push({
							"emailaddress" : this
						});
					});
				
					$.ajax({
						type: 'GET',
						url: "/adbeast/mailFunctions/sendEmail.asp",
						async: false,
						data: {from: $(".EmailFrom").val(), to: JSON.stringify(Email), subject: $(".subject").val(), message: $(".message").val(), format: "0", guid:adbeast.email.objectGuid},
						success: function(data) {
							$(".modal1").remove();
							$("#overlays").removeClass();
							$(document).unbind("keyup");
							
							$.notification ({
								content:    'E-Mail successfully sent',
								border:     true,
								fill:       true,
								showTime:   true,
								icon:       'N',
								color:      'green',
								error:      false,
								timeout:    2000
							}) 
							adbeast.email.getMailForNav();
							adbeast.loadObject.loadReel();
							adbeast.loadObject.loadReels();
						
						},
					
						error: function(e) {
							console.log(e.message);
						} 
					});
				});
				
			},
			error: function(e) {
				console.log(e.message);
			} 
		});
		
	}
	
	self.getMailForNav = function () { 
		
		// Add option for new Message
		
		var inBoxMessages = $(".inBoxMessages");
		inBoxMessages.html("");
		
		var sentBy     = $("<h4/>").html("New Message");
		var msgSubject = $("<p/>").html("Compose new message");
		
		var link       = $("<a/>").append(sentBy).append(msgSubject);
		
		var message    = $("<li/>", { "class": "unread" }).append(link); 
		inBoxMessages.append(message);
	
		$.ajax({
				type: 'GET',
				url: "/adbeast/mailFunctions/getMail.asp",
				async: false,
				jsonpCallback: 'callback',
				contentType: "application/json",
				dataType: 'json',
				data: {messageLoadType: 2},
				success: function(data) {

				$.each(data, function() {

					$.each(this, function(k, v) {
						var sentBy     = $("<h4/>").html(this.username);
						var msgSubject = $("<p/>").html(this.msgsubject);
						var link       = $("<a/>").data("msgid", this.msgid).append(sentBy).append(msgSubject).click(function() {
							var	msgId      = $(this).data("msgid");
							adbeast.email.msgId = msgId;
							adbeast.email.messageCenter();
							adbeast.email.loadMessage();
							scrollTo(0,0);
							$(".inBoxMessages").hide();
						});
						var message = $("<li/>").append(link);
						inBoxMessages.append(message);
					})
					
				})
					
				},
				error: function(e) {
				    console.log(e.message);
			    } 
		});
		
		// Add option for See More
		var sentBy     = $("<h4/>").html("More..");
		var msgSubject = $("<p/>").html("-----");
		var link       = $("<a/>", { "msgid": this.msgid }).append(sentBy).append(msgSubject).click(function() {
		var	msgid      = $(this).attr("msgid");
			adbeast.email.messageCenter();
			$(".inBoxMessages").hide();
			
		});
		var message    = $("<li/>").append(link); 
		inBoxMessages.append(message);	
		
	}
	
	self.messageCenter = function() {
	
		document.location.href = "#ui";
		$(".workArea").hide();
	    $(".folderOptions").hide();
		$("#leftSideMenu").html("");
		$("#messageCenterTaskBar").show();
		$(".chosen-container").show();
		$("#composeNew").show();
		
		$.ajax({
				type: 'GET',
				url: "/adbeast/mailFunctions/getMail.asp",
				async: false,
				jsonpCallback: 'callback',
				contentType: "application/json",
				dataType: 'json',
				data: { numberToReturn: -1, messageLoadType:adbeast.email.msgLoadType },
				success: function(data) {

					var emailTypeDropDown = $("<select/>", {class:"emailTypeDropdown"}).append($("<option/>", {value:"select"}).text("Select")).append($("<option/>", {value:"SentItems"}).text("Sent Items")).append($("<option/>", {value:"Trash"}).text("Trash"));
					
					var emailTypeDropDownWrapper = ($("<div>", {style:"width: 274px;"})).append(emailTypeDropDown);
					
					var leftSideMenu = $("#leftSideMenu");
					leftSideMenu.append(emailTypeDropDownWrapper);
					
					$(".emailTypeDropdown").chosen();
					
					$(".chosen-results").eq(0).find("li[value='SentItems']").unbind("click").click(function() {
						adbeast.email.msgLoadType = 2;
						adbeast.email.messageCenter();
					});
				
					$(".chosen-results").eq(0).find("li[value='Trash']").unbind("click").click(function() {
						adbeast.email.msgLoadType = 3;
						adbeast.email.messageCenter();
					});
			
				$.each(data, function() {

						$.each(this, function(k, v) {
					
							var sentBy     = $("<h4/>", {"style":"height:3px; margin-top: 0px"}).html(this.username);
							var msgSubject = $("<div/>", {"style":"font-weight: normal; font-size: 12px;"}).html(this.msgsubject);
							var link       = $("<a/>", { "msgid": this.msgid }).append(sentBy).append(msgSubject).click(function() {
							var	msgId      = $(this).attr("msgid");
								$(".chosen-container").show();
								$("#composeNew").show();
								adbeast.email.msgId = msgId;
								adbeast.email.loadMessage();
								scrollTo(0,0);
							});
							
							var message    = $("<li/>", {"style":"padding-top: 10px; padding-bottom: 10px; line-height: 18px;"}).append(link);
							leftSideMenu.append(message).show();
	
						})
					
					})
					
				},
				error: function(e) {
				    console.log(e.message);
			    } 
		});
	
	}
	
	self.loadMessage = function() {
		
		var msgId = this.msgId
		
		$(".workArea").hide();
		$("#EmailSend").hide();
		$("#messageCenterTaskBar").show();
		
		$.ajax({
				type: 'GET',
				url: "/adbeast/mailFunctions/getMail.asp",
				data: {msgId:msgId},
				async: false,
				jsonpCallback: 'callback',
				contentType: "application/json",
				dataType: 'json',
				
				success: function(data) {

				$.each(data, function() {

					$.each(this, function(k, v) {
						
						var sentBy      = $("<label/>", {for:"sentBy", text:"Sent By "}).append($("<input/>", {id:"sentBy", val:this.username, class: "infobox glyph settings", style:"display: block; width:300px;"}));
						var sentTo      = $("<label/>", {for:"sentBy", text:"Sent To "}).append($("<input/>", {id:"sentTo", val:this.toemail, class: "infobox glyph settings", style:"display: block; width:300px;"}));
						var msgSubject  = $("<label/>", {for:"sentBy", text:"Subject "}).append($("<input/>", {id:"msgSubject", val:this.msgsubject, class: "infobox glyph settings", style:"display: block; width:300px;"}));
						var msgBody     = $("<textarea/>", { text: this.msgbody, class: "infobox glyph settings", height: "250px", width: "95%"})
						
					    this.objectname == null ? this.objectname = "None" : this.objectname == this.objectname;
						
						var attachments = $("<div/>", {}).html("Attachments: <a href='/ReelManager/ScreeningRoom/default.asp?eR=" + this.reeloid + "' target='_blank'>" + this.objectname + "</a>");
						
						var message    = $("<div/>", {style:"position: relative; left: 20px; top: 20px;"}).append(sentBy).append(sentTo).append(msgSubject).append(msgBody).append(attachments);
						
						$("#messageCenterTaskBar").show();
						$("#composeNew").unbind("click").bind("click", function () {
							adbeast.email.sendEmail();
						});
						
						$("#messageCenter").html("").append(message).show();
						
					})
					
				})
					
				},
				error: function(e) {
				    console.log(e.message);
			    } 
		});
		
	}

	return self;
	
}());

adbeast.saveObject   = (function() {
	
	var self = {};
	
	var oid
	var reeloid
	var portfolioid
	var spotlist = []
	var reelObj
	var oidTarget
	var folderOrderObj
	
	self.prepareOidList = function() {
		
		var spotList = {
			reeloid: [],
			spots: []
		};	
	
		spotList.reeloid.push(adbeast.saveObject.reelObj.reeloid);
	
		$(adbeast.saveObject.oidTarget).each(function() {

			spotOID = $(this).attr("spotoid");
					
			spotList.spots.push({
				"spotoid" : spotOID
			});

 		})
		
		adbeast.saveObject.spotlist = spotList;

	}
	
	self.renameReel = function() {
			
			$.fn.modal2({
			theme:      "credits",
			width:      650,
			height:     108,
			padding:    "10px",
			animation:  "none"
	
		})
		
		$.ajax({
			type: 'GET',
			url: "/adbeast/reelFunctions/renameReel.html",
			async: false,
			success: function(data) {
			
				$(".wrapper1").html(data);
				$(".newWorkspaceName").focus();
				
				$(".newWorkspaceName").attr("value", $(".chosen-single span").text());
				
				$("#closeReelButton").click(function () {
					$(".modal1").remove();	
					$("#overlays").removeClass("dark").removeClass("creditsOverlays");
				});	
				
				$(".renameReelButton").unbind().bind("click", function(){
					$.ajax({
						type: 'GET',
						url: "/adbeast/reelFunctions/renameReel.asp",
						async: true,
						jsonpCallback: 'callback',
						contentType: "application/json",
						dataType: 'json',
						data: {objectname: $(".newWorkspaceName").val(), oid: adbeast.loadObject.reelObj.reeloid},
						success: function(data) {
							
							$(".modal1").remove();
							$("#overlays").removeClass();
							$(document).unbind("keyup");
							
							$.notification ({
								content:    'Reel successfully renamed',
								border:     true,
								fill:       true,
								showTime:   true,
								icon:       'N',
								color:      'green',
								error:      false,
								timeout:    2000
							}) 

							adbeast.initialize.initRoot();
   
						},
					
						error: function(e) {
							console.log(e.message);
						} 
					});
				});
				
			},
			error: function(e) {
				console.log(e.message);
			} 
		});
		
	}
	
	self.saveReel = function() {

		adbeast.saveObject.reelObj  = adbeast.loadObject.reelObj;
		
		var reelInfoDiv_2 = $(".reelInfoDiv_2");
		
		reelInfoDiv_2.length == 0 ? adbeast.saveObject.oidTarget = ".reelInfoDiv_2_list" : adbeast.saveObject.oidTarget = ".reelInfoDiv_2";
		
		adbeast.saveObject.prepareOidList();
			
		$.ajax({
					type: 'GET',
					url: "/adbeast/reelFunctions/saveReel.asp",
					async: false,
					jsonpCallback: 'callback',
					contentType: "application/json",
					dataType: 'json',
					data: {spotList: JSON.stringify(adbeast.saveObject.spotlist), reeloid:adbeast.saveObject.reelObj.reeloid, reelName:$(".reelName").val(), module:adbeast.loadObject.module},
					success: function(data) {
					    $.notification ({
							content:    'Folder successfully saved',
							border:     true,
							fill:       true,
							showTime:   true,
							icon:       'N',
							color:      'green',
							error:      false,
							timeout:    2000
						}) 

						adbeast.loadObject.loadReels();						
						
					},

					error: function(e) {
						console.log(e.message);
					} 
		});
	
	}
	
	self.createReel = function() {
	
		$.fn.modal2({
			theme:      "credits",
			width:      650,
			height:     108,
			padding:    "10px",
			animation:  "none"
	
		})
		
		$.ajax({
			type: 'GET',
			url: "/adbeast/reelFunctions/createReel.html",
			async: false,
			success: function(data) {
				$(".wrapper1").html(data);
				$(".newReelName").focus();
				
				$(".newReelName").one("keydown", function(e) {
					if (e.keyCode == 13) {
					     adbeast.saveObject.saveReel();
				    }
				});
				
				$("#closeReelButton").click(function () {
					$(".modal1").remove();	
					$("#overlays").removeClass("dark").removeClass("creditsOverlays");
				});

				var folderVar;
				
				adbeast.loadObject.reelObj.reeloid != "" ? folderVar = JSON.stringify(adbeast.saveObject.folderOrderObj) : folderVar = "";
				
				$(".createReelButton").unbind().bind("click", function(){
					$.ajax({
						type: 'GET',
						url: "/adbeast/reelFunctions/createReel.asp",
						async: true,
						jsonpCallback: 'callback',
						contentType: "application/json",
						dataType: 'json',
						data: {objectname: $(".newReelName").val(), parentFid: adbeast.loadObject.parentFid, module:adbeast.loadObject.module, foldertype:adbeast.loadObject.loadType, folderOrder: folderVar, currentFolder: adbeast.loadObject.reelObj.reeloid},
						success: function(data) {
							
							$(".modal1").remove();
							$("#overlays").removeClass();
							$(document).unbind("keyup");
							
							$.notification ({
								content:    'Folder successfully created',
								border:     true,
								fill:       true,
								showTime:   true,
								icon:       'N',
								color:      'green',
								error:      false,
								timeout:    2000
							}) 

						adbeast.loadObject.loadReels();
				
						strText = $(".chosen-results").find("li[data-value='" + data.data[0].oid + "']").text();
						
						$(".chosen-results").find("li[data-value='" + data.data[0].oid + "']").click();
						
						$(".chosen-single").find("span").text(strText);
						
						},
					
						error: function(e) {
							console.log(e.message);
						} 
					});
				});
				
			},
			error: function(e) {
				console.log(e.message);
			} 
		});
	
	}
	
	return self;
}());

adbeast.deleteObject = (function() {
	
	var self = {};
	
	var reelObj;
	var spotOID;
	
	self.deleteReel = function() {
	
		var spotList = {
			spots: []
		};

		var spots = $(".reelInfoDiv_2");
		
		spots.each(function() {
					
			spotOID = $(this).attr("spotoid");
					
			spotList.spots.push({
				"spotoid" : spotOID
			});
			
		})
		
		$.ajax({
			type: 'GET',
			url: "/adbeast/reelFunctions/deleteReel.asp",
			async: false,
			jsonpCallback: 'callback',
			contentType: "application/json",
			dataType: 'json',
			data: {spotList: JSON.stringify(spotList), reelOid: adbeast.deleteObject.reelObj.reeloid, module:adbeast.loadObject.module },
			success: function(data) {
				$.notification ({
					content:    'Folder successfully removed',
					border:     true,
					fill:       true,
					showTime:   true,
					icon:       'N',
					color:      'green',
					error:      false,
					timeout:    2000
				}) 
				
				adbeast.initialize.initRoot();
				
			},
			error: function(e) {
				console.log(e.message);
			} 
		});
		
	}
	
	self.deleteFromReel = function() {
	
		var spotList = {
			spots: []
		};

		$(".selected:visible").each(function() {
					
			spotOID = $(this).parent().parent().attr("spotoid");
					
			spotList.spots.push({
				"spotoid" : spotOID
			});
			
		})
			    
		$.confirm({
			text: "Are you sure you want to delete the selected items?",
			confirm: function(button) {
				
				$.ajax({
					type: 'GET',
					url: "/adbeast/reelFunctions/deleteFromReel.asp",
					async: false,
					jsonpCallback: 'callback',
					contentType: "application/json",
					dataType: 'json',
					data: {spotList: JSON.stringify(spotList), reelOid: adbeast.loadObject.reelObj.reeloid, module:adbeast.loadObject.module },
					success: function(data) {
						$.notification ({
							content:    'Spot(s) successfully removed',
							border:     true,
							fill:       true,
							showTime:   true,
							icon:       'N',
							color:      'green',
							error:      false,
							timeout:    2000
						}) 
					$(".modal1").remove();
					},
					error: function(e) {
						console.log(e.message);
					} 
				});
				adbeast.loadObject.loadReel();					
				adbeast.general.initTaskbar();
			},
				cancel: function(button) {
					$(".modal1").remove();
			}
		});
	
	}
	
	self.deleteItemFromReel = function() {
	
		var spotOID = this.spotOID;
	
		var spotList = {
			spots: []
		};
			
		spotList.spots.push({
			"spotoid" : spotOID
		});
		
		
		$.confirm({
			text: "Are you sure you want to delete the selected item?",
			confirm: function(button) {
				
				$.ajax({
					type: 'GET',
					url: "/adbeast/reelFunctions/deleteFromReel.asp",
					async: false,
					jsonpCallback: 'callback',
					contentType: "application/json",
					dataType: 'json',
					data: {spotList: JSON.stringify(spotList), reelOid: adbeast.loadObject.reelObj.reeloid, module:adbeast.loadObject.module },
					success: function(data) {
						$.notification ({
							content:    'Spot(s) successfully removed',
							border:     true,
							fill:       true,
							showTime:   true,
							icon:       'N',
							color:      'green',
							error:      false,
							timeout:    2000
						}) 
					$(".modal1").remove();
					},
					error: function(e) {
						console.log(e.message);
					} 
				});
				adbeast.loadObject.loadReel();					
				adbeast.general.initTaskbar();
			},
				cancel: function(button) {
					$(".modal1").remove();
			}
		});
	
	}
	
	return self
	
}());

adbeast.loadObject   = (function() {
	
	var self = {};
	
	var oid
	var reeloid
	var portfolioid
	var spotlist = []
	var reelObj
	var oidTarget
	var module
	var parentFid
	var objectGuid
	var parentFolderOID
	var breadCrumb = []
	
	self.loadReels = function() {
	
			var objectGuid = this.objectGuid;
			
			var leftSideMenu = $("#leftSideMenu");
			
			$("#galleryDirectory").html("");
			
			leftSideMenu.html("");		
			var eC = "eC";
			
			var loadObject = adbeast.loadObject;
			
			loadObject.fid = "";
			
			$.ajax({
					type: 'GET',
					url: "/adbeast/general/getFolders.asp",
					async: false,
					jsonpCallback: 'callback',
					contentType: "application/json",
					dataType: 'json',
					
					data: {
						guid: objectGuid
					},
					
					success: function(data) {
						
						var reelContents = $("#notification"); 
						
						if (data.data == "") {
							
							$("#taskBar").hide();
							$("#reelContents").html("");
							$(".folderOptions").hide();
							
							//reelContents.html("You currently do not have any Workspaces created here. <br><br>");
						
						}
					 
						var selectFolder = $("<select/>");

						$.each(data, function() {
							$.each(this, function(k, v) {
								
								var optionEntry = $("<option/>", {value: this.reeloid, text:this.objectname});
								selectFolder.append(optionEntry);

								var loadReel = $("<li/>", { "class": "loadReel " + this.reeloid, "id": this.reeloid, "reeloid": this.reeloid, "cluster_id":this.cluster_id, "parent_fid":this.parent_fid}).data("fid",this.fid).data("folder_order", this.folder_order).html("<a>" + this.objectname + "</a>");
								
								if (this.parent_fid != this.fid) {
									loadReel.css("padding-left", this.folder_level + "5px");
								}
										
								if (this.isParent != null) {
									loadReel.addClass("parentFolder");
								}
								
								var galleryDirectory = $("<div/>", {class:"galleryDirectory"});
								
			
								var galleryDirectoryLeft = $("<div/>", {class:"galleryDirectoryLeft"}).html("<img src='/images/folder.png'>");
								
								
								var theList = $(".theList").data("viewMode");
		
								//if (theList == 1 || theList == "undefined") {
								var galleryDirectoryRight = $("<div/>", {class:"galleryDirectoryRight"}).html(this.objectname);
								//} else {
								//	var galleryDirectoryRight = $("<div/>", {class:"galleryDirectoryRight_list"}).html(this.objectname);
								//}
								
								galleryDirectory.append(galleryDirectoryLeft).append(galleryDirectoryRight);
								galleryDirectory.addClass("workspaceId" + this.oid);
								
								galleryDirectory.data("reelObj", this).on("click", function(e){
									
									$(".galleryDirectory").each(function() {
										$(this).removeClass("navSelected");
									});
									
									$(".loadReel").each(function() {
										$(this).removeClass("navSelected");
									});
									
									clicks++;  
									if(clicks === 1) {
										
										$(".chosen-results").find("li[data-value='" + $(this).data("reelObj").oid + "']").addClass("active-result").addClass("result-selected");
										
									} else {

										$("#breadCrumb").html("");
										var breadCrumbArray = adbeast.loadObject.breadCrumb;

										breadCrumbArray.nodename[0] = "<img src='/images/home.png' width='30px'>";
										breadCrumbArray.oid[0] = "";
										
										breadCrumbArray.nodename[1] = $(this).data("reelObj").objectname;
										breadCrumbArray.oid[1] = $(this).data("reelObj").reeloid;
										
										breadCrumbLevels = 1;
										
										var breadCrumbText;
								
										var arrayLength = adbeast.loadObject.breadCrumb.nodename.length;
										
										for (var i = 0; i < arrayLength; i++) {
											breadCrumbText = adbeast.loadObject.breadCrumb.nodename[i];
							
											var breadCrumbLayer = $("<div/>", {class:"breadCrumbLayer"}).data("i", i).html(breadCrumbText)
							
											if (i == 0) {
												breadCrumbLayer.click(function() {
													$("#breadCrumb").html("");
													adbeast.initialize.initRoot();
												});
											}
							
											$("#breadCrumb").append(breadCrumbLayer);	
										}
										
										
										var loadObject = adbeast.loadObject; 
										
										loadObject.reelObj = $(this).data("reelObj");
										loadObject.module = $(this).data("module");
										$(".reelName").val($(this).data("reelObj").objectname);
									
										loadObject.loadReel();
									
										$(".chosen-results").find("li[data-value='" + $(this).data("reelObj").oid + "']").addClass("active-result").addClass("result-selected");
										strText = $(".chosen-results").find("li[data-value='" + $(this).data("reelObj").oid + "']").text();
										$(".chosen-single").find("span").text(strText);
									
									
									
										adbeast.loadObject.parentFolderOID = $(this).data("reelObj").oid;	
										$(this).addClass("navSelected");
										
										$(".breadCrumbLayer:first").html("<img src='/images/home.png' width='30px'>");
										
										timer = setTimeout(function() {
										
											//loadObject.loadReel();
									
											//adbeast.general.initTaskbar();
										
											clicks = 0;             
										}, DELAY);


										clearTimeout(timer);  
										
										// up breadCrumb level + 1
										if ($(this).data("reelObj").isparent != null) {
											// up breadcrumb level + 1
											breadCrumbLevels ++;
										
											adbeast.loadObject.loadSubfolders();
										
										}
										
										clicks = 0;             
									}
								}).on("dblclick", function(e){
									e.preventDefault();  
								});
								
								$("#galleryDirectory").append(galleryDirectory);
								
								var loadSubfoldersArrow = $("<div/>", {class:"loadSubfoldersArrow"});

								//if (this.isparent != null) {
								//loadReel.addClass("parentFolder");
								
								loadReel.append(loadSubfoldersArrow);
								//}
							
								var DELAY = 200, clicks = 0, timer = null;

								loadReel.data("reelObj", this).on("click", function(e){
									
									$(".galleryDirectory").each(function() {
										$(this).removeClass("navSelected");
									});
									
									$(".loadReel").each(function() {
										$(this).removeClass("navSelected");
									});
									
									clicks++;  
									if(clicks === 1) {
										$("#breadCrumb").html("");
										
										breadCrumbArray.nodename[0] = "<img src='/images/home.png' width='30px'>";
										breadCrumbArray.oid[0] = "";
										
										breadCrumbArray.nodename[1] = $(this).data("reelObj").objectname;
										breadCrumbArray.oid[1] = $(this).data("reelObj").reeloid;
										
										breadCrumbLevels = 1;
										
										adbeast.loadObject.breadCrumb = breadCrumbArray;
								
										var breadCrumbText;
								
										var arrayLength = adbeast.loadObject.breadCrumb.nodename.length;
										
										for (var i = 0; i < arrayLength; i++) {
											breadCrumbText = adbeast.loadObject.breadCrumb.nodename[i];
							
											var breadCrumbLayer = $("<div/>", {class:"breadCrumbLayer"}).data("i", i).html(breadCrumbText)
											
											if (i == 0) {
												breadCrumbLayer.click(function() {
													$("#breadCrumb").html("");
													adbeast.initialize.initRoot();
												});
											}
											
											$("#breadCrumb").append(breadCrumbLayer);	
										}
										
										var loadObject = adbeast.loadObject;
										
										loadObject.reelObj = $(this).data("reelObj");
										loadObject.module = $(this).data("module");
										$(".reelName").val($(this).data("reelObj").objectname);
									
									
										adbeast.loadObject.parentFolderOID = $(this).data("reelObj").oid;	
										$(this).addClass("navSelected");
										
										timer = setTimeout(function() {
										
											loadObject.loadReel();
									
											adbeast.general.initTaskbar();
										
											clicks = 0;             
										}, DELAY);
									} else {
										clearTimeout(timer);  
										
										// up breadCrumb level + 1
										if ($(this).data("reelObj").isparent != null) {
											// up breadcrumb level + 1
											breadCrumbLevels ++;
										
											adbeast.loadObject.loadSubfolders();
										
										}
										
										clicks = 0;             
									}
								}).on("dblclick", function(e){
									e.preventDefault();  
								});

								leftSideMenu.append(selectFolder).show()
							
								var currentFID = this.fid;
								
								jQuery.fx.off = true;
								
							})
						$("select").chosen();
						})
						
					},
					error: function(e) {
						console.log(e.message);
					} 
						
			});
			
			$(".chosen-results").eq(0).find("li").unbind().click(function() {

				adbeast.loadObject.breadCrumb.nodename.length = 0
				adbeast.loadObject.breadCrumb.oid.length = 0
			
				$("#breadCrumb").html("");
			
				var reelObj = [];
				var loadObject = adbeast.loadObject;
				
				adbeast.loadObject.parentFolderOID = $(this).attr("data-value");
				loadObject.loadSubfolders();

				reelObj.reeloid = $(this).attr("data-value");

				adbeast.loadObject.breadCrumb.nodename[0] = "<img src='/images/home.png' width='30px'>";
				adbeast.loadObject.breadCrumb.oid[0] = "";
				
				adbeast.loadObject.breadCrumb.nodename[1] = $(this).text();
				adbeast.loadObject.breadCrumb.oid[1] = $(this).attr("data-value");
				
				breadCrumbLevels++;
				breadCrumbLevels++;
				var arrayLength = adbeast.loadObject.breadCrumb.nodename.length;
	
				for (var i = 0; i < arrayLength; i++) {
											
					breadCrumbText = adbeast.loadObject.breadCrumb.nodename[i];
											
					var breadCrumbLayer = $("<div/>", {class:"breadCrumbLayer"}).data("i", i).html(breadCrumbText).unbind().click(function() {
												
						adbeast.loadObject.breadCrumb.nodename.splice($(this).data("i") + 1,arrayLength)
						adbeast.loadObject.breadCrumb.oid.splice($(this).data("i") + 1,arrayLength)
												
						$(".breadCrumbLayer img:last").remove();
												
						$(".breadCrumbLayer").slice($(this).data("i") + 1).detach();
												
						var reelObj = [];
						var loadObject = adbeast.loadObject;
												
						reelObj.reeloid = adbeast.loadObject.breadCrumb.oid[$(this).data("i")];
						loadObject.reelObj = reelObj;
						loadObject.loadReel();
											

						$(".chosen-results").find("li[data-value='" + $(this).data("i") + "']").addClass("active-result").addClass("result-selected");
						strText = $(".chosen-results").find("li[data-value='" + $(this).data("i") + "']").text();
						$(".chosen-single").find("span").text(strText);
												
						adbeast.loadObject.parentFolderOID = adbeast.loadObject.breadCrumb.oid[$(this).data("i")];
						adbeast.loadObject.loadSubfolders();
												
						if ($(this).data("i") == 0) { 
							adbeast.loadObject.breadCrumb.nodename.splice(0,arrayLength)
							adbeast.loadObject.breadCrumb.oid.splice(0,arrayLength)
							$("#breadCrumb").html("");
													
							loadObject.loadReels();
							$("#reelContents").html("");
						}
						
												
					});
						$("#breadCrumb").append(breadCrumbLayer);
						
					}
				
				
				loadObject.reelObj = reelObj;
				loadObject.loadReel();
				
			});
			
			$(".chosen-search input").keydown(function(e) {
				if (e.keyCode == 13) {
					var reelObj = [];
					var loadObject = adbeast.loadObject;
					
					reelObj.reeloid = $(".result-selected").attr("data-value");
					
					loadObject.reelObj = reelObj;
					loadObject.loadReel();
				}
			});
	
	
	
	}
	
	self.loadSubfolders = function() {
	
			var objectGuid = this.objectGuid;
	
			var leftSideMenu = $("#leftSideMenu");
			
			$("#galleryDirectory").html("");
			
			$.ajax({
					type: 'GET',
					url: "/adbeast/general/getFolders.asp",
					async: false,
					jsonpCallback: 'callback',
					contentType: "application/json",
					dataType: 'json',
					
					data: {
						parentFolderOID : adbeast.loadObject.parentFolderOID
					},
					
					success: function(data) {
						//console.log(data);
						var reelContents = $("#notification"); 
						
						if (data.data == "") {
							
							//reelContents.html("You currently do not have any Workspaces created here. <br><br>");
						
						}
						
						$.each(data, function() {
							$.each(this, function(k, v) {
								
									if (k > 0) {
									var galleryDirectory = $("<div/>", {class:"galleryDirectory"});
								
									var galleryDirectoryLeft = $("<div/>", {class:"galleryDirectoryLeft"}).html("<img src='/images/folder.png'>");
									var galleryDirectoryRight = $("<div/>", {class:"galleryDirectoryRight"}).html(this.objectname);
								
									galleryDirectory.append(galleryDirectoryLeft).append(galleryDirectoryRight);								
									galleryDirectory.addClass("workspaceId" + this.oid);
									galleryDirectory.data("reelObj", this).on("click", function(e){
									
									$(".galleryDirectory").each(function() {
										$(this).removeClass("navSelected");
									});
																		
									$(".loadReel").each(function() {
										$(this).removeClass("navSelected");
									});
									
									clicks++;  
									if(clicks === 1) {
										
										
									} else {

										$(".chosen-results").find("li[data-value='" + $(this).data("i") + "']").addClass("active-result").addClass("result-selected");
									
										clearTimeout(timer);    
				
										$("#breadCrumb").html("");	
										
										adbeast.loadObject.breadCrumb.nodename[0] = "<img src='/images/home.png' width='30px'>";
										adbeast.loadObject.breadCrumb.oid[0] = "";
										
										adbeast.loadObject.breadCrumb.nodename[breadCrumbLevels] = $(this).data("reelObj").objectname;
										adbeast.loadObject.breadCrumb.oid[breadCrumbLevels] = $(this).data("reelObj").oid;
								
										var breadCrumbText;
								
										var arrayLength = adbeast.loadObject.breadCrumb.nodename.length;
	
											for (var i = 0; i < arrayLength; i++) {
											
											breadCrumbText = adbeast.loadObject.breadCrumb.nodename[i];
											
											if (breadCrumbText == "undefined") {
												breadCrumbText = "";	
											}
											
											try {
												var breadCrumbLayer = $("<div/>", {class:"breadCrumbLayer"}).data("i", i).html(breadCrumbText).unbind().click(function() {
												
												adbeast.loadObject.breadCrumb.nodename.splice($(this).data("i") + 1,arrayLength)
												adbeast.loadObject.breadCrumb.oid.splice($(this).data("i") + 1,arrayLength)
												
												$(".breadCrumbLayer").slice($(this).data("i") + 1).detach();
												
												var reelObj = [];
												var loadObject = adbeast.loadObject;
												
												reelObj.reeloid = adbeast.loadObject.breadCrumb.oid[$(this).data("i")];
												loadObject.reelObj = reelObj;
												loadObject.loadReel();
											
												$(".chosen-results").find("li[data-value='" + $(this).data("i") + "']").addClass("active-result").addClass("result-selected");
												strText = $(".chosen-results").find("li[data-value='" + $(this).data("i") + "']").text();
												$(".chosen-single").find("span").text(strText);
												
												adbeast.loadObject.parentFolderOID = adbeast.loadObject.breadCrumb.oid[$(this).data("i")];
												adbeast.loadObject.loadSubfolders();
												
												if ($(this).data("i") == 0) { 
													adbeast.loadObject.breadCrumb.nodename.splice(0,arrayLength)
													adbeast.loadObject.breadCrumb.oid.splice(0,arrayLength)
													$("#breadCrumb").html("");
													
													loadObject.loadReels();
													$("#reelContents").html("");
												}
												
												
											});
											
											} catch (e) {
												
											}
											
											$("#breadCrumb").append(breadCrumbLayer);
											
											}
											$(".breadCrumbLayer img").eq(1).remove();
											$(".breadCrumbLayer img:last").remove();
	
											var loadObject = adbeast.loadObject;
										
											loadObject.reelObj = $(this).data("reelObj");
											loadObject.module = $(this).data("module");
											$(".reelName").val($(this).data("reelObj").objectname);
									
											adbeast.loadObject.parentFolderOID = $(this).data("reelObj").oid	
											$(this).addClass("navSelected");
										 
											$(".breadCrumbLayer:first").html("<img src='/images/home.png' width='30px'>");
										 
										timer = setTimeout(function() {
										
											loadObject.loadReel();
									
											adbeast.general.initTaskbar();
										
											clicks = 0;             
										}, DELAY);
				
				
										//if ($(this).data("reelObj").isparent != null) {
											// up breadcrumb level + 1
											breadCrumbLevels ++;
										
											adbeast.loadObject.loadSubfolders();
										
										//}
										clicks = 0;             
										
									}
								}).on("dblclick", function(e){
									e.preventDefault();  
								});
								
								
								$("#galleryDirectory").append(galleryDirectory);
								
								var loadReel = $("<li/>", { "class": "loadReel " + this.reeloid, "id": this.reeloid, "reeloid": this.reeloid, "cluster_id":this.cluster_id, "parent_fid":this.parent_fid}).data("fid",this.fid).data("folder_order", this.folder_order).html("<a>" + this.objectname + "</a>");
								
								var loadSubfoldersArrow = $("<div/>", {class:"loadSubfoldersArrow"});
								
								if (this.isparent != null) {
									loadReel.addClass("parentFolder");
									loadReel.append(loadSubfoldersArrow);
								}
								
								var DELAY = 200, clicks = 0, timer = null;

								loadReel.data("reelObj", this).on("click", function(e){
									
									$(".galleryDirectory").each(function() {
										$(this).removeClass("navSelected");
									});
									
									$(".loadReel").each(function() {
										$(this).removeClass("navSelected");
									});
									
									clicks++;  
									if(clicks === 1) {
										$("#breadCrumb").html("");	
										
										adbeast.loadObject.breadCrumb.nodename[breadCrumbLevels] = $(this).data("reelObj").objectname;
										adbeast.loadObject.breadCrumb.oid[breadCrumbLevels] = $(this).data("reelObj").oid;
								
										var breadCrumbText;
								
										var arrayLength = adbeast.loadObject.breadCrumb.nodename.length;
	
											breadCrumbArray.nodename[0] = "<img src='/images/home.png' width='30px'>";
										    breadCrumbArray.oid[0] = "";
										
											for (var i = 0; i < arrayLength; i++) {

											breadCrumbText = adbeast.loadObject.breadCrumb.nodename[i];
											var breadCrumbLayer = $("<div/>", {class:"breadCrumbLayer"}).data("i", i).html(breadCrumbText).click(function() {
												
												adbeast.loadObject.breadCrumb.nodename.splice($(this).data("i") + 1,arrayLength)
												adbeast.loadObject.breadCrumb.oid.splice($(this).data("i") + 1,arrayLength)
												
												$(".breadCrumbLayer img:last").remove();
												
												$(".breadCrumbLayer").slice($(this).data("i") + 1).detach();
												
												var reelObj = [];
												var loadObject = adbeast.loadObject;
												
												reelObj.reeloid = adbeast.loadObject.breadCrumb.oid[$(this).data("i")];
												loadObject.reelObj = reelObj;
												loadObject.loadReel();
												
												adbeast.loadObject.parentFolderOID = adbeast.loadObject.breadCrumb.oid[$(this).data("i")];
												adbeast.loadObject.loadSubfolders();
												
												if ($(this).data("i") == 0) { 
													adbeast.loadObject.breadCrumb.nodename.splice(0,arrayLength)
													adbeast.loadObject.breadCrumb.oid.splice(0,arrayLength)
													$("#breadCrumb").html("");
													
													loadObject.loadReels();
													$("#reelContents").html("");
												}
												
											});
											
											$("#breadCrumb").append(breadCrumbLayer);
											
										}
											$(".breadCrumbLayer img").eq(1).remove();
											$(".breadCrumbLayer img:last").remove();
	
										var loadObject = adbeast.loadObject;
										
										loadObject.reelObj = $(this).data("reelObj");
										loadObject.module = $(this).data("module");
										$(".reelName").val($(this).data("reelObj").objectname);
									
										adbeast.loadObject.parentFolderOID = $(this).data("reelObj").oid	
										$(this).addClass("navSelected");

										$(".breadCrumbLayer:first").html("<img src='/images/home.png' width='30px'>");
										 
										timer = setTimeout(function() {
										
											loadObject.loadReel();
									
											adbeast.general.initTaskbar();
										
											clicks = 0;             
										}, DELAY);
									} else {
										clearTimeout(timer);    
				
										if ($(this).data("reelObj").isparent != null) {
											// up breadcrumb level + 1
											breadCrumbLevels ++;
										
											adbeast.loadObject.loadSubfolders();
										
										}
										clicks = 0;             
										
									}
								}).on("dblclick", function(e){
									e.preventDefault();  
								});
								
								var currentFID = this.fid;
								jQuery.fx.off = true;
								
								}
							})
						})
						
					},
					error: function(e) {
						console.log(e.message);
					} 
			});
	}
	
	self.loadReel = function() {
	
		var loadObject = adbeast.loadObject;
			
		var objectString = loadObject.reelObj.reeloid + ",GA,GVI,GQ,2,MyReels"
		
		var reelContents = $("#reelContents");
			
		reelContents.html("");
		
	    $("#selectAll, #viewReel, #upload").unbind("click");
		$("#folderOptions").show();
		 
		
    	var playList = {
			oid: [],
			objectlink: [],
			objectname: [],
			object_type: []
		};	

		$.ajax({
			type: 'GET',
			url: "/adbeast/general/getGalleryView.asp",
			async: false,
			jsonpCallback: 'callback',
			contentType: "application/json",
			dataType: 'json',
			data: {objectString:objectString},
				
			success: function(data) {
			
			var reelContents = $("#reelContents");
			
			if (data.data == "") {
				//reelContents.html("<div style='font-size: 20px; padding-left: 50px; padding-top: 10px;'>You currently do not have any items here.</div>").show();
			}
				
				$(".workArea").hide();
				$("#taskBar").show();
				
				var reelContents = $("#reelContents");
				var theList = $(".theList");
		
				reelContents.show();
				
				try {
					theList.remove();
				} catch(e) {
					alert(e.message);
				}
				
				
				reelContents.append($("<ul/>", {class:"theList"}))

				$("#reelName").val(adbeast.loadObject.reelObj.objectname);
				
				$.each(data, function() {
					$.each(this, function(k, v) {
							
						playList.oid.push(this.oid);
						playList.objectlink.push(this.object_link);
						playList.objectname.push(this.objectname);
						playList.object_type.push(this.object_type)
						adbeast.general.objectGuid = this.reelguid;
						adbeast.email.objectGuid = this.reelguid;
						
						var img = new Image();
					
						img.src = this.thumbnailimage;
						
						var searchResult   = $("<li/>", {class:"galleryItem"});

						searchResult.bind("click", function() {
							$(this).find("mediaViewer_v2").css("border-color","black");
						});
							
						if (this.object_type != 2 && this.object_type != 10) {
								
							if (this.object_type == 25) {
								 img.src = "http://img.youtube.com/vi/" + this.object_link + "/0.jpg";
							
							} else if (this.object_type == 8) {
								 
								 img.src = "/images/documents.png";
								 img.width = "50";
							} else if (this.object_type == 14) {
								 
								img.src = this.object_link // Just for now.
								//img.src = this.im_mediumimage;
							} else {
								 if (adbeast.loadObject.module == 1) {
									img.src = this.thumbnailimage;
								 } else {
									img.src = this.im_mediumimage;
								 }
								 
							}
							
							var reelInfoDiv_2  = $("<div/>", {spotoid: this.oid, reeloid: this.oid, type:"root", id:"PL_" + k, class:"reelInfoDiv_2"});
						
						} else {
						
							img.onload = function() {
							
								if ($(this).height == 0) {
									img.src = "images/icons/icon_file.gif";
								}
								
							};
														
							var reelInfoDiv_2  = $("<div/>", {spotoid: this.oid, reeloid: this.oid, type:"root", id:"PL_" + k, class:"reelInfoDiv_2"}).data("reelObj", this).unbind().click(function() {
								// Something
							});
						}
						
						var checkSpot      = $("<div/>", {class: "icons checkSpot"}).css("display","none").append(
							$("<a/>", {href: "javascript: checkSpotInPlaylist(" + k +");"}).html("&nbsp;&nbsp;")
						).unbind("click").bind("click",function(e) {
							e.stopImmediatePropagation();
						});
						
						var mediaViewer_v2 = $("<div/>", {class: "mediaViewer_v2"}).data("reelObj", this).css("background-color","#202020").unbind().click(function() {
							
							$(".galleryItem").each(function(e,val) {
									$(this).find("#spotName").css("color", "#393933");
									$(this).find("selected").removeClass("selected").html("&nbsp;&nbsp;");
									
							})
							
							checkSpotInPlaylist(k);
							
						}).dblclick(function() { 
							
							if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
								
								if ($(this).data("reelObj").object_type == 25) {
									//window.open("http://www.youtube.com/watch?v=" + $(this).data("reelObj").object_link + "&fs=1");
									window.open("http://ab-newstaging.adbeast.com/adbeast/general/embedModal.asp?oid=" + $(this).data("reelObj").oid)
								} else {
									window.open("http://ab-newstaging.adbeast.com/" + $(this).data("reelObj").object_link);
								}
								
							} else {
								var general = adbeast.general;
								general.oid = $(this).data("reelObj").oid;
								general.playList = playList;
								general.playListPos = k;
								general.plainModal = false;
								general.loadModal();
								
								if ($(this).data("reelObj").object_type == 3 || $(this).data("reelObj").object_type == 8 ) {
									$(".modal").addClass("modal_fullscreen");
									$(".modalCloseButton").removeClass("modalCloseButton").addClass("modalCloseButton_fullscreen");
									$(".modalLeftArrow").removeClass("modalLeftArrow").addClass("modalLeftArrow_fullscreen");
									$(".modalRightArrow").removeClass("modalRightArrow").addClass("modalRightArrow_fullscreen");
									$(".titleDiv").removeClass("titleDiv").addClass("titleDiv_fullscreen");

								}
							}
							
						}).append($("<div/>", {style:"width: 100%; height: 100%", class: "DisplayModePlayButton"})).append(
							img.src.indexOf("null") > 0 ? $("<div/>", {class:"generatingThumbnail", html:"Generating Thumbnail"}) : $("<img/>", {src:img.src})
						);
						
						PL_Taskbar = ($("<div/>", {class:"PL_Taskbar"}).append($("<img/>", {class:"PL_Download", src:"images/download.jpg"}).data("reelObj", this).click(function(e) {
							e.preventDefault();  //stop the browser from following
							window.location.href = '/adbeast/general/download.asp?oid=' + $(this).data("reelObj").oid;
							
						})).append($("<img/>", {class:"PL_MetaData", src:"images/metadata.png"}).data("reelObj", this).click(function(e) {
							adbeast.general.oid = $(this).data("reelObj").oid;
							adbeast.general.loadCredits();
						
						})));

						this.object_type == 25 ? PL_Taskbar.find(".PL_Download").remove() : $(".PL_Download").show();
						
						var PL_DisplayMode2 = $("<div/>", {class:"PL_DisplayMode2", id:"spotName"}).append(
							$("<div/>", {class:"PL_DisplayMode2", id:"spotName"}).html(this.objectname.substring(0,70))
						).after(PL_Taskbar);
						
						PL_DisplayMode2.append($("<div/>", {style:"width: 100%; height: 21px", class: "DisplayModeGradient"}));

						$("#spotName").after(PL_Taskbar);
							
						reelInfoDiv_2.append(checkSpot).append(mediaViewer_v2).append(PL_DisplayMode2);
						
						var resultHtml = searchResult.append(reelInfoDiv_2);
						var theList = $(".theList");
						theList.append(resultHtml);
						
						})
						
						var leftSideMenu = $("#leftSideMenu");
						leftSideMenu.sortable('destroy');
												
				})
			
			  // here
			  $(".theList").sortable({ 

			     opacity:           0.9, 
				 helper:            "clone",
			     revert:            15,
				 cursor:            "move",
				 containment:       "body",
				 connectWith:       "#leftSideMenu",
				 cursorAt:		    { top: 5, left: 5 },
				 
                 start: function(e, ui)
                 {
                    $(ui.helper).css("z-index", "1000000");
					
					var a = navigator.userAgent;
		
					if ((a.indexOf("Chrome") > 0 || a.indexOf("Safari") > 0 ) && a.indexOf("Mac") > 0) {
						$(ui.helper).css("margin-top", $(window).scrollTop());
					}

                 },
				 
			     stop: function(e, ui)
                 {
					
					$(".loadReel").removeClass("leftHandHover");
                    $(ui.helper).css("z-index", "1");
					
					adbeast.saveObject.oidTarget = ".reelInfoDiv_2";
					adbeast.saveObject.reelObj  = adbeast.loadObject.reelObj;
					
					adbeast.refreshObject.refreshGallery();
					
                 },
				 
				  change: function(e, ui)
                 {
					
					$(".loadReel").removeClass("leftHandHover");
					
					if ($(ui.helper).find(".PL_DisplayMode2").css("display") == "none") {
						$(".loadReel").eq(ui.placeholder.index()).addClass("leftHandHover");
					}

				}
				 
            });
			
			$("#leftSideMenu").sortable({ 

			     opacity:           0.9, 
				 helper:            "clone",
			     revert:            15,
				 cursor:            "move",
				 containment:       "body",
				 distance: 			20,
				 placeholder:       ".dropTo",
				 
				 receive: function(e, ui)
                 {
 
					var spotOID = $(ui.item).find("div").eq(0).attr("spotoid");
				
					var spotList = {
						spots: []
					};

					spotList.spots.push({
						"spotoid" : spotOID
					});

					var newIndex = ui.item.index();
					
					$(ui.item).remove();
										
					addSpotsToReel(spotList,$(".loadReel").eq(newIndex).attr("id"));
					adbeast.loadObject.loadReel();
					
				 },
				 
				 out: function(e, ui) {
					$("ui.helper").removeClass("hoverMinimized");
				 
				 },
				 
				 change: function(e, ui)
                 {
					
					$(ui.helper).addClass("hoverMinimized").find(".DisplayModePlayButton").find("img").hide();		
					$(ui.helper).find(".reelInfoDiv_2").css("width","80px").css("height","44px").css("border","2px solid black").css("background-color","#ffffff");
					$(ui.helper).find(".mediaViewer_v2").css("height","50px").css("line-height", "40px").css("background-color","#ffffff");
					$(ui.helper).find(".PL_DisplayMode2").hide();
					$(ui.helper).find(".PL_Taskbar").hide();
					$(ui.helper).find(".removeSpot").hide();
					$(ui.helper).find(".checkSpot").hide();
					$(ui.helper).find("img").css("width","80px");
					
                 },
				
            });
				
		}
	 
	 });
	
	}
	
	return self;

}());

adbeast.general      = (function() {

	var self = {};
	
	var reelObj;
	var folderName;
	var oid;
	var playListPos;
	var playList;
	var plainModal;
	var objectGuid;

	self.shareFullscreen = function() {
	
	// Check to see if Reel GUID exists. (eRG)
  
	  var querystring = [ ];
	  if ( location.search.length > 1 )
	     {
		       var pairs = location.search.substring(1).split("&");
               for (var i=0; i < pairs.length; i++) 
            {
              var pair = pairs[i].split("=");
              querystring[ pair[0] ] = decodeURIComponent( pair[1] );
            }
         }
 
	  var eRG = querystring["eRG"];
	  if (eRG != null) {
	    
		$.ajax({
			type: 'GET',
			url: "/adbeast/reelFunctions/getOidFromGuid.asp",
			async: false,
			jsonpCallback: 'callback',
			contentType: "application/json",
			dataType: 'json',
			data: {guid:eRG},
			success: function(data) {
	
	
				console.log(data.data[0].oid);
				var reelObj = [];
				var loadObject = adbeast.loadObject;
					
				reelObj.reeloid = data.data[0].oid;
				
				$("#shareFullscreenReelName").html(data.data[0].objectname);
					
				loadObject.module = 1;
				loadObject.objectGuid = eRG;
				loadObject.reelObj = reelObj;
				
				loadObject.loadReel();			
				setTimeout("$('.galleryItem').unbind('hover');", 250);

				
			},
			error: function(e) {
				console.log(e.message);
			} 

		});
	
		$("#header, #stream, #taskBar, .folderOptions, #leftSideMenu, .leftSideMenuControls").remove();
		$("#shareFullscreenReelName").show();
		$("#dashboard").css("margin-top","0px");
		$(".tabs").css("width","100%");
		$("#reelContents").css("width","101%").css("margin-left","-15px");	
		$(".galleryItem").unbind("hover");
		
	 }
	
	
	}
	
	self.share = function() {
		
		var objectGuid = this.objectGuid;
		
		$.fn.modal2({
			theme:      "credits",
			width:      650,
			height:     110,
			padding:    "10px",
			animation:  "none"
		})
		
		$(".modal1").show();	

		$.ajax({
			type: 'GET',
			url: "/adbeast/general/shareReel.html",
			async: false,
			
			success: function(data) {
				$(".wrapper1").html(data);
				$(".shareReelGUID").val("http://ab-newstaging.adbeast.com/?eRG=" + objectGuid + "#ui");
				
				$("#closeReelButton").click(function () {
					$(".modal1").remove();	
					$("#overlays").removeClass("dark").removeClass("creditsOverlays");
					
					
				});
			
			},
			error: function(e) {
				console.log(e.message);
			} 
		});
	
	}
	
	self.addYoutube = function() {
	
	
		var self = this;
		
		$.fn.modal2({
			theme:      "credits",
			width:      650,
			height:     194,
			padding:    "10px",
			animation:  "none"
		})
				
		$.ajax({
			type: 'GET',
			url: "/adbeast/reelfunctions/addyoutube.html",
			async: false,
			success: function(data) {
				$(".wrapper1").html(data);
				
				$(".modal-dialog").css("width","657px");
				
				$("#closeReelButton").click(function () {
					$(".modal1").remove();	
					$("#overlays").removeClass("dark").removeClass("creditsOverlays");
				});	
				
				var youtubeId = $(".youtubeId");
				youtubeId.focus();
				youtubeId.focusout(function() {
					
					if ($(".youtubeId").val() != "") {
						
						var youtubeId = $(".youtubeId").val();
						var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;    
							var match = youtubeId.match(regExp);    
							if (match&&match[7].length==11){        
							youtube = match[7];    
							
								$.ajax({
									type: 'GET',
									url: "https://www.googleapis.com/youtube/v3/videos?key=AIzaSyDhwx4ZLML32-4NIQbCT67BgxuSTVncOkM&part=snippet&id=" + youtube,
									async: false,
									jsonpCallback: 'callback',
									contentType: "application/json",
									dataType: 'json',
					
									success: function(data) {
										$(".youtubeTitle").val(data.items[0].snippet.title);
									}
								})
							
						}else{        
							console.log("incorrect format url");
						}				
	
						var youTubePreview = $("<iframe/>", {width:627, height:382, src:"http://www.youtube.com/embed/" + youtube})
						
						$( ".modal1" ).animate({
							height: 585,
							"margin-top" : "-290px"
	
						}, 50, "easeOutQuad", function() {
							$(".youtubePreview").append(youTubePreview);
						});
						
						$(".modal-dialog").css("top","6%");
					
					}
					
			});
				
			$("#addYoutubeToReelButton").click(function() {
				
			var youtubeId = $(".youtubeId").val();
					
			var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;    
				var match = youtubeId.match(regExp);    
				if (match&&match[7].length==11){        
				youtube = match[7];    
			}else{        
				console.log("incorrect format url");
			}				
				
			var youtubeId      = youtube;
			var title	       = $(".youtubeTitle").val();
				 
			$.ajax({
				type: 'GET',
				url: "/adbeast/reelfunctions/addyoutube.asp",
				async: false,
				data: {filename:youtubeId, title:title, eClr:"GQ", folderId: adbeast.loadObject.reelObj.reeloid, loadtype: adbeast.loadObject.loadType },
				success: function(data) {
					$(".modal1").remove();
					$("#overlays").removeClass();
					$(document).unbind("keyup");
					
					$.notification ({
						content:    title + ' (Youtube) successfully saved',
						border:     true,
						fill:       true,
						showTime:   true,
						icon:       'N',
						color:      'green',
						error:      false,
						timeout:    2000
					}) 
					adbeast.loadObject.loadReel();
					adbeast.general.initTaskbar();
				},
				error: function(e) {
					console.log(e.message);
				} 
					
			});
		});

			},
				error: function(e) {
				console.log(e.message);
			} 
		});
	}
	
	self.toggleView = function() {
		
		var theList = $(".theList").data("viewMode");
		
		if (theList == 1 || theList == "undefined") {
			$(".reelInfoDiv_2_list").removeClass("reelInfoDiv_2_list").addClass("reelInfoDiv_2");
			$(".removeSpot_list").removeClass("removeSpot_list").addClass("removeSpot");
			$(".mediaViewer_v2_list").removeClass("mediaViewer_v2_list").addClass("mediaViewer_v2");
			$(".PL_DisplayMode2_list").removeClass("PL_DisplayMode2_list").addClass("PL_DisplayMode2");
			$(".DisplayModeGradient_list").removeClass("DisplayModeGradient_list").addClass("DisplayModeGradient");
			$(".PL_Taskbar_list").removeClass("PL_Taskbar_list").addClass("PL_Taskbar");
			$(".galleryItem_list").removeClass("galleryItem_list").addClass("galleryItem");
			$(".galleryDirectory_list").removeClass("galleryDirectory_list").addClass("galleryDirectory");
			$(".galleryDirectoryRight_list").removeClass("galleryDirectoryRight_list").addClass("galleryDirectoryRight");
			$(".theList").data("viewMode",2);
			
		} else {
			$(".reelInfoDiv_2").removeClass("reelInfoDiv_2").addClass("reelInfoDiv_2_list");
			$(".removeSpot").removeClass("removeSpot").addClass("removeSpot_list");
			$(".mediaViewer_v2").removeClass("mediaViewer_v2").addClass("mediaViewer_v2_list");
			$(".PL_DisplayMode2").removeClass("PL_DisplayMode2").addClass("PL_DisplayMode2_list");
			$(".DisplayModeGradient").removeClass("DisplayModeGradient").addClass("DisplayModeGradient_list");
			$(".PL_Taskbar").removeClass("PL_Taskbar").addClass("PL_Taskbar_list");
			$(".galleryItem").removeClass("galleryItem").addClass("galleryItem_list");
			$(".galleryDirectory").removeClass("galleryDirectory").addClass("galleryDirectory_list");
			$(".galleryDirectoryRight").removeClass("galleryDirectoryRight").addClass("galleryDirectoryRight_list");
			$(".theList").data("viewMode",1);
		}
		
	}
	
	self.initTaskbar = function() {
		
		$("#folderOptionsAddItem").unbind().bind("click", function(e) {
	
			e.stopPropagation();
			
			$(".adbeast-context-list").hide();
			

		});
		
		$(".leftSideMenuAddNew").unbind().bind("click", function(e) {
			e.stopPropagation();
			
			$(".adbeast-context-list").hide();
			
			adbeast.saveObject.folderOrderObj   = "";
			adbeast.loadObject.reelObj.reeloid  = "";
			adbeast.saveObject.createReel()	
		});

		$(".leftSideMenuEdit").unbind().bind("click", function(e) {
			e.stopPropagation();
			
			adbeast.saveObject.renameReel();
		});

		
		$(".leftSideMenuRemove").unbind().bind("click", function(e) {
			
			e.stopPropagation();
			
			$(".adbeast-context-list").hide();
			
			$.confirm({
					text: "Are you sure you want to delete this workspace?",
					confirm: function(button) {
				
					adbeast.deleteObject.reelObj = adbeast.loadObject.reelObj;
					adbeast.deleteObject.deleteReel();
					adbeast.loadObject.loadReels();
					$(".modal1").remove();
				},
				
				cancel: function(button) {
					$(".modal1").remove();
				}
			});	
		
		});
				
		$(".leftSideMenuShare").unbind().bind("click", function(e) {
			
			$(".adbeast-context-list").hide();
			adbeast.general.objectGuid = adbeast.general.objectGuid;
			adbeast.general.share();
		});		
		
			
		$("#folderOptionsSave").unbind().bind("click", function() {
			$(".adbeast-context-list").hide();
			adbeast.saveObject.saveReel();
		});

		$("#folderOptionsAddItem").unbind().bind("click", function(e) {
			$.fn.modal2({
				theme:      "credits",
				width:      650,
				height:     585,
				padding:    "10px",
				animation:  "none"
			})

			$.ajax({
				type: 'GET',
				url: "/adbeast/general/embedModal.asp",
				async: false,
				data: { eClr: "GQ", oid: "-1" },
				success: function(data) {
					$(".wrapper1").html(data);
					$(".modal1").addClass("modal1Supplimental");
				},
				error: function(e) {
					console.log(e.message);
				}
			});

		});

		$(function(){
			$.contextMenu({
				selector: '#ui', 
				callback: function(key, options) {

					$("#ui").contextMenu("hide");		
					//alert(key)
					switch (key) {
						case "selectall":
							allSelected == 1 ? deSelectAllSpots() : selectAllSpots();
						break;

						case "deleteselected":
							adbeast.deleteObject.deleteFromReel();
						break;

						case "delete":
							adbeast.deleteObject.spotOID = -1;
						break;

						case "deletereel":
							$.confirm({
								text: "Are you sure you want to delete this folder?",
								confirm: function(button) {
						
									adbeast.deleteObject.reelObj = adbeast.loadObject.reelObj;
									adbeast.deleteObject.deleteReel();
									adbeast.loadObject.loadReels();
									$(".modal1").remove();
								},
				
								cancel: function(button) {
									$(".modal1").remove();
								}
							});	

						break;
						
						case "createsubfolder":
							adbeast.saveObject.createReel();
						break;

						case "savereel":
							adbeast.saveObject.saveReel();
						break;
						
						case "createrootfolder":
							adbeast.saveObject.folderOrderObj   = "";
							adbeast.loadObject.reelObj.reeloid  = "";
							adbeast.saveObject.createReel()
							
						break;
						
						case "addyoutube":
							adbeast.general.addYoutube();
						
						break;
						
						case "logout":
						
						$.get("/logout.asp", {i:1}, function(data){
							document.location.href = "/";
						});          
						
						break;

						case "upload":
						
							$.fn.modal1({
								theme:      "credits",
								width:      650,
								height:     585,
								padding:    "10px",
								animation:  "none"
							})
				
							var eClr = (currentModule == 1) ? "GQ" : "GVM";
							
							$.ajax({
								type: 'GET',
								url: "/adbeast/general/embedModal.asp",
								async: false,
								data: { eClr: eClr, oid: "-1" },
								success: function(data) {
									$(".wrapper").html(data);
								},
								error: function(e) {
									console.log(e.message);
								} 
							});
						break;
						
						case "share":
							adbeast.general.objectGuid = adbeast.general.objectGuid;
							adbeast.general.share();
						break;
						
						case "sendtoemail":
							adbeast.email.objectName = $(".reelName").val();
							adbeast.email.sendEmail();
						break;
						
					}
					
				},
		
			items: {
				
				"upload": {	"name": "Upload", icon: "add" },
			
				"savereel": {name: "Save Reel", icon: "save"},
			
				"share": {
					"name": "Share", icon: "send" ,
					"items": {
						"share": {"name": "Share"},
						"sendtoemail": {"name": "Send To Email Recipient"}
					}
				},
			
				"createfolder": {
					"name": "Create Folder", 
					"items": {
						"createsubfolder": {"name": "New Sub Folder Here"},
						"createrootfolder": {"name": "New Root Folder"}
					}
				},
				
				"addyoutube": {name: "Add Youtube Media"},
            
					"delete": {
						"name": "Delete", icon: "delete",
						"items": {
							"deleteselected": {name: "Delete Selected Items"},            
							"deletereel": {name: "Delete This Folder"},            
						}
					},
			
					"selectall": {name: "Select All"},
					"sep1": "---------",
					"logout": {name: "Logout", icon: "Logout"}
				}
			});
		
			$('.context-menu-list').on('click', function(e){
	    
				$("#context-menu-layer, .context-menu-list").hide();
				$("#ui").contextMenu("hide");
				
				$("#context-menu-layer").show();
		
			})
		});
			
		$(".galleryItem").hover(function() {
			$(this).find(".icons").show();
		}, function() {
			$(this).find(".icons").hide();
		});
			 
		$("#toggleViewButton").unbind().click(function() {
			$(".adbeast-context-list").hide();
			adbeast.general.toggleView();
		});
		
	}
	
	self.loadModal = function() {
	
		$(".modal").remove();
		
		var plainModal = this.plainModal;
		
		if (plainModal != true) {
		
			playList    = this.playList;
			playListPos = this.playListPos;
			oid         = playList.oid[playListPos];		
			object_type = playList.object_type[playListPos];
		
		} else {
			oid = this.oid;
		}
		
		$.fn.modal1({
			theme:      "dark",
			width:      720,
			height:     421,
			url:        "adbeast/general/embedModal.asp?oid=" + oid,
			padding:    "0px",
			animation:  "none"
		})
		
		$(".wrapper").css("background","#000").css("text-align","center");
		
		if (plainModal != true) {
		
		try {
	
		var rightArrow = $("<img/>", { src:"/images/arrow_white.png", class:"modalRightArrow" }).click(function() {
			if (playListPos + 1 != playList.oid.length) { 
				adbeast.general.playListPos ++;
				adbeast.general.loadModal();
				if (playList.object_type[playListPos] == 3 || playList.object_type[playListPos] == 8 ) {
					$(".modal").addClass("modal_fullscreen");
					$(".modalCloseButton").removeClass("modalCloseButton").addClass("modalCloseButton_fullscreen");
					$(".modalLeftArrow").removeClass("modalLeftArrow").addClass("modalLeftArrow_fullscreen");
					$(".modalRightArrow").removeClass("modalRightArrow").addClass("modalRightArrow_fullscreen");
					$(".titleDiv").removeClass("titleDiv").addClass("titleDiv_fullscreen");
				}
			}
		});
		
		var leftArrow  = $("<img/>", { src:"/images/arrow_white.png", class:"modalLeftArrow" }).click(function() {
			if (playListPos != 0) { 
				adbeast.general.playListPos --;
				adbeast.general.loadModal();
				if (playList.object_type[playListPos] == 3 || playList.object_type[playListPos] == 8 ) {
					$(".modal").addClass("modal_fullscreen");
					$(".modalCloseButton").removeClass("modalCloseButton").addClass("modalCloseButton_fullscreen");
					$(".modalLeftArrow").removeClass("modalLeftArrow").addClass("modalLeftArrow_fullscreen");
					$(".modalRightArrow").removeClass("modalRightArrow").addClass("modalRightArrow_fullscreen");
					$(".titleDiv").removeClass("titleDiv").addClass("titleDiv_fullscreen");
				}
			}
		});
		
		var minimizeButton  = $("<img/>", { src:"/images/minimize-icon-white.png", class:"modalMinimizeButton" }).click(function() {
			$(".modal, .wrapper").css("visibility", "hidden");
			$(".wrapper").css("opacity", "0"); //Safari Bug
			$("#overlays").removeClass("dark");
			
			//Movie Player
			$("#ex3").attr("height", "91").attr("width","144")
			$(".modal").addClass("modalMinified").removeClass("modal");
			$(".wrapper").addClass("wrapperMinified").removeClass("wrapper");
			$("#overlays").addClass("overlaysMinified").removeClass("dark");
			$(".overlaysMinified").find("img").hide();
			$(".overlaysMinified").find(".titleDiv").hide();
			
			
			
			$.notification ({
				content:    'Now playing: ' + playList.objectname[playListPos],
				border:     true,
				fill:       true,
				showTime:   true,
				icon:       'N',
				color:      'black',
				error:      false,
				click:      function() {
					
					$(".modal, .wrapper").css("visibility", "visible");
					$(".wrapper").css("opacity", "100"); //Safari Bug
					$(".notification").remove();
					$("#overlays").addClass("dark");
					
					//Movie Player
					$("#ex3").attr("height", "420").attr("width","720")
					$(".modalMinified").removeClass("modalMinified").addClass("modal");
					$(".wrapperMinified").removeClass("wrapperMinified").addClass("wrapper");
					$("#overlays").removeClass("overlaysMinified").addClass("dark");
					$(".modal").find("img").show();
					$(".modal").find(".titleDiv").show();
					
				}
			})

			$(".notification").addClass("notificationMinified");
			$(".left").addClass("leftMinified");
			$(".right").addClass("rightMinified");
			
		});
		
		var closeButton  = $("<img/>", { src:"/images/close-icon-white.png", class:"modalCloseButton" }).click(function() {
			$(".modal").remove();
			$("#overlays").removeClass();
			$(document).unbind("keyup");
		});
		
		var titleDiv  = $("<div/>", { class:"titleDiv" }).click(function() {
		}).html(playList.objectname[playListPos] + " (Pos) " + (playListPos + 1) + "/" + playList.oid.length);

		$(".modal").append(rightArrow).append(leftArrow).append(minimizeButton).append(closeButton).append(titleDiv);
		
		} catch(e) {
		
			var closeButton  = $("<img/>", { src:"/images/close-icon-white.png", class:"modalCloseButton" }).click(function() {
				adbeast.projectRoom.getProjectBinItems();
			});
			
			$(".modal").append(closeButton);
			
			//console.log("Request from Edit Project Room");
		}
	
	}
	}
	
	self.loadCredits = function() {
		
		var oid = this.oid;

		if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {		
		
		} else {
			$.fn.modal2({
				theme:      "credits",
				width:      720,
				height:     421,
				//url:        "adbeast/general/embedModal.asp?oid=" + oid,
				padding:    "0px",
				animation:  "none"
			})

			$(".wrapper1").css("text-align","center");
		}
		
		$.ajax({
			type: 'GET',
			url: "/adbeast/general/getCredits.asp",
			async: false,
			jsonpCallback: 'callback',
			contentType: "application/json",
			dataType: 'json',
			data: {oid:oid },
			success: function(data) {
				
				$(".modal1").addClass("modal1Supplimental");
				
				var creditsWrapper = ($("<div/>", {class:"creditsWrapper"}));
				
				var saveButton = $("<button/>", {class:"cancel btn btn-default"}).text("Save").unbind("click").bind("click",function() {
				
					$.ajax({
						type: 'GET',
						url: "/adbeast/general/saveCredits.asp",
						async: false,
						jsonpCallback: 'callback',
						contentType: "application/json",
						dataType: 'json',
						data: {oid:oid, extracredit:$("#credits_Extra").val(), objectname:$("#credits_spotName").val()},
						success: function(data) {
							$(".modal").remove();
							$("#overlays").removeClass();
							$(document).unbind("keyup");
						
							$.notification ({
								content:    'Information Updated.',
								border:     true,
								fill:       true,
								showTime:   true,
								icon:       'N',
								color:      'green',
								error:      false,
								timeout:    2000
							}) 
									
							adbeast.loadObject.loadReel();
							adbeast.general.initTaskbar();
						},
						error: function(e) {
								console.log(e.message);
						} 
					});
					
					//alert("save credits")
				});
				
				var saveButtonWrapper = ($("<div/>", {class:"saveButtonWrapper"})).append(saveButton);
				
				creditsWrapper.append(saveButtonWrapper);
				
				$.each(data, function() {
					$.each(this, function(k, v) {	
						var spotName      = $("<div/>", {class:"creditLabel", for:"credits_spotName", html:"Spot Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"}).after($("<input/>", {id:"credits_spotName", val:this.spotname, class: "infobox glyph settings creditsInput"}));
						var dateUploaded  = $("<div/>", {class:"creditLabel", for:"credits_DateUploaded", html:"Date Uploaded "}).after($("<input/>", {id:"credits_DateUploaded", val:this.dateuploaded, readonly:true, class: "infobox glyph settings creditsInput"}));											
						var extraCredits  = $("<div/>", {class:"creditLabel", for:"credits_Extra", html:"Extra Credits "}).after($("<textarea/>", {id:"credits_Extra", text:this.catalogue_extrainfo, class: "infobox glyph settings creditsTextBox"}));											
							
						if (this.adbeast_spottype == 25) {
							var objectLink    = $("<div/>", {class:"creditLabel", for:"credits_Link", html:"Link"}).after($("<input/>", {id:"credits_Link", val:"http://www.youtube.com/watch?v=" + this.object_link, class: "infobox glyph settings creditsInput"})).after("<div class='youTubeLink'><a href='http://www.youtube.com/watch?v=" + this.object_link +"' target='_blank'><img src='/images/external_link.png'></a></div>").click(function(e) {
								e.stopImmediatePropagation();							
							});
							
							var fileType      = $("<div/>", {class:"creditLabel", for:"credits_fileType", html:"File Type"}).after($("<input/>", {id:"credits_fileType", val:"Youtube", class: "infobox glyph settings creditsInput", readonly:true}));											
						} else {
							var objectLink    = $("<div/>", {class:"creditLabel", for:"credits_Link", html:"Link"}).after($("<input/>", {id:"credits_Link", val:this.object_link, class: "infobox glyph settings creditsInput", readonly:true}));
							var fileType      = $("<div/>", {class:"creditLabel", for:"credits_fileType", html:"File Type"}).after($("<input/>", {id:"credits_fileType", val:"Spot/Image", class: "infobox glyph settings creditsInput", readonly:true}));											
						}
						
						creditsWrapper.append(spotName).append(objectLink).append(dateUploaded).append(fileType).append(extraCredits);
					})
				})
			
			if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {		
				$("#reelContents").prepend(creditsWrapper);
			} else {
				$(".wrapper1").append(creditsWrapper);	
			}
			
			
			},
			error: function(e) {
				console.log(e.message);
			} 
		});
		
	}
		
return self;
		
}());

adbeast.search      = (function() {

	var self = {};
	
	var searchTerm;
		
	self.search = function() {
	
		$(".workArea").hide();
		$(".theList").remove();
		$("#taskBar").hide();
		
		$.ajax({
				type: 'GET',
				url: "/adbeast/searchFunctions/getSearch.asp",
				async: false,
				jsonpCallback: 'callback',
				contentType: "application/json",
				dataType: 'json',
				data: {searchTerm:$(".searchField").val() },
				success: function(data) {
				    
					adbeast.loadObject.module == 2 ? $(".chosen-results").find("li[value='addYoutube']").hide() : $(".chosen-results").find("li[value='addYoutube']").show();
							
				$(".workArea").hide();
				$("#taskBar").show();
				
				// Taskbar functions
				$(".chosen-results").eq(1).find("li[value='addYoutube']").unbind().click(function() {
					var general    = adbeast.general;
					var loadObject = adbeast.loadObject;
					
					general.folderName = $(".reelName").val();;
					general.reelObj = loadObject.reelObj;
					general.addYoutube();
				});
				
				$(".chosen-results").eq(1).find("li[value='createReel']").unbind().click(function() {
					adbeast.saveObject.createReel();
				});

				$(".chosen-results").eq(1).find("li[value='sendReel']").unbind("click").click(function() {
				
					adbeast.email.objectGuid = adbeast.loadObject.reelObj.reelguid;
					adbeast.email.objectName = $(".reelName").val();
					adbeast.email.sendEmail();
				});
				var reelContents = $("#reelContents");
				var theList = $(".theList");
				reelContents.show();
				theList.remove();
				reelContents.append($("<ul/>", {class:"theList"}))

				$(".reelName").val("Search Results");
			  
				$.each(data, function() {
					$.each(this, function(k, v) {
							
							var img = new Image();
							
							adbeast.loadObject.module == 1 ? img.src = this.thumbnailimage : img.src = this.im_mediumimage;
							
							var searchResult   = $("<li/>", {class:"galleryItem"});
							
							if (this.object_type != 2 && this.object_type != 10) {
								
								if (this.object_type == 25) {
									 img.src = "http://img.youtube.com/vi/" + this.object_link + "/0.jpg";
								
								} else if (this.object_type == 8) {
								 
								 img.src = "/images/documents.png";
								 img.width = "50";
								
								} else {
									 if (adbeast.loadObject.module == 1) {
										img.src = this.thumbnailimage;
									 } else {
										img.src = this.im_mediumimage;
									 }
								}
								
								var reelInfoDiv_2  = $("<div/>", {spotoid: this.oid, reeloid: this.oid, type:"root", id:"PL_" + k, class:"reelInfoDiv_2"});
							
							} else {
							
								img.onload = function() {
								
									if ($(this).height == 0) {
										img.src = "images/icons/icon_file.gif";
									}
									
								};
															
								var reelInfoDiv_2  = $("<div/>", {spotoid: this.oid, reeloid: this.oid, type:"root", id:"PL_" + k, class:"reelInfoDiv_2"}).data("reelObj", this).unbind().click(function() {
									var general = adbeast.general;
									general.oid = $(this).data("reelObj").oid;
									general.plainModal = true;
									general.loadModal();
								});
							}
							
							var removeSpot     = $("<div/>", {class: "icons removeSpot"}).css("display","none").append(
								$("<a/>", {href: "javascript: removeSpotFromPlaylist(" + k +");"}).html("X")
							).unbind("click").bind("click",function(e) {
								e.stopImmediatePropagation();
							});
							
							var checkSpot      = $("<div/>", {class: "icons checkSpot"}).css("display","none").append(
								$("<a/>", {href: "javascript: checkSpotInPlaylist(" + k +");"}).html("&nbsp;&nbsp;")
							).unbind("click").bind("click",function(e) {
								e.stopImmediatePropagation();
							});
							
							var mediaViewer_v2 = $("<div/>", {class: "mediaViewer_v2"}).data("reelObj", this).css("background-color","#202020").unbind().click(function() { 
								var general = adbeast.general;
								general.oid = $(this).data("reelObj").oid;
								general.plainModal = true;
								general.loadModal();
								
								}).append($("<div/>", {style:"width: 100%; height: 100%", class: "DisplayModePlayButton"})).append(
								$("<img/>", {src:img.src})
							);
							
							PL_Taskbar = ($("<div/>", {class:"PL_Taskbar"}).append($("<img/>", {class:"PL_Download", src:"images/download.jpg"}).data("reelObj", this).click(function(e) {
								e.preventDefault();  //stop the browser from following
								window.location.href = '/adbeast/general/download.asp?oid=' + $(this).data("reelObj").oid;
								
							})).append($("<img/>", {class:"PL_MetaData", src:"images/metadata.png"}).data("reelObj", this).click(function(e) {
								adbeast.general.oid = $(this).data("reelObj").oid;
								adbeast.general.loadCredits();
							
							})));

							this.object_type == 25 ? PL_Taskbar.find(".PL_Download").remove() : $(".PL_Download").show();
							
							
							
							var PL_DisplayMode2 = $("<div/>", {class:"PL_DisplayMode2", id:"spotName"}).append(
								$("<div/>", {class:"PL_DisplayMode2", id:"spotName"}).html(this.objectname.substring(0,70))
							).after(PL_Taskbar);
							
							PL_DisplayMode2.append($("<div/>", {style:"width: 100%; height: 100%", class: "DisplayModeGradient"}));

							$("#spotName").after(PL_Taskbar);
							
							reelInfoDiv_2.append(removeSpot).append(checkSpot).append(mediaViewer_v2).append(PL_DisplayMode2);
							
							var resultHtml = searchResult.append(reelInfoDiv_2);
							var theList = $(".theList");
							theList.append(resultHtml);
							
						})
						
						$(".DisplayModePlayButton").append($("<img/>", {src:"images/play-button-overlay.png"}));
				})
			  
				$(".galleryItem").hover(function() {
					$(this).find(".icons").show();
				}, function() {
					$(this).find(".icons").hide();
				});
			    
				$("#saveReel, #viewReel, #upload, .actionContainer").hide();
			  
			    $(".chosen-results").eq(1).find("li[value='deleteReel']").unbind().click(function() {
			  
				$.confirm({
					text: "Are you sure you want to delete this?",
					confirm: function(button) {
						
						adbeast.deleteObject.reelObj = adbeast.loadObject.reelObj;
						adbeast.deleteObject.deleteReel();
						adbeast.loadObject.loadReels();
						$(".modal1").remove();
					},
					cancel: function(button) {
						$(".modal1").remove();
					}
				});
				
			  });

			  $("#upload").click(function() {

			  $.fn.modal2({
					theme:      "credits",
					width:      650,
					height:     585,
					padding:    "10px",
					animation:  "none"
				})
				
				var eClr = (currentModule == 1) ? "GQ" : "GVM";
				
				$.ajax({
					type: 'GET',
					url: "/adbeast/general/embedModal.asp",
					async: false,
					data: { eClr: eClr, oid: "-1" },
					success: function(data) {
						$(".wrapper1").html(data);
						
					},
					error: function(e) {
						console.log(e.message);
					} 
				});
				
			  });
			    			 			  
			  $(".theList").sortable({ 

			     opacity:           0.9, 
				 helper:            "clone",
			     revert:            15,
				 cursor:            "move",
				 
                 start: function(e, ui)
                 {
                    $(ui.helper).css("z-index", "1000000");
					
					var a = navigator.userAgent;
		
					if ((a.indexOf("Chrome") > 0 || a.indexOf("Safari") > 0 ) && a.indexOf("Mac") > 0) {
						$(ui.helper).css("margin-top", $(window).scrollTop());
					}

                 },
				 
			     stop: function(e, ui)
                 {
                    $(ui.helper).css("z-index", "1");
					
					adbeast.saveObject.oidTarget = ".reelInfoDiv_2";
					adbeast.saveObject.reelObj  = adbeast.loadObject.reelObj;
					
					adbeast.refreshObject.refreshGallery();
					
                 }
              });

			},
				
			error: function(e) {
				console.log(e.message);
			}	 
		});
	
	}
	
return self;
		
}());

jQuery( document ).ready(function( $ ) {

   adbeast.initialize.initialize();



   // SEARCH
	$(".searchField").keydown(function(e) {
	   if (e.keyCode == 13) {
			adbeast.search.search();
	   }
	});
	
	//  UPLOADER

   $(".launchUpload a").click(function() {
   
	  $(".workArea").hide();
	  $(".folderOptions").hide();
	  $("#leftSideMenu").hide();
	  $("#more").hide(); 
	  
	  document.location.href = "#ui";
      $("#adbeastUploader").html("<iframe width='100%' height='100%' style='border: 0px' src='adbeast/filexfer/upload/upload.asp?eClr=GQ&eC=H1URFFk&eRID='></iframe>").show();
	  
	  var uploadSpots = $("<li/>", { "class": "uploadSpots", "id": "reelManager"}).html("<a>Upload Spots</a>");
	  
	  $("#leftSideMenu").html("").append(uploadSpots).show();
   });
   
	$(".launchMessages a").click(function() {
		adbeast.email.msgLoadType = 2;
		adbeast.email.messageCenter();
		$("#more").hide(); 
    });
   
   });

   
   // ADBEAST SPECIFIC FUNCTIONS

   	function removeSpotFromPlaylist(lngCount) {
		$("#PL_" + lngCount).parent().remove();
	}
	
	function checkSpotInPlaylist(lngCount) {

		var theHTML = $("#PL_" + lngCount).find(".checkSpot a").html();
		
		if ( theHTML == "&nbsp;&nbsp;") {
			$("#PL_" + lngCount).find(".checkSpot a").html("=");
			$("#PL_" + lngCount).find(".checkSpot a").addClass("selected");
			$("#PL_" + lngCount).find(".checkSpot").css("display","block");
			$("#PL_" + lngCount).find(".removeSpot").css("display","none");
			$("#PL_" + lngCount).parent().unbind("hover");
			
			noSelected ++;
			
		} else {
			$("#PL_" + lngCount).find(".checkSpot a").html("&nbsp;&nbsp;");
			$("#PL_" + lngCount).find(".checkSpot a").removeClass("selected");
			$("#PL_" + lngCount).find(".checkSpot").hide();
			
			$("#PL_" + lngCount).parent().hover(function() {
				$(this).find(".icons").show();
			}, function() {
			    $(this).find(".icons").hide();
			});
			
			noSelected --;
		}
		
	}
   
   
   function deSelectAllSpots() {
   
    var targetClass;
	
	$(".reelInfoDiv_2").length == 0 ? targetClass = ".reelInfoDiv_2_list" : targetClass = ".reelInfoDiv_2";
   
	$(targetClass).each(function() {
  
		var theHTML = $(this).find(".checkSpot a").html();
			
				$(this).find(".checkSpot a").html("&nbsp;&nbsp;");
				$(this).find(".checkSpot a").removeClass("selected")
				$(this).find(".checkSpot").hide();
				
				$(this).parent().hover(function() {
					$(this).find(".icons").show();
				}, function() {
					$(this).find(".icons").hide();
				});
			
			noSelected --;
			allSelected = 0;
		});
  
	}
   
   function selectAllSpots() {
   
    var targetClass;
	
	$(".reelInfoDiv_2").length == 0 ? targetClass = ".reelInfoDiv_2_list" : targetClass = ".reelInfoDiv_2";
   
	$(targetClass).each(function() {
  
		var theHTML = $(this).find(".checkSpot a").html();
		
			
		$(this).find(".checkSpot a").html("=");
		$(this).find(".checkSpot a").addClass("selected")
		$(this).find(".checkSpot").css("display","block");
		$(this).find(".removeSpot").css("display","none");
		$(this).parent().unbind("hover");
				
		noSelected ++;
		allSelected = 1;
		
	});
  
	}
	
	function addSpotsToReel(arrSpotList, reelOid, lngCID) {

		$.ajax({
			type: 'GET',
			url: "/adbeast/reelFunctions/appendToReel.asp",
			async: false,
			jsonpCallback: 'callback',
			contentType: "application/json",
			dataType: 'json',
			data: {spotList: JSON.stringify(arrSpotList), reelOid: reelOid, module:adbeast.loadObject.module, lngCID:lngCID},
			success: function(data) {
				$.notification ({
					content:    'Selected spots copied',
					border:     true,
					fill:       true,
					showTime:   true,
					icon:       'N',
					color:      'green',
					error:      false,
					timeout:    2000
				}) 
						
				//LoadReel(reelObj)
			},
			error: function(e) {
					console.log(e.message);
			} 
		});

	}
