// document.getElementById("display").innerHTML = "TRIVIA";

var wavesurfer = window.wavesurfer; // eslint-disable-line no-var

let GLOBAL_ACTIONS = {
    playaudio: function() {
        console.log("Play Global action!")
        var currenttime = wavesurfer.getCurrentTime();
        console.log("currenttime PLAY1: ", currenttime);
        playfalg = 1;
        var karaokeaudio = document.getElementById("audio-karaoke");
        // console.log(karaokeaudio.duration);
        // console.log("karaokeaudio: ", typeof(karaokeaudio));
        // console.log("karaokeaudio: ", karaokeaudio);
        if(karaokeaudio.paused) {
            karaokeaudio.play();
        } else {
            karaokeaudio.pause();
        }
        karaokeaudio.muted = true;

        if(audioflag != 0)
       {
            if(wavesurfer.isPaused() == true)
            {
                var currenttime = wavesurfer.getCurrentTime();
                console.log("currenttime PLAY: ", currenttime);
                wavesurfer.play(currenttime);

                document.getElementById("play-button").style.display = "none";
                document.getElementById("pause-button").style.display = "block";
            }
            else
            {
                wavesurfer.pause();
                document.getElementById("play-button").style.display = "block";
                document.getElementById("pause-button").style.display = "none";
            }
       }



    },

    playsegment: function() {
        console.log("Play Global action!")
        var regfalg = 0;
        console.log("wavesurfer.isPaused(): ", wavesurfer.isPaused());
        if(wavesurfer.isPaused() == true)
        {
            playfalg = 2;
            var currenttime = wavesurfer.getCurrentTime();
            for(const regionID in wavesurfer.regions.list)
            {
                console.log(currenttime, " ", wavesurfer.regions.list[regionID].start, " ", wavesurfer.regions.list[regionID].end);
                if(roundNum(currenttime) >= roundNum(wavesurfer.regions.list[regionID].start) && roundNum(currenttime) <= roundNum(wavesurfer.regions.list[regionID].end) + 0.1)
                {
                    wavesurfer.play(wavesurfer.regions.list[regionID].start, wavesurfer.regions.list[regionID].end);
                    regfalg = 1;
                }
            }
        }
        else
        {
            playfalg = 0;
            wavesurfer.pause()
        }
    },

    back: function() {
        var karaokeaudio = document.getElementById("audio-karaoke");
        karaokeaudio.currentTime -= 2.05
        wavesurfer.skipBackward();
    },

    forth: function() {
        var karaokeaudio = document.getElementById("audio-karaoke");
        karaokeaudio.currentTime += 2.05
        wavesurfer.skipForward();
    },

    download: function() {
        console.log("Download")
        if(audioflag == 0)
       {
           alert("Please input audio!");
       }
        else {
            wavesurfer.download();
        }
    },

    'toggle-mute': function() {
        wavesurfer.toggleMute();
    },

    "export-annotation" : function (){
        console.log("EXPORT");
        if(audioflag == 0)
       {
           alert("Please input audio!");
       }
        else {
            var select = document.getElementById("export-select");
            var choice = select.value;
            console.log("choice: ", choice);
             var datajson = Object.keys(wavesurfer.regions.list).map(function(id) {
                 let region = wavesurfer.regions.list[id];
                 return {
                     start: region.start,
                     end: region.end,
                     attributes: region.attributes,
                     data: region.data
                 };
             });
            // datajson = JSON.stringify(datajson, null, 4)

            var text = "";

            for(var i = 0; i < datajson.length;i++)
            {
                console.log(datajson[i]);
                console.log(datajson[i].start, datajson[i].end, datajson[i].data.note);
                if(choice == 0)
                {
                    if(datajson[i].data.note == undefined) datajson[i].data.note = "No lyric"
                    text += datajson[i].start + "\t" + datajson[i].end + "\t" + '"'  + datajson[i].data.note + '"' + "\n";
                }
                else
                {
                    var note = datajson[i].data.note;
                    if(note != undefined)
                    {
                        text += note + "\n";
                    }
                }

            }

            console.log(text);

            // Start file download.
            download("annotation.txt",text);
        }
    }

};

// Bind actions to buttons and keypresses
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('keydown', function(e) {
        let map = {
            32: 'play', // space
            37: 'back', // left
            39: 'forth' // right
        };
        let action = map[e.keyCode];
        if (action in GLOBAL_ACTIONS) {
            if (document == e.target || document.body == e.target) {
                e.preventDefault();
            }
            GLOBAL_ACTIONS[action](e);
        }
    });

    [].forEach.call(document.querySelectorAll('[data-action]'), function(el) {
        el.addEventListener('click', function(e) {
            let action = e.currentTarget.dataset.action;
            if (action in GLOBAL_ACTIONS) {
                e.preventDefault();
                GLOBAL_ACTIONS[action](e);
            }
        });
    });
});

// Misc
document.addEventListener('DOMContentLoaded', function() {
    // Web Audio not supported
    if (!window.AudioContext && !window.webkitAudioContext) {
        let demo = document.querySelector('#demo');
        if (demo) {
            demo.innerHTML = '<img src="/example/screenshot.png" />';
        }
    }

    // Navbar links
    let ul = document.querySelector('.nav-pills');
    let pills = ul.querySelectorAll('li');
    let active = pills[0];
    if (location.search) {
        let first = location.search.split('&')[0];
        let link = ul.querySelector('a[href="' + first + '"]');
        if (link) {
            active = link.parentNode;
        }
    }
    active && active.classList.add('active');
});