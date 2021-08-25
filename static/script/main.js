'use strict';

// Create an instance
var wavesurfer = Object.create(WaveSurfer);

// Init & load audio file
document.addEventListener('DOMContentLoaded', function () {
    var options = {
        container     : document.querySelector('#waveform'),
        height: 200,
        pixelRatio: 1,
        scrollParent: true,
        waveColor     : 'violet',
        progressColor : 'purple',
        loaderColor   : 'purple',
        cursorColor   : 'navy'
    };

    if (location.search.match('scroll')) {
        options.minPxPerSec = 100;
        options.scrollParent = true;
    }

    // Init
    wavesurfer.init(options);
    // Load audio from URL
    wavesurfer.util.ajax({
        responseType: 'json',
        url: 'static/json/rashomon.json'
    }).on('success', function (data) {
        console.log("success");
        wavesurfer.load(
            'static/media/goi_ten_em_trong_dem.mp3',
            data
        );
    });

    // Regions
    if (wavesurfer.enableDragSelection) {
        wavesurfer.enableDragSelection({
        });
    }


    /* Regions */

     wavesurfer.on('ready', function() {
//        // Init Timeline plugin
//        var timeline = Object.create(WaveSurfer.Timeline);
//
//        timeline.init({
//            wavesurfer: wavesurfer,
//            container: '#wave-timeline'
//        });

        //  if (localStorage.regions) {
        //     loadRegions(JSON.parse(localStorage.regions));
        // } else {
        //     // loadRegions(
        //     //     extractRegions(
        //     //         wavesurfer.backend.getPeaks(512),
        //     //         wavesurfer.getDuration()
        //     //     )
        //     // );
        //     wavesurfer.util.ajax({
        //         responseType: 'json',
        //         url: 'static/json/annotations.json'
        //     }).on('success', function (data) {
        //         loadRegions(data);
        //         saveRegions();
        //     });
        // }

        //  wavesurfer.on('region-click', function (region, e) {
        //      if(playfalg == 2)
        //      {
        //          e.stopPropagation();
        //         // Play on click, loop on shift click
        //         // e.shiftKey ? region.playLoop() : region.play();
        //      }
        // });
        // wavesurfer.on('region-click', regionClick);
        wavesurfer.on('region-updated', saveRegions);
        wavesurfer.on('region-removed', saveRegions);
        wavesurfer.on('region-in', showNote);

        // Report errors
        wavesurfer.on('error', function (err) {
            console.error(err);
        });

        // Do something when the clip is over
        wavesurfer.on('finish', function () {
            console.log('Finished playing');
        });

        wavesurfer.util.ajax({
                    responseType: 'json',
                    url: 'static/json/annotations.json',
                    event: "init"
                }).on('success', function (data) {
                    console.log("saveRegions 2");
                    loadRegions(data);
                });
     });

     wavesurfer.on('upload', function() {
            wavesurfer.util.ajax({
                    responseType: 'json',
                    url: 'static/json/annotations.json',
                    event: "upload"
                }).on('setup-upload', function () {
                    loadRegions([]);
                    var divContainer = document.getElementById("annotation-table");
                    divContainer.style.display = "none";
            });
     });



});


/**
* Display regions from regions.
*/
function displayRegions(regions) {

 }

 function regionClick(regions){
    if(playfalg == 2)
    {
        console.log("regionClick");
        console.log("regions: ", regions);
        var start = parseFloat(regions.start);
        var end = parseFloat(regions.end);
        console.log("start: ", start);
        console.log("end: ", end);
        wavesurfer.play(start, end);
    }
 }

 /**
  * Load regions from regions.
  */
 function loadRegions(regions) {
     console.log("loadRegions")

     wavesurfer.clearRegions();

     console.log("loadRegions", regions);
     console.log("loadRegions", typeof(regions));
     console.log("loadRegions", Object.keys(regions));


     regions.forEach(function(region) {
         console.log("region.color: ", region.color);
         if(region.color == undefined)
         {
             region.color = randomColor(0.1);
             console.log("RANDOM region.color: ", region.color);
         }
         console.log("region.color: ", region.color);
         // console.log("region: ", region)
         wavesurfer.addRegion(region);
     });

     var data1 = JSON.stringify(
         Object.keys(wavesurfer.regions.list).map(function(id) {
             let region = wavesurfer.regions.list[id];
             return {
                 start: region.start,
                 end: region.end,
                 attributes: region.attributes,
                 data: region.data
             };
         })
     );
    localStorage.regions = data1;

    console.log("2 localStorage.regions: ", JSON.parse(localStorage.regions).length);
 }

 function createTable()
{

    var datatable = Object.keys(wavesurfer.regions.list).map(function(id) {
             let region = wavesurfer.regions.list[id];
             return {
                 start: region.start,
                 end: region.end,
                 attributes: region.attributes,
                 data: region.data
             };
         })

    // EXTRACT VALUE FOR HTML HEADER.
    // ('Book ID', 'Book Name', 'Category' and 'Price')
    var col = [];
    col.push("START");
    col.push("END");
    col.push("ANNOTATION");
    // col.push("CHECK");

    // CREATE DYNAMIC TABLE.
    var table = document.createElement("table");
    table.setAttribute('class', "table table-bordered");

    // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

    var tr = table.insertRow(-1);                   // TABLE ROW.

    for (var i = 0; i < col.length; i++) {
        var th = document.createElement("th");      // TABLE HEADER.
        th.innerHTML = col[i];
        th.style.textAlign = "center";
        tr.appendChild(th);
    }

    var header_list = ["start", "end", "data"];
    // ADD JSON DATA TO THE TABLE AS ROWS.
    for (var i = 0; i < datatable.length; i++)
    {
        tr = table.insertRow(-1);
        var lyric = "";

        for (var j = 0; j < col.length; j++)
        {
            var tabCell = tr.insertCell(-1);
            var content = datatable[i][header_list[j]];

            if(j == 0 || j == 1)
            {
                content = Math.round(parseFloat(content) * 100) / 100;
                content = content.toString();
            }

            if(j == 2)
            {
                content = content.note;
                lyric = content;
                if(content == "" || typeof content == 'undefined')
                {
                    content = "No Annotation";
                    lyric = "No lyric";
                }
                if(lyric.split(/\s+/).length > 5)
                {
                    lyric = lyric.split(/\s+/).slice(0,5).join(" ");
                    lyric += "..."
                }
            }

            if(j == col.length-1)
            {
                var btn = document.createElement('input');
                btn.type = "button";
                btn.className = "btn";
                btn.value = lyric;
                console.log("lyric: ", lyric);
                console.log("btn.value: ", btn.value);
                btn.style.background = randomColor(0.1);
                btn.style.color = "black";
                btn.style.border = "#2e6da4";
                btn.style.textAlign = "center";
                btn.style.borderRadius = "5px";
                btn.style.display = "block";
                btn.style.margin = "auto";
                btn.onclick = (function(event) {
                                        var getcol = event.path["2"];
                                        var start = parseFloat(getcol.childNodes[0].innerText);
                                        var end = parseFloat(getcol.childNodes[1].innerText);
                                        console.log("start: ", start);
                                        console.log("start: ", end);
                                        wavesurfer.play(start, end);
                                        for(const regionID in wavesurfer.regions.list)
                                        {
                                            var regstart = Math.round(parseFloat(wavesurfer.regions.list[regionID].start) * 100) / 100;
                                            var regend = Math.round(parseFloat(wavesurfer.regions.list[regionID].end) * 100) / 100;
                                            if(start == regstart && end == regend)
                                            {
                                                editAnnotation(wavesurfer.regions.list[regionID]);
                                            }
                                        }
                                });

                tabCell.appendChild(btn);
            }
            else
            {
                tabCell.innerHTML = content;
            }

        }

    }

    return table;
}

 /**
  * Save annotations to regions.
  */
 function saveRegions() {
     // console.log("saveRegions");

     var data1 = JSON.stringify(
         Object.keys(wavesurfer.regions.list).map(function(id) {
             let region = wavesurfer.regions.list[id];
             return {
                 start: region.start,
                 end: region.end,
                 attributes: region.attributes,
                 data: region.data
             };
         })
     );

    localStorage.regions = data1;
    // console.log("localStorage.regions: ", JSON.parse(data1).length);

    // POST
    // fetch('/save', {
    //
    //     // Declare what type of data we're sending
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //
    //     // Specify the method
    //     method: 'POST',
    //     // A JSON payload
    //     body: JSON.stringify({
    //         "data": data1
    //     })
    //     }).then(function (response) { // At this point, Flask has printed our JSON
    //         return response.text();
    //     }).then(function (text) {
    //
    //         // console.log('POST response: ');
    //
    //         // Should be 'OK' if everything was successful
    //         // console.log("text: ", text);
    //
    //     });

    var table = createTable();

    // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
    var divContainer = document.getElementById("annotation-table");
    divContainer.innerHTML = "";
    divContainer.appendChild(table);
    divContainer.style.display = "block";

    const localword = [["", -1, -1]];

    data1 = Object.keys(wavesurfer.regions.list).map(function(id) {
             let region = wavesurfer.regions.list[id];
             return {
                 start: region.start,
                 end: region.end,
                 attributes: region.attributes,
                 data: region.data
             };
         });

    for(var i = 0;i < data1.length;i++)
    {
        // console.log("data1[i]: ", data1[i]);
        const lyric = [data1[i].data.note, data1[i].end, data1[i].start];
        localword.push(lyric);
    }

    words =  localword;

 }

 /**
 * Random RGBA color.
 */
function randomColor(alpha) {
    return 'rgba(' + [
        ~~(Math.random() * 255),
        ~~(Math.random() * 255),
        ~~(Math.random() * 255),
        alpha || 1
    ] + ')';

}


/**
 * Edit annotation for a region.
 */
function editAnnotation (region) {
    console.log("EDIT ANNOTATION");
    var form = document.forms.edit;
    form.style.display = "block";
    form.style.opacity = 1;
    form.elements.start.value = Math.round(region.start * 10) / 10,
    form.elements.end.value = Math.round(region.end * 10) / 10;
    form.elements.note.value = region.data.note || '';
    var lyric = form.elements.note.value;

    form.onsubmit = function (e) {
        console.log("ONSUBMIT");
        e.preventDefault();

        console.log("lyric: ", form.elements.note.value);
        console.log("lyric.split().length: ", form.elements.note.value.split(" ").length);
        if(form.elements.note.value.split(" ").length > 10)
        {
            alert("Too long lyric!");
            form.elements.note.value = lyric;
            return 0;
        }
        region.update({
            start: form.elements.start.value,
            end: form.elements.end.value,
            data: {
                note: form.elements.note.value
            }
        });
        form.style.opacity = 0;
        form.style.display = "None";
    };
    form.onreset = function () {
        console.log("ONRESET");
        form.style.opacity = 0;
        form.dataset.region = null;
    };
    form.dataset.region = region.id;

    console.log("form.elements.start.value: ", form.elements.start.value);
    console.log("form.elements.end.value: ", form.elements.end.value);

}


/* Progress bar */
document.addEventListener('DOMContentLoaded', function () {
    var progressDiv = document.querySelector('#progress-bar');
    var progressBar = progressDiv.querySelector('.progress-bar');

    var showProgress = function (percent) {
        progressDiv.style.display = 'block';
        progressBar.style.width = percent + '%';
    };

    var hideProgress = function () {
        progressDiv.style.display = 'none';
    };

    wavesurfer.on('loading', showProgress);
    wavesurfer.on('ready', hideProgress);
    wavesurfer.on('destroy', hideProgress);
    wavesurfer.on('error', hideProgress);
});

 /**
  * Display annotation.
  */
 function showNote(region) {
     if (!showNote.el) {
         showNote.el = document.querySelector('#subtitle');
     }
     showNote.el.textContent = region.data.note || '–';
 }

 /**
 * Bind controls.
 */
GLOBAL_ACTIONS['delete-region'] = function () {
    var form = document.forms.edit;
    var regionId = form.dataset.region;
    if (regionId) {
        wavesurfer.regions.list[regionId].remove();
        form.reset();
    }
    form.reset();
    form.style.display = "None";
};

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// GLOBAL_ACTIONS['export'] = function () {
//
//
// };

GLOBAL_ACTIONS['zoom-in'] = function () {

    var value = wavesurfer.params.minPxPerSec;
    console.log("value: ", value);
    if(value > 10)
    {
        value = value -5;
    }

    // set initial zoom to match slider value
    wavesurfer.zoom(value);

};

GLOBAL_ACTIONS['zoom-out'] = function () {

    var value = wavesurfer.params.minPxPerSec;
    console.log("value: ", value);
    if(value <= 45 )
    {
        value = value + 5;
    }

    // set initial zoom to match slider value
    wavesurfer.zoom(value);


};

var audioflag = 0;

// Audio Drag'n'drop
document.addEventListener('DOMContentLoaded', function ()
{
    var toggleActive = function (e, toggle)
    {
        // console.log("TOGGLEACTIVE");
        e.stopPropagation();
        e.preventDefault();
        toggle ? e.target.classList.add('wavesurfer-dragover'):
            e.target.classList.remove('wavesurfer-dragover');
    };

    // Check for BlobURL support
    var blob = window.URL || window.webkitURL;
        if (!blob) {
            console.log('Your browser does not support Blob URLs :(');
            return;
        }

    var loadkaraoke = function(e)
    {
        var karaokeaudio = document.getElementById("audio-karaoke");

        console.log("e.dataTransfer.files[0]: ", e.dataTransfer.files[0]);

        var file = e.dataTransfer.files[0];
        var fileURL = blob.createObjectURL(file);
        console.log("fileURL: ", fileURL);
        karaokeaudio.pause();
        karaokeaudio.src = fileURL;

    };

    var handlers = {
        // Drop event
        drop: function (e) {
            console.log("e: ", e);
            toggleActive(e, false);

            // Load the file into wavesurfer
            if (e.dataTransfer.files.length) {

                // console.log("3 localStorage.regions: ", JSON.parse(localStorage.regions).length);
                localStorage.clear();
                loadkaraoke(e);

                console.log("wavesurfer.loadBlob");
                wavesurfer.loadBlob(e.dataTransfer.files[0]);
                console.log("wavesurfer.loadBlob END");

                var form = document.forms.edit;
                form.reset();


            } else {
                wavesurfer.fireEvent('error', 'Not a file');
            }
        },

        // Drag-over event
        dragover: function (e) {
            toggleActive(e, true);
        },

        // Drag-leave event
        dragleave: function (e) {
            toggleActive(e, false);
        }
    };

    var audioDrop = document.querySelector('#waveform');
    Object.keys(handlers).forEach(function (event) {
        console.log("audioDrop", event);
        audioDrop.addEventListener(event, handlers[event]);
    });
});


// Drag'n'drop
document.addEventListener('DOMContentLoaded', function ()
{
    var toggleActive = function (e, toggle)
    {
        // console.log("TOGGLEACTIVE");
        e.stopPropagation();
        e.preventDefault();
        toggle ? e.target.classList.add('wavesurfer-dragover'):
            e.target.classList.remove('wavesurfer-dragover');
    };

    // Check for BlobURL support
    var blob = window.URL || window.webkitURL;
        if (!blob) {
            console.log('Your browser does not support Blob URLs :(');
            return;
        }

    var loadkaraoke = function(e)
    {
        var karaokeaudio = document.getElementById("audio-karaoke");

        console.log("e.dataTransfer.files[0]: ", e.dataTransfer.files[0]);

        var file = e.dataTransfer.files[0];
        var fileURL = blob.createObjectURL(file);
        console.log("fileURL: ", fileURL);
        karaokeaudio.pause();
        karaokeaudio.src = fileURL;

    };

    var handlers = {
        // Drop event
        drop: function (e) {

            console.log("e: ", e);
            toggleActive(e, false);

            // Load the file into wavesurfer
            if (e.dataTransfer.files.length) {

                // console.log("3 localStorage.regions: ", JSON.parse(localStorage.regions).length);
                localStorage.clear();
                loadkaraoke(e);

                console.log("wavesurfer.loadBlob");
                wavesurfer.loadBlob(e.dataTransfer.files[0]);
                console.log("wavesurfer.loadBlob END");

                var form = document.forms.edit;
                form.reset();

                dropTarget.style.display = "none";
                audioTarget.style.display = "block";

                audioflag = 1;


            } else {
                wavesurfer.fireEvent('error', 'Not a file');
            }
        },

        // Drag-over event
        dragover: function (e) {
            toggleActive(e, true);
        },

        // Drag-leave event
        dragleave: function (e) {
            toggleActive(e, false);
        }
    };

    var dropTarget = document.querySelector('#drop');
    var audioTarget = document.querySelector('#waveform');
    Object.keys(handlers).forEach(function (event) {
        console.log("dropTarget", event);
        dropTarget.addEventListener(event, handlers[event]);
    });


});


document.addEventListener('DOMContentLoaded', function ()
{
   function onChange(event) {
       console.log("EVENT1: ", event);
       console.log("audioflag: ", audioflag);
       if(audioflag == 0)
       {
           alert("Please input audio!");
       }
       else if(event.target.files[0].type == "text/plain")
       {
           var reader = new FileReader();
           reader.onload = onReaderLoad;
           reader.readAsText(event.target.files[0]);
       }
       else
       {
            alert("Wrong type input!\n(json file is allowed)");
       }
   }

   function isNumeric(num){
      return !isNaN(num)
    }

    function onReaderLoad(event){
        console.log("EVENT2: ", event);
        var results = event.target.result;
        const arrayOfStrings = results.split("\n");
        var data = [];

        for(var i = 0; i < arrayOfStrings.length;i++)
        {
            var contents = arrayOfStrings[i].split(" ");
            if(contents.length < 3)
            {
                alert("Wrong content format!)");
                return 0;
            }

            if(!isNumeric(contents[0]) || !isNumeric(contents[1]))
            {
                alert("Wrong content format!");
                return 0;
            }

            var start = parseFloat(contents[0]);
            var end = parseFloat(contents[1]);
            var lyrics = "";

            for(var j = 2; j < contents.length-1;j++)
            {
                lyrics += contents[j] + " ";
            }

            lyrics += contents[contents.length-1];

            if(lyrics[0] != '"' || lyrics[lyrics.length-1] != '"')
            {
                alert("Wrong content format!");
                return 0;
            }

            if(lyrics.split(" ").length > 10)
            {
                alert("Too long lyric!");
                return 0;
            }

            lyrics = lyrics.substring(1, lyrics.length - 1);
            console.log("data.length: ", typeof(data));
            data.push({"start": start, "end": end, "data":{"note": lyrics}})
        }

        console.log(data);
        console.log(typeof(data));

        loadRegions(data);
        saveRegions();

        // var obj = JSON.parse(event.target.result);
        // var data2 = JSON.parse(event.target.result);
        // console.log(data2);
        // console.log(typeof(data2));
        //
        // words = [["", -1, -1]];
        // data.forEach(function(annotation)
        // {
        //
        //     if(annotation.data.note == undefined){
        //         annotation.data.note = "";
        //     }
        //
        //     const lyric = [annotation.data.note, annotation.end, annotation.start];
        //     words.push(lyric);
        // });

    }

    document.getElementById('upload-Btn').addEventListener('change', onChange);
   
});

document.onkeypress = function (e) {
    e = e || window.event;
    // use e.keyCode
    if(audioflag == 1 && e.key == "Enter")
    {
        var currenttime = wavesurfer.getCurrentTime();
        var check = 1;

        console.log("KEYBOARD", e.key);
        console.log(currenttime);
        console.log("wavesurfer.regions.list: ", wavesurfer.regions.list);

        for(const regionID in wavesurfer.regions.list)
        {
            var reg = wavesurfer.regions.list[regionID];
            if(currenttime >= reg.start && currenttime <= reg.end)
            {
                check = 0;
            }
        }

        if(check == 1)
        {
            var region = {"start": currenttime, "end": currenttime+2, "color": randomColor(0.1), "data": {}};
            wavesurfer.addRegion(region);
            saveRegions();
        }
    }
};
