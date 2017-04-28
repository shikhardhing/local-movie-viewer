var space='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
makehtml=function(movie){
	return '<div class="col s6 m4 l3 xl2">\
				<div class="card">\
					<div class="card-image">\
						<img class="activator" height="250px" src="Movies_posters/'+movie["Filename"]+'.jpg'+'">\
					</div>\
					<div class="card-content">\
						<p>'+
							'<span class="red-color">'+movie["imdbRating"]+'</span>'+
							space+movie["Runtime"]+
							'<span class="red-color" style="float:right;"><b>'+movie["Rated"]+'</b></span>\
						</p>\
						<p>'+movie["Year"]+
						'<span style="float:right">'+movie["Size"]+'</span></p>\
						<p>'+movie["Genre"]+'</p>\
					</div>\
					<div class="card-action" style="padding:0px">\
						<b><a class="waves-effect white red-color btn playMovie" id="'+movie["Location"]+'" style="padding:8px 60px;height:50px">Watch Now</a></b>\
					</div>\
					<div class="card-reveal" style="padding:8%;">\
						<span class="card-title grey-text text-darken-4">'+movie["Title"]+'<i class="fa fa-close" style="float:right;" aria-hidden="true" ></i></span>\
						<p>'+movie["Actors"]+'</p>\
						<p>'+movie["Plot"]+'</p>\
					</div>\
				</div>\
			</div>';
}
make_row_all=function(sortBy,from,noOfCards){	
	if(sortBy===0)
		metadata=metadataByRating;
	else
		metadata=metadataByDate;
	var i,ne='';
	var counter=0;
	if(from!=0){
		id=from-noOfCards;
		ne='<a class="btn-floating btn-large waves-effect waves-light red button-row-all" id="'+id+'" style="bottom:180px"><i class="fa fa-4x fa-chevron-left" aria-hidden="true" ></i></a>';
		console.log(from);
	}
	else{
		ne+='<span style="margin-left:56px;"></span>'
	}
	
	ne+='<div class="container" style="width:90%">';
	for(i=from;i<metadata.length;i++){
		counter+=1;
		if(counter>noOfCards)
			break;
		ne+=makehtml(metadata[i]);
	}
	ne+='</div>';
	if(i!=metadata.length)
		ne+='<a class="btn-floating btn-large waves-effect waves-light red button-row-all" id="'+i+'" style="bottom:180px"><i class="fa fa-4x fa-chevron-right" aria-hidden="true" ></i></a>';
	return ne;
}
show_all=function(sortBy,from,noOfCards){
	var ne='<h4 class="categ">All movies</h4>';
	ne+='<a class="waves-effect red waves-light btn more-all-toggle">More</a>'
	ne+='<div class="row ">';
	ne+=make_row_all(sortBy,from,noOfCards);				
	ne+='</div>';
	$(".collection").append(ne);
}
make_row_genre=function(sortBy,from,noOfCards,lis,g){
	console.log(noOfCards);
	if(sortBy===0)
		metadata=metadataByRating;
	else
		metadata=metadataByDate;
	var ID,ne='';
	var counter=0;
	if(from!=0){
		ID=from-noOfCards;
		ne+='<a class="'+g+' btn-floating btn-large waves-effect waves-light red button-row-genre" id="'+ID+'" style="bottom:180px"><i class="fa fa-4x fa-chevron-left aria-hidden="true" ></i></a>';
	}
	else{
		ne+='<span style="margin-left:56px;"></span>'
	}
	ne+='<div class="container" style="width:90%">';
	for (ID=from;ID<lis.length;ID++){
		counter+=1;
		if(counter>noOfCards)
			break;
		ne+=makehtml(metadata[lis[ID]]);
	}
	ne+='</div>';
	if(ID!=lis.length)
		ne+='<a class="'+g+' btn-floating btn-large waves-effect waves-light red button-row-genre" id="'+ID+'" style="bottom:180px"><i class="fa fa-4x fa-chevron-right aria-hidden="true" ></i></a>';
	return ne;
}
show_genre=function(sortBy,from,noOfCards){
	for(g in genre){
		var ne='<h4 class="categ">'+g+' Movies</h4>';
		ne+='<a class="waves-effect red waves-light btn more">More</a>'
		ne+='<div class="row '+g+'">';
		ne+=make_row_genre(sortBy,from,noOfCards,genre[g],g);
		ne+='</div>';
		$(".collection").append(ne);
	}
}


$(document).ready(function(){
	var more_all_now=0;
	show_all(0,0,6);
	//show_all(1,0,6);
	show_genre(0,0,6);
	$(".row").on("click",".playMovie",function(){
		$("body").html('<video autoplay controls height="480px" width="960px" src="../'+$(this).attr("id")+'" type="video/mp4"/>');
	});
	$(".row").on("click",".button-row-all",function(){
		var from=$(this).attr('id');
		$(this).parent().html(make_row_all(0,from,6));
	});
	$(".row").on("click",".button-row-genre",function(){
		var from=$(this).attr('id');
		var g=$(this).attr('class').split(' ')[0];
		$(this).parent().html(make_row_genre(0,from,6,genre[g],g));
	});
	$(".collection").on("click",".more",function(){
		$(this).html("Show Less")
		console.log($(this).next().attr("class").split(" ")[1]);
		var g=$(this).next().attr("class").split(" ")[1];
		$(this).next().html(make_row_genre(0,0,10000,genre[g],g));
	});
	$(".collection").on("click",".more-all-toggle",function(){
		if(more_all_now==0){
			$(this).html("Show Less");
			$(this).next().html(make_row_all(0,0,10000));
			more_all_now=1;
		}
		else{
			$(this).html("More");
			$(this).next().html(make_row_all(0,0,6));
			more_all_now=0;			
		}
	});
});

