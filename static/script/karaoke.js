var aud = document.getElementById('audio-karaoke');
var karaoke = document.getElementById('karaoke');
var startTime, endTime = 0;
var karaText, karaTextHighlight;

var audInterval;

function readTextFile(file) {
    const words = [["", -1, -1]];

    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function()
    {
        if (rawFile.readyState === 4 && rawFile.status == "200")
        {
            var data = JSON.parse(rawFile.responseText);
            data.forEach(function(annotation)
            {

                if(annotation.data.note == undefined){
                    annotation.data.note = "";
                }

                const lyric = [annotation.data.note, annotation.end, annotation.start];
                words.push(lyric);
            });

        }
    }

    rawFile.send(null);

    console.log("words", words);

    for(var i = 0;i < words.length;i++)
    {
        console.log("words", words[i]);
    }

    return words;
}

words =  readTextFile("/static/json/annotations.json");


aud.addEventListener('play', function() {
  audInterval = setInterval(function() {

        var interval = getStartEnd(aud.currentTime);
        startTime = interval[0];
        endTime = interval[1];
        var word = interval[2];

        karaText.textContent = word;
        karaTextHighlight.textContent = word;
        karaTextHighlight.style.width = '0%';

        var duration = endTime - startTime;
        var ratio = ((100 / duration) * (endTime - aud.currentTime)) - 100;
        karaTextHighlight.style.width = ratio * -1 + '%';

  }, 1000/60);
});

var getStartEnd = function (current_time){

    for(var i = 0;i < words.length;i++)
    {
        if(current_time >= words[i][2] && current_time <= words[i][1])
        {
            return [words[i][2], words[i][1], words[i][0]];
        }
    }
    return [-1, -1, ""];
}

var init = function(words) {

    console.log("words init: ", words);

    var word = words[0];
    console.log("word init: ", word);

    karaText = document.createTextNode(word[0]);

    var karaTextLine = document.createElement('div');
    karaTextLine.classList.add('kara-text');

    karaTextHighlight = document.createElement('div');
    karaTextHighlight.classList.add('kara-text-highlight');
    karaTextHighlight.textContent = word[0];
    karaTextHighlight.style.width = '0%';

    karaTextLine.appendChild(karaText);
    console.log("karaText: ", karaText)
    karaTextLine.appendChild(karaTextHighlight);
    console.log("karaTextHighlight: ", karaTextHighlight)

    karaoke.appendChild(karaTextLine);
    console.log("karaTextLine: ", karaTextLine)

    startTime = word[1];
    endTime = word[2];
}


init(words);

// tell the embed parent frame the height of the content
if (window.parent && window.parent.parent){
window.parent.parent.postMessage(["resultsFrame", {
  height: document.body.getBoundingClientRect().height,
  slug: "k7z2086g"
}], "*")
}

// always overwrite window.name, in case users try to set it manually
window.name = "result"



// if ((aud.currentTime - startTime) >= 0 && nIndex < words.length)
// {
//   var duration = endTime - startTime;
//   if (endTime - aud.currentTime > 0)
//   {
//         var ratio = ((100 / duration) * (endTime - aud.currentTime)) - 100;
//         karaTextHighlight.style.width = ratio * -1 + '%';
//   }
//   else if(aud.currentTime < startNextTime)
//   {
//       setUnAnnotation();
//   }
//   else
//   {
//       console.log("startNextTime: ", startNextTime);
//       nIndex++;
//       nextWord(nIndex);
//   }
// }
// aud.addEventListener('pause', function() {
//   clearInterval(audInterval);
// });
//
// aud.addEventListener('seeked', function() {
//     console.log("addEventListener");
//     nIndex = findWordIndex();
//     if (!words[nIndex]) {
//     return;
//     }
//
//     console.log("")
//     nextWord(nIndex);
// });
// var setUnAnnotation = function(){
//
//     karaText.textContent = "";
//     karaTextHighlight.textContent = "";
//     karaTextHighlight.style.width = '0%';
// }
//
// var nextWord = function(index) {
//   if (!words[nIndex]) {
//     return;
//   }
//
//   var word = words[index];
//   console.log("index: ", index);
//   console.log("word: ", word);
//
//   karaText.textContent = word[0];
//   karaTextHighlight.textContent = word[0];
//   karaTextHighlight.style.width = '0%';
//
//   startTime = word[2];
//   endTime = word[1];
//
//   if (!words[nIndex+1]) {
//     return;
//   }
//
//   var wordmext = words[nIndex+1];
//
//   startNextTime = wordmext[2];
//
// }
//
// var findWordIndex = function() {
//   if (aud.currentTime === 0) {
//     return 0;
//   }
//   for (var i = 0; i < words.length; i++) {
//     if (aud.currentTime >= words[i][1] && aud.currentTime <= words[i][2]) {
//       return i;
//     } else if (words[i][1] >= aud.currentTime) {
//       return i;
//     }
//   }
//   return words.length;
// }