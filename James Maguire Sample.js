adbeast.projectRoom    = (function() {
	
	var self = {};
	var cid;
	var rid;
	var oid;
	var fid;
	
	self.saveProjectDetails = function() {

		var messageBoard;
		var commenting;
		
		$(".checkbox").eq(0).hasClass("checked") ? messageBoard = 1 : messageBoard = 0;
		$(".checkbox").eq(1).hasClass("checked") ? commenting = 1 : commenting = 0;
		// But messageboard in the UI
		
		var data = {
			rid: this.rid,
			cid: this.cid,
			roomname: $("#roomName").val(),
			administrator: $("#administrator").val(),
			availableTo: $("#date3").val(),
			date: $("#date1").val(),
			username: $("#roomUsername").val(),
			password: $("#roomPassword").val(),
			oldusername: $("#oldUsername").val(),
			messageboard: $("#messageboard").val(),
			commenting: commenting,
			projectnumber: $("#projectNumber").val(),
			comments: $(".roomComments").val()
		}
	
		$.ajax({
			type: 'GET',
			url: "/adbeast/binFunctions/saveProjectDetails.asp",
			async: false,
			data: data,
			jsonpCallback: 'callback',
			contentType: "application/json",
			dataType: 'json',
			success: function(data) {

				$.each(data, function() {
					$.each(this, function(k, v) {
						if (this.status == "false") {
						
							$.notification ({
								content:    'Error Occurred: ' + this.err,
								border:     true,
								fill:       true,
								showTime:   true,
								icon:       'N',
								color:      'green',
								error:      true,
							}) 
							
							if (this.err == 2024) {
								$("#date3").css("border-color","red");
							};
							
							if (this.err == 2025) {
								$("#date1").css("border-color","red");
							};
							
							if (this.err == 2013) {
								$("#username").css("border-color","red");
							};
				
						} else {
						
							$.notification ({
								content:    'Successfully Updated',
								border:     true,
								fill:       true,
								showTime:   true,
								icon:       'N',
								timeout:    2000,
								color:      'green',
								error:      false,
							})
						}
					})
				})
				
			},
					
			error: function(e) {
				console.log(e.message);
			} 
		});

	}	
	
	self.addUser = function() {
	
		var cid    = adbeast.projectRoom.cid;
		var userid = $(".chosen-container").find(".result-selected:visible").attr("data-value");
		var rid    = adbeast.projectRoom.rid;
		
		$(".currentUsers").remove()
		
		$.ajax({
			type: 'GET',
			url: "/adbeast/binFunctions/addUser.asp",
			async: false,
			jsonpCallback: 'callback',
			contentType: "application/json",
			dataType: 'json',
			data: {cid:cid, rid:rid, userid:userid},
			success: function(data) {
			
			$.each(data, function() {
					$.each(this, function(k, v) {
						if (this.status == "false") {
						
							$.notification ({
								content:    'User has already been added to this Project Room',
								border:     true,
								fill:       true,
								showTime:   true,
								icon:       'N',
								color:      'green',
								error:      true,
							}) 
			
						} else if (this.status == "ok") {

							$.notification ({
								content:    'User has been assigned to this Project Room. ',
								border:     true,
								fill:       true,
								showTime:   true,
								icon:       'N',
								color:      'green',
								error:      false,
								timeout:    3000
							}) 

						}
							adbeast.projectRoom.populateCurrentUsers();						
					})
				})
			
			},
				
				error: function(e) {
				console.log(e.message);
			} 
		});
	
	}
	
	self.populateCurrentUsers = function() {
	
		cid = adbeast.projectRoom.cid;
		rid = adbeast.projectRoom.rid;
		
		$.ajax({
			type: 'GET',
			url: "/adbeast/binFunctions/getCurrentUsers.asp",
			async: false,
			jsonpCallback: 'callback',
			contentType: "application/json",
			dataType: 'json',
			data: {cid:cid, rid:rid},
			success: function(data) {
							
				var wrapper			   = $("#editProjects");
				var currentUsers       = $("<div/>",{class:"currentUsers"});
				var users    		   = $("<ul/>",{class:"users"});
				
				$.each(data, function() {
					$.each(this, function(k, v) {
									
						users.append($("<div/>", {class:"projectRoomUsers projectRoomItemListView", value:this.userid}).text(this.fname + " " + this.lname	));
					})
				})
				
				var usersWrapper = $("<div/>", {style:"text-align: left;"}).html("<div style=''>Current Assigned Users</div>");
					
				usersWrapper.append(users)
				
				currentUsers.append(usersWrapper);
				wrapper.append(currentUsers);
									
			},
				
				error: function(e) {
				console.log(e.message);
			} 
		});
	
	}
	
	self.getProjectDetails = function() {
		
		cid = this.cid;
		rid = this.rid;
		
		$.ajax({
				type: 'GET',
				url: "/adbeast/binFunctions/getProjectDetails.asp",
				async: false,
				jsonpCallback: 'callback',
				contentType: "application/json",
				dataType: 'json',
				data: {cid:cid, rid:rid},
				
				success: function(data) {
					
					var projectRoom = adbeast.projectRoom;
					var general     = adbeast.general;
				
					var projectDetailsNavWrapper = $("<div/>", {class:"projectDetailsNavWrapper"}).html(
						$("<button/>").html("Go To Bin").click(function(){
							general.folderName = $("#roomName").val();
							projectRoom.getProjectBinItems();
						})
							
					).append(
						$("<button/>").html("Save").click(function(){
							projectRoom.saveProjectDetails();
						})
					);
												
					var roomName              = $("<input/>", {class:"editProjectRoomInput", type:"text", id:"roomName"}).attr("value", data.data[0].roomname);
					var dateCreated           = $("<input/>", {class:"editProjectRoomInput", type:"text", id:"date1"}).attr("value", data.data[0].datee);
					var lastUpdated           = $("<input/>", {class:"editProjectRoomInput", type:"text", id:"date2"}).attr("value", data.data[0].lastupdate);
					var administrator         = $("<input/>", {class:"editProjectRoomInput", type:"text", id:"administrator"}).attr("value", data.data[0].administrator);
					var availableTo           = $("<input/>", {class:"editProjectRoomInput", type:"text", id:"date3"}).attr("value", data.data[0].availableto);
					var projectNumber         = $("<input/>", {class:"editProjectRoomInput", type:"text", id:"projectNumber"}).attr("value", data.data[0].projectnumber);
	
					var roomUsername          = $("<input/>", {class:"editProjectRoomInput", type:"text", id:"roomUsername"}).attr("value", data.data[0].username.substring(1,30));
					var roomPassword          = $("<input/>", {class:"editProjectRoomInput", type:"text", id:"roomPassword"}).attr("value", data.data[0].password);

					var oldUsername           = $("<input/>", {class:"editProjectRoomInput", type:"text", id:"oldUsername", style:"display: none;"}).attr("value", data.data[0].username.substring(1,30));

					roomUsername.append(oldUsername);

					var isContentDownloadable = $("<input/>", {type:"checkbox", name:"isContentDownloadable", id:"isContentDownloadable"});
					var hasObjectCommenting   = $("<input/>", {type:"checkbox", name:"hasObjectCommenting", id:"hasObjectCommenting"});
					
					var roomComments          = $("<textarea/>", {class:"roomComments"}).html(data.data[0].comments);
					
					var wrapper = $("#editProjects");
					
					wrapper.html("").append(projectDetailsNavWrapper).append($("<div/>", {class: "editProjectRoomLabel"}).html("Room Name")).append(roomName).append($("<div/>", {class: "editProjectRoomLabel"}).html("Date Created")).append(dateCreated).append($("<div/>", {class: "editProjectRoomLabel"}).html("Username")).append(roomUsername).append($("<div/>", {class: "editProjectRoomLabel"}).html("Password")).append(roomPassword).append($("<div/>", {class: "editProjectRoomLabel"}).html("Last Updated")).append(lastUpdated).append($("<div/>", {class: "editProjectRoomLabel"}).html("Administrator")).append(administrator).append($("<div/>", {class: "editProjectRoomLabel"}).html("Available To")).append(availableTo).append($("<div/>", {class: "editProjectRoomLabel"}).html("Ref. Number")).append(projectNumber).append($("<div/>", {class: "editProjectRoomLabel", style:"clear: both;"}).html("Is Room Content Downloadble")).append(isContentDownloadable).append($("<div/>", {class: "editProjectRoomLabel"}).html("Object Commenting Enabled")).append(hasObjectCommenting).append(hasObjectCommenting).append($("<div/>", {class: "editProjectRoomLabel"}).html("Room Comments")).append(roomComments).css("padding-top","50px");
					
					$.ajax({
						type: 'GET',
						url: "/adbeast/general/getCompanyUsers.asp",
						async: false,
						jsonpCallback: 'callback',
						contentType: "application/json",
						dataType: 'json',
						success: function(data) {
								
							var wrapper			   = $("#editProjects");
							var companyUsersSelect = $("<select/>",{class:"companyUsersSelect"}).append($("<option/>").text("Select User"));
							var userToSelect       = $(".addUsers");
							var sendObject         = $(".sendObject");
							
							$.each(data, function() {
								$.each(this, function(k, v) {
									
									companyUsersSelect.append($("<option/>", {value:this.userid}).text(this.fname + " " + this.lname));
								})
							})
							
							var addUserButton        = $("<button/>", {class:"addUserToProjectRoom"}).text("Add User").unbind("click").bind("click", function() {
								projectRoom.addUser();
							});
						
						var companyUsers = ($("<div/>", {style:"width: 200px"}).append(companyUsersSelect))
						
						wrapper.append($("<div/>", {class: "editProjectRoomLabel"}).html("User List")).append(companyUsers).append(addUserButton);
						
						$('.companyUsersSelect').chosen();
						$(".chosen-container").css("width","200px");
						$(".chosen-container").show();
							
							adbeast.projectRoom.populateCurrentUsers();
							
						},
						
						error: function(e) {
							console.log(e.message);
						} 
					});
					
					$('.modal span').on('click', function(e) {
						e.stopImmediatePropagation();
					});
					
					$("#isContentDownloadable").checkbox();
					$("#hasObjectCommenting").checkbox();

					$('#isContentDownloadable').click(function(event) {
						event.stopPropagation();
						event.cancelBubble = true;
					})


					$('#hasObjectCommenting').click(function(event) {
						event.stopPropagation();
						event.cancelBubble = true;
					})

					$('.checkbox span.toggle').click(function(event) {
						event.stopPropagation();
						event.cancelBubble = true;
					})
 
					$(".checkbox input").change(function () {
						$(this).parents("span").toggleClass("checked");
					});

					$(".checkbox").css("margin-right","20px");
					
					$( "#date1" ).date();
					$( "#date2" ).date();
					$( "#date3" ).date();
 
 					data.data[0].iscontentdownloadable ==  "Y" ? $(".checkbox").eq(0).addClass("checked") : $(".checkbox").eq(0).removeClass("checked");
					
					data.data[0].hasobjectcommenting == "1" ? $(".checkbox").eq(1).addClass("checked") : $(".checkbox").eq(1).removeClass("checked");

					
				},
					error: function(e) {
				    console.log(e.message);
			    } 
		});

	}
	
	self.getProjectBinItems = function() {
		
		cid = adbeast.projectRoom.cid;
		rid = adbeast.projectRoom.rid;
		
		$.ajax({
			type: 'GET',
			url: "/adbeast/binFunctions/getProjectBinItems.asp",
			async: true,
			jsonpCallback: 'callback',
			contentType: "application/json",
			dataType: 'json',
			data: {cid:cid, rid:rid},
			
			success: function(data) {
				
				var wrapper = $("#editProjects");
				
				wrapper.html("").wrap($("<div/>", {class:"editProjectBinWrapper"})).css("padding-top","0px");
				
				var uploadButton = $("<button/>", {class:"lightgrey adbeastButton"}).html("Upload to Bin").click(function(){
						
					$.fn.modal({
						theme:      "light",
						width:      650,
						height:     585,
						padding:    "10px",
						animation:  "none"
					})
						
					$.ajax({
						type: 'GET',
						url: "/adbeast/general/embedModal.asp",
						async: false,
						data: { eClr: "HQ", oid: "-1", rid:rid },
						success: function(data) {
							$(".wrapper").html(data);
						},
						error: function(e) {
							console.log(e.message);
						} 
					});
						
				});
				
				var backToDetailsButton = $("<button/>", {class:"lightgrey adbeastButton"}).html("Back to Project Details").click(function(){
					adbeast.projectRoom.getProjectDetails();
				});
					
				var menuOptionsWrapper = $("<div/>", {class:"menuOptionsWrapper"});
					
				var menuOptions = $("<select/>").append($("<option/>").text("Options")).append($("<option/>", {value:"addUrl"}).text("Add URL")).append($("<option/>", {value:"addYoutube"}).text("Add Youtube")).append($("<option/>", {value:"addFolder"}).text("Create Folder"));
					
				menuOptionsWrapper.append(menuOptions);
					
				var contentTitle = $("<div/>", {class:"dialogBoxTitle"}).html("Edit Bin Content");
				
				wrapper.append(backToDetailsButton).append(uploadButton).append(menuOptionsWrapper);
				
				$('select').chosen();
					
				$(".chosen-results").eq(2).find("li[value='addFolder']").unbind("click").click(function() {
					adbeast.projectRoom.createFolder();
				});
					
				$(".chosen-results").eq(2).find("li[value='addYoutube']").unbind("click").click(function() {
					adbeast.general.addYoutube();
				});
				
				projectRoomWrapper = $("#editProjects");
					
				var userBin = $("<div/>", {class:"userBin"});
				var liveBin = $("<div/>", {class:"liveBin"});
					
				var userUl  = $("<ul/>", {class:"userUl"});
				userBin.append(userUl);
		
				var liveUl  = $("<ul/>", {class:"liveUl"});
				liveBin.append(liveUl);
				
				projectRoomWrapper.append(userBin).append(liveBin);
				
				if (data != null) {
					
					var folderName    = "";
					var oldFolderName = "";
					
					$.each(data, function() {
						$.each(this, function(k, v) {
							var itemText 		= $("<a/>", {style:"float: left;"}).data("reelObj",this).unbind("click").bind("click", function () {
								
								var general = adbeast.general; 
								general.oid = $(this).data("reelObj").oid; 
								general.playList = []; 
								general.playListPos = 0; 
								general.loadModal();

							}).text(this.objectname.substring(0,30)).after(
								$("<div/>", {class: "removeFromBin"}).html("X").data("binObj", this).click(function() {
									
									adbeast.projectRoom.oid = $(this).parent().data("oid");
									
									if ($(this).parent().parent().hasClass("binFolder")) {
										adbeast.projectRoom.fid = $(this).data("binObj").pkey;
										adbeast.projectRoom.deleteFromFolders();
									} else {
										adbeast.projectRoom.deleteLooseItems();
									}

									$(this).parent().remove();
								})
							);
							
							var binItem  	    = $("<li/>", {class:"projectRoomItemInfobox projectRoomItemListView"}).data("oid",this.oid).html(itemText)
							
							if (this.isbinfolder == "Y") {
								folderName = this.descrip;
								
								if (folderName != oldFolderName) {
									var newFolderWrapper = $("<div/>", {class:"binFolder"}).html(this.descrip);
									userUI.append(newFolderWrapper);
								}
								$(".binFolder").append(binItem);
							} else {
								userUl.append(binItem.addClass("looseItem"));
							}
							
							oldFolderName = folderName;
						});
					});
					
				} else {
					console.log("No Data");
				}
				
				adbeast.projectRoom.getProjectBinFoldersAndLiveItems();
				
				$('.modal a').on('click', function(e) {
						e.stopImmediatePropagation();
				});
				
			},
			error: function(e) {
				console.log(e.message);
			}

			
			});
		
		return self;
	}

	self.getProjectBinFoldersAndLiveItems = function() {
	
		$.ajax({
			type: 'GET',
			url: "/adbeast/binFunctions/getProjectBinFoldersAndLiveItems.asp",
			async: true,
			jsonpCallback: 'callback',
			contentType: "application/json",
			dataType: 'json',
			data: {cid:cid, rid:rid},
			
			success: function(data) {
				
				if (data != null) { 
					
					var liveUl = $(".liveUl");
				
					var folderName    = "";
					var oldFolderName = "";
				
					$.each(data, function() {
						$.each(this, function(k, v) {

						var itemText 	   = $("<a/>").data("reelObj",this).unbind("click").bind("click", function () {
								
								var general = adbeast.general;
								general.oid = $(this).data("reelObj").oid; general.playList = []; general.playListPos = 0; general.loadModal();
								
							}).text(this.objectname.substring(0,30)).after(
								$("<div/>", {class: "removeFromBin"}).html("X").data("binObj", this).click(function() {

									var projectRoom = adbeast.projectRoom;
									projectRoom.oid = $(this).parent().data("oid");
									
									if ($(this).parent().parent().hasClass("binFolder")) {
										projectRoom.fid = $(this).data("binObj").pkey;
										projectRoom.deleteFromFolders();

									} else {
										projectRoom.deleteLooseItems();
									}
									
									$(this).parent().remove();
								})
							);
							
							var binItem        = $("<li/>", {class:"projectRoomItemInfobox projectRoomItemListView binItem"}).data("oid",this.oid).html(itemText);
							
							if (this.isbinfolder != "0") {
								folderName = this.descrip;
								
								if (folderName != oldFolderName) {
								
									var folderTitleWrapper  = $("<div/>", {class:"folderTitleWrapper projectRoomItemInfobox"}).html(this.descrip);
									var newFolderWrapper    = $("<ul/>", {class:"binFolder"}).html(folderTitleWrapper).unbind("click").click(function() {
										$(this).find("li").toggle();
									}).data("pkey",this.pkey);
									
									this.isbinfolder == "Y" ? $(".userUl").prepend(newFolderWrapper) : $(".liveUl").prepend(newFolderWrapper);
								}
								
								if (this.objectname != "0") {
									binItem.css("display","none");
									$(".binFolder").append(binItem);
								}
									
							} else {
								liveUl.append(binItem.addClass("looseItemLive"));
								
							}
							
							oldFolderName = folderName;
						});
					});
					
				} else {
					console.log("No Data");
				}
				
				$('.modal a').on('click', function(e) {
						e.stopImmediatePropagation();
				});
						
				
				$(".userUl, .liveUl, .binFolder").sortable({ 
	
					opacity:           0.9, 
					helper:            "clone",
					revert:            15,
					cursor:            "move",
					connectWith: 		".liveUl, .binFolder",
						
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
					
						var projectRoom = adbeast.projectRoom;
						
						projectRoom.oid = $(ui.item).data("oid");
						
						if (!$(ui.item).parent().hasClass("binFolder")) {
							projectRoom.addLooseItems();
						} else {
							projectRoom.fid = $(ui.item).parent().data("pkey");
							projectRoom.addItemsToFolders();
						}
						
						$(ui.helper).css("z-index", "1");
								
					},
					
					receive: function(e, ui)
					{
					
					}
					
				});
			},
			
			error: function(e) {
				console.log(e.message);
			} 
		});
	}
		
	self.createFolder  = function() {
	
		var cid = adbeast.projectRoom.cid;
		var rid = adbeast.projectRoom.rid;
	
		$.fn.modal({
			theme:      "light",
			width:      650,
			height:     200,
			padding:    "10px",
			animation:  "none"
		})
	
		$.ajax({
			type: 'GET',
			url: "/adbeast/binFunctions/createFolder.html",
			async: false,
			success: function(data) {
				$(".wrapper").html(data);
				
				$(".createFolderButton").unbind().bind("click", function(){
					$.ajax({
						type: 'GET',
						url: "/adbeast/binFunctions/createFolder.asp",
						async: false,
						data: {cid:cid, rid:rid, text: $(".newFolderName").val()},
						success: function(data) {
							$(".modal").remove();
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
							
							adbeast.projectRoom.getProjectBinItems();
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

	self.addLooseItems = function() {
	
		var cid = adbeast.projectRoom.cid;
		var rid = adbeast.projectRoom.rid;
		var oid = adbeast.projectRoom.oid;
	
		$.ajax({
			type: 'GET',
			url: "/adbeast/binFunctions/addLooseItems.asp",
			async: false,
			data: {cid:cid, rid:rid, text:oid},
			success: function(data) {
							
				$.notification ({
					content:    'Object successfully added',
					border:     true,
					fill:       true,
					showTime:   true,
					icon:       'N',
					color:      'green',
					error:      false,
					timeout:    2000
				}) 
							
				//adbeast.projectRoom.getProjectBinItems();
				
			},
					
			error: function(e) {
				console.log(e.message);
			} 
		});
		
	}
	
	self.addItemsToFolders = function() {
	
		var cid = adbeast.projectRoom.cid;
		var rid = adbeast.projectRoom.rid;
		var oid = adbeast.projectRoom.oid;
		var fid = adbeast.projectRoom.fid;
	
		var strText = fid + "," + oid;
	
		$.ajax({
			type: 'GET',
			url: "/adbeast/binFunctions/addItemsToFolders.asp",
			async: false,
			data: {cid:cid, rid:rid, text:strText},
			success: function(data) {
							
				$.notification ({
					content:    'Object successfully added',
					border:     true,
					fill:       true,
					showTime:   true,
					icon:       'N',
					color:      'green',
					error:      false,
					timeout:    2000
				}) 
							
				//adbeast.projectRoom.getProjectBinItems();
				
			},
					
			error: function(e) {
				console.log(e.message);
			} 
		});
		
	
	}
	
	self.deleteLooseItems  = function() {
	
		var cid = adbeast.projectRoom.cid;
		var rid = adbeast.projectRoom.rid;
		var oid = adbeast.projectRoom.oid;
	
		$.ajax({
			type: 'GET',
			url: "/adbeast/binFunctions/deleteLooseItems.asp",
			async: false,
			data: {cid:cid, rid:rid, text:oid},
			success: function(data) {
							
				$.notification ({
					content:    'Object successfully removed',
					border:     true,
					fill:       true,
					showTime:   true,
					icon:       'N',
					color:      'green',
					error:      false,
					timeout:    2000
				}) 
							
				//adbeast.projectRoom.getProjectBinItems();
				
			},
					
			error: function(e) {
				console.log(e.message);
			} 
		});
		
	
	}
	
	self.deleteFromFolders = function() {
	
		var cid = adbeast.projectRoom.cid;
		var rid = adbeast.projectRoom.rid;
		var oid = adbeast.projectRoom.oid;
		var fid = adbeast.projectRoom.fid;
		
		var strText = fid + "," + oid;
		
		$.ajax({
			type: 'GET',
			url: "/adbeast/binFunctions/deleteFromFolders.asp",
			async: false,
			data: {cid:cid, rid:rid, text:strText},
			success: function(data) {
							
				$.notification ({
					content:    'Object successfully removed',
					border:     true,
					fill:       true,
					showTime:   true,
					icon:       'N',
					color:      'green',
					error:      false,
					timeout:    2000
				}) 
							
				//adbeast.projectRoom.getProjectBinItems();
				
			},
					
			error: function(e) {
				console.log(e.message);
			} 
		});
	
	}
	
	return self;
	
}());