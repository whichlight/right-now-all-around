$(document).ready(function() {


$('#loading')
    .hide()  // hide it initially
    .ajaxStart(function() {
        $(this).show();
    })
    .ajaxStop(function() {
        $(this).hide();
    });


	window.Twimage = Backbone.Model.extend({
	//	url: function(){ 
		//return this.id ? '/twimages/' + this.id : '/twimages';
	//	}	
	
		update: function(){
			//this.set("created_at", getTimestamp(this.get("time")));
			this.set({created_at :(getTimestamp(this.get("time")))});
			//console.log(this.get("created_at"));
		}	

	});
	
	window.Twimages = Backbone.Collection.extend({
		model: Twimage
	});

	window.TwimagesView = Backbone.View.extend({
		initialize: function(){
			_(this).bindAll('add', 'remove');
			
			this._twimageViews=[];
			this.collection.bind('add', this.add);	
			    this.collection.bind('remove', this.remove);

		},
		add : function(twimage){
			var tv = new UpdatingTwimageView({
				model : twimage
			});
			this._twimageViews.push(tv);
   			   $(this.el).append(tv.render().el);
		}, 
					
		remove : function(twimage) {
		    var viewToRemove = _(this._twimageViews).select(function(cv) { return cv.model === twimage; })[0];
		console.log(viewToRemove);
		    this._twimageViews = _(this._twimageViews).without(viewToRemove);
			console.log(viewToRemove); 
		    if (this._rendered) $(viewToRemove.el).remove();
		  },
		render : function(){
			this._rendered=true;
	//		$(this.el).empty();	
			
			_(this._twimageViews).each(function(tv, error){
				$('#container').append(tv.render());
			});
			return this;
		}

	});


	window.UpdatingTwimageView = Backbone.View.extend({
		initialize : function(options){
			this.render = _.bind(this.render,this);
		 	this.model.bind('change', this.render);		
		},
		
		tagName : "div", 
		render : function(){
			var template = _.template($("#img_template").html(),this.model.toJSON());
	//	template+=_.template($("#twitter_time").html(),this.vars);		       
		       	this.el.innerHTML= template; 
			return this;
		}

	});
	
	var twimages = new Twimages();
	
	var twimagesV = new TwimagesView({
		collection: twimages, 
		el : $('#container')
	});		
	
	
        var tweets = [];
	var search_url = 'http://search.twitter.com/search.json'
	var refresh_url = '?q=instagr.am&rpp=5&include_entities=true&result_type=recent'
	
       //setInterval(function(){
	var pullMoreImages = function(){
	$.getJSON(search_url+refresh_url+'&callback=?',function(data){

			refresh_url = data.refresh_url;
			tweets.push.apply(tweets,data.results);
                	$.each(data.results,function(index,d){
				url = d.entities.urls[0].expanded_url;
				var req_url = encodeURIComponent(url);
				src= url+"media/?size=l";	
				var share = "https://twitter.com/share?url=''&text="+encodeURIComponent("#rightnowallaround bit.ly/MWicm8 RT@: "+d.from_user+" "+d.text)

				var t = new Twimage({source: src, 
					tweet: d, 
					instagram_url: url,
					from_user : d.from_user,
					profile_image_url: d.profile_image_url,
					text: d.text.replace(/http:\/\/[a-z\.\/0-9A-Z]*/g,"").replace(/(\r\n|\n|\r)/gm,""),
					twitter_url: "http://twitter.com/"+d.from_user,
					time : d.created_at,
					created_at : getTimestamp(d.created_at),
					share_url: share,
					id : d.id
				});
				console.log(t);	
				//check if image exists	
				var i = new Image();	
				i.onload = function(){
					twimages.add(t);
					};
				i.src = src; //call image, if it exists, add obj	
				
			});	
			
		});
	
	
	}
//	$("#start").click(function(){
//			pullMoreImages();
//			});

//,5000);}
//to identify end of window 
//setInterval(pullMoreImages,5000);
var play=true;

var mobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));

if(!mobile){
setInterval(function(){
	twimages.each(function(t){
	t.update();
	});
	//twimagesV.render();

	/*	
	if(twimages.length>60){
		var sorted = twimages.sortBy( function(tw){return tw.id});
		var stripped = _.first(sorted, 25); 			
		_.each(stripped, function(tw){
			twimages.remove(tw);
		});	
		console.log(stripped);				
	}	
	*/
}, 1000);
}

pullMoreImages();


$(':image').error(function(){
		$(this).hide();
	});		


//to identify end of window 
	$(window).scroll(function(){
			if  ($(window).scrollTop() +(612*4)> $(document).height() - $(window).height()){
				if(play){
				pullMoreImages();
				play=false;
				}
			
			 }
			else{
			play=true;
			}
			});



});

  var getTimestamp = function(time)
    {
        //--------------------------------------------------------------
        // http://af-design.com/blog/2009/02/10/twitter-like-timestamps/
        //--------------------------------------------------------------
        //from https://groups.google.com/forum/?fromgroups#!topic/twitter-development-talk/pp1DlJVcu7Y

	var system_date = new Date(time);
        var user_date = new Date();
        var diff = Math.floor((user_date - system_date) / 1000);
        var result="";
	if (diff <= 1) return "just now";
       
       	if (diff < 60) return diff+ " seconds ago";	
	if (diff<120 && diff>60 ) return "1 minute and " +diff%60+ " seconds ago";
	if (diff>120) {
		result+= Math.floor(diff/60) + " minutes and " + diff%60+ " seconds ago";
       		return result; 
		}

    }

