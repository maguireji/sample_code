var agencytree = {};

var loadoption = 1;

agencytree.initialize     = (function() {

	var self = {};
     
	var cp_var;
	var t_var;
	var tree;
	var background;
				
	//var param1;
	//?cp=company&t=agency

		
	self.load = function () {
		$("#statusmessage").html("Loading Creative Report Card").show();
		self.loadAgencies();
		
	}
	
	self.loadAgencies = function() {
		// Top 10 Agencies
		
		agencytree.initialize.tree = 1;
		agencytree.initialize.background = 'salmonstar';
		agencytree.initialize.cp_var = 'company';
		agencytree.initialize.t_var = 'agency';
		agencytree.initialize.init();
		
	}
	
	self.loadBrands = function() {
		
		agencytree.initialize.tree = 0;
		agencytree.initialize.background = 'greenstar';
		agencytree.initialize.cp_var = 'company';
		agencytree.initialize.t_var = 'brand';
		agencytree.initialize.init();
		
	}
	
	self.loadCD = function() {
		
		agencytree.initialize.tree = 2;
		agencytree.initialize.background = 'yellowstar';
		agencytree.initialize.cp_var = 'person';
		agencytree.initialize.t_var = 'cd';
		agencytree.initialize.init();
		
	}
	
	self.loadAD = function() {
		
		agencytree.initialize.tree = 3;
		agencytree.initialize.background = 'brownstar';
		agencytree.initialize.cp_var = 'person';
		agencytree.initialize.t_var = 'ad';
		agencytree.initialize.init();
		
	}
	
	self.loadCW = function() {
		
		agencytree.initialize.tree = 4;
		agencytree.initialize.background = 'orangestar';
		agencytree.initialize.cp_var = 'person';
		agencytree.initialize.t_var = 'cw';
		agencytree.initialize.init();
		
	}
	
	self.loadPL = function() {
		
		agencytree.initialize.tree = 5;
		agencytree.initialize.background = 'lightbluestar';
		agencytree.initialize.cp_var = 'person';
		agencytree.initialize.t_var = 'pl';
		agencytree.initialize.init();
		
	}
	
	self.init = function() {
		
		var self = {};
	
			var init = $.ajax({
					type: 'GET',
					url: "/wp/wp-content/themes/pb/crc/archive-json.php",
					async: true,
					contentType: "application/json",
					dataType: 'json',
					data: { cp:this.cp_var, t:this.t_var },
					success: function(data) {
						
						var list = $(".list").eq(agencytree.initialize.tree);
						
						$.each(data, function() {
						
							list.append($("<li>", {class: agencytree.initialize.background, id:this.ID, value:this.ID, type:agencytree.initialize.t_var}).text(this.post_title).data("object", this).on("click", function(e){
								
								agencytree.object.ID_var = $(this).data("object").ID;
								agencytree.object.t_var  = $("#" + $(this).data("object").ID).attr("type");
								agencytree.object.title  = $(this).data("object").post_title;
								
								$("#objectdiv h2").html($(this).data("object").post_title);
								$("#overlay").fadeIn("fast");
								scrollTo(0,0);
																
								if (agencytree.object.t_var == "agency" || agencytree.object.t_var == "brand") {
								
									agencytree.object.loadcompany();
								} else {
									
									agencytree.object.loadperson();
								}
																
							}));
							
						})
					
					
					},
										
					error: function(data) {
						console.log(data);
					} 
					
				}).done(function(){
					
					switch(loadoption) {
						case 1:
							agencytree.initialize.loadBrands();
							loadoption++;
						break;
						case 2:
							agencytree.initialize.loadCD();
							loadoption++;
						break;
						case 3:
							agencytree.initialize.loadAD();
							loadoption++;
						break;
						case 4:
							agencytree.initialize.loadCW();
							loadoption++;
						break;
						case 5:
							agencytree.initialize.loadPL();
							loadoption++;
						default:
							$(".categorytree").fadeIn();
							$("#statusmessage").html("").fadeOut("fast");
							
						}
					
					
				});
				
				
	
	}
	
        
  return self;

}());

agencytree.object  = (function() {
	
	var self = {};
	
	var ID_var;
	var t_var;
	var url_var;
	var year;
	var rank;
	var title;
	
	self.loadperson = function() {
		
			var init = $.ajax({
					type: 'GET',
					url: "/wp/wp-content/themes/pb/crc/person-json.php",
					async: true,
					contentType: "application/json",
					dataType: 'json',
					data: { ID:this.ID_var, year:this.year, title:this.title, type:this.t_var },
					success: function(data) {
						
						$("#objectdataleft").html("Rank 2018: " + data.rank_2017 + "<br>" );
						$("#objectdataleft").append("Rank 2017: " + data.rank_2016 + "<br>" ) ;
						
						//console.log(data);
						
						$("#inthenewsdata").html("In the news <br>");
						$.each(data.newsposts, function() {
							
							$("#inthenewsdata").append($("<a>", {href: this.guid, text:this.post_title, target:"_blank"}));
						});
						
						$("#winningpostsdata").html("Winning Work <br>");
						$.each(data.winningposts, function() {
							
							$("#winningpostsdata").append($("<a>", {href: this.guid, text:this.post_title, target:"_blank"}));
						})
					
					},
										
					error: function(data) {
						//console.log(data);
					} 
					
				}).done(function(){
					
				});
	}
	
	self.loadcompany = function() {
		
			var init = $.ajax({
					type: 'GET',
					url: "/wp/wp-content/themes/pb/crc/company-json.php",
					async: true,
					contentType: "application/json",
					dataType: 'json',
					data: { ID:this.ID_var, year:this.year, title:this.title, type:this.t_var },
					success: function(data) {
						
						
						$("#addressdata").html(data.address + "<br><br>");
						
						$("#objectdataleft").append("Rank 2018: " + data.rank_2017 + "<br>" );
						$("#objectdataleft").append("Rank 2017: " + data.rank_2016 + "<br>" ) ;
						
						$("#artdirectors").append("<br> Art Directors <br>");
						$.each(data.agency_art_directors, function() {
							
							$("#artdirectors").append($("<a>", {href: "#", text:this.post_title}).data("object", this).on("click", function(e){
								agencytree.object.ID_var = $(this).data("object").id;
								agencytree.object.title  = $(this).data("object").post_title;
								agencytree.object.t_var  = "person";
								agencytree.object.loadperson();
							}));
						
						});
						
						$("#copywriters").append("<br> Copywriters <br>");
						$.each(data.agency_copywriters, function() {
							
							$("#copywriters").append($("<a>", {href: this.id, text:this.post_title, target:"_blank"}));
						});
						
						$("#creativedirectors").append("<br> Creative Directors <br>");
						$.each(data.agency_creative_directors, function() {
							
							$("#creativedirectors").append($("<a>", {href: this.id, text:this.post_title, target:"_blank"}));
						});
						
						$("#inthenewsdata").html("In the news <br>");
						$.each(data.newsposts, function() {
							
							$("#inthenewsdata").append($("<a>", {href: this.guid, text:this.post_title, target:"_blank"}));
						});
						
						$("#winningpostsdata").html("Winning Work <br>");
						$.each(data.winningposts, function() {
							
							$("#winningpostsdata").append($("<a>", {href: this.guid, text:this.post_title, target:"_blank"}));
						})
					
					},
										
					error: function(data) {
						//console.log(data);
					} 
					
				}).done(function(){
					
				});
	}
	
	
	return self;
	
}());


$(document).ready (function () {
	
	var init = agencytree.initialize.load();
	
	$("#closebutton img").click(function() {
		$("#overlay").fadeOut("fast");
		$("#objectdata, #inthenewsdata, #winningpostsdata, #artdirectors, #copywriters, #creativedirectors").html("");
		
		
	});
	
});

$(document).keyup(function(e){

    if(e.keyCode === 27)
        $("#overlay").fadeOut("fast");
		$("#objectdata, #inthenewsdata, #winningpostsdata, #artdirectors, #copywriters, #creativedirectors").html("");
		
});
