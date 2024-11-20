Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Some Message",
        autoProcessQueue: false
    });
    
    dz.on("addedfile", function() {
        if (dz.files[1]!=null) {
            dz.removeFile(dz.files[0]);        
        }
    });

    dz.on("complete", function (file) {
        let imageData = file.dataURL;
        var url = "/api/classify_image";

        $.post(url, {
            image_data: file.dataURL
        },function(data, status) {
          
            console.log(data);
            if (!data || data.length==0) {
                $("#resultHolder").hide();
                $("#divClassTable").hide();                
                $("#error").show();
                return;
            }
            let actors = ["prabhas", "anushka_shetty", "kamal_haasan", "deepika_padukone", "rajinikanth"];
            
            let movie = null;
            let bestMovies = -1;
            for (let i=0;i<data.length;++i) {
                let bestMovieForThisClass = Math.max(...data[i].class_probability);
                if(bestMovieForThisClass>bestMovies) {
                    movie = data[i];
                    bestMovies = bestMovieForThisClass;
                }
            }
            if (movie) {
                $("#error").hide();
                $("#resultHolder").show();
                $("#divClassTable").show();
                $("#resultHolder").html($(`[top-actor="${movie.class}"`).html());
                let classDictionary = movie.class_dictionary;
                for(let personName in classDictionary) {
                    let index = classDictionary[personName];
                    let proabilityScore = movie.class_probability[index];
                    let elementName = "movies_" + personName;
                    $(elementName).html(proabilityScore);
                }
            }
                   
        });
    });

    $("#submitBtn").on('click', function (e) {
        dz.processQueue();		
    });
}

$(document).ready(function() {
    console.log( "ready!" );
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();

    init();
});