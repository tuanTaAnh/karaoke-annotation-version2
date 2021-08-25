/**
 * wavesurfer.js
 *
 * https://github.com/katspaugh/wavesurfer.js
 *
 * This work is licensed under a Creative Commons Attribution 3.0 Unported License.
 */

'use strict';

var WaveSurfer = {
    defaultParams: {
        height        : 128,
        waveColor     : '#999',
        progressColor : '#555',
        cursorColor   : '#333',
        cursorWidth   : 1,
        skipLength    : 2,
        minPxPerSec   : 20,
        pixelRatio    : window.devicePixelRatio,
        fillParent    : true,
        scrollParent  : false,
        hideScrollbar : false,
        normalize     : false,
        audioContext  : null,
        container     : null,
        dragSelection : true,
        loopSelection : true,
        audioRate     : 1,
        interact      : true,
        splitChannels : false,
        renderer      : 'Canvas',
        backend       : 'WebAudio',
        mediaType     : 'audio',
        downloadstart : -1,
        downloadend : -1
    },

    init: function (params) {
        console.log("Init");
        // Extract relevant parameters (or defaults)
        this.params = WaveSurfer.util.extend({}, this.defaultParams, params);

        this.container = 'string' == typeof params.container ?
            document.querySelector(this.params.container) :
            this.params.container;

        if (!this.container) {
            throw new Error('Container element not found');
        }

        if (typeof this.params.mediaContainer == 'undefined') {
            this.mediaContainer = this.container;
        } else if (typeof this.params.mediaContainer == 'string') {
            this.mediaContainer = document.querySelector(this.params.mediaContainer);
        } else {
            this.mediaContainer = this.params.mediaContainer;
        }

        if (!this.mediaContainer) {
            throw new Error('Media Container element not found');
        }

        // Used to save the current volume when muting so we can
        // restore once unmuted
        this.savedVolume = 0;
        // The current muted state
        this.isMuted = false;
        // Will hold a list of event descriptors that need to be
        // cancelled on subsequent loads of audio
        this.tmpEvents = [];

        this.createDrawer();
        this.createBackend();
    },

    createDrawer: function () {
        var my = this;

        this.drawer = Object.create(WaveSurfer.Drawer[this.params.renderer]);
        this.drawer.init(this.container, this.params);

        this.drawer.on('redraw', function () {
            my.drawBuffer();
            my.drawer.progress(my.backend.getPlayedPercents());
        });

        // Click-to-seek
        this.drawer.on('click', function (e, progress) {
            setTimeout(function () {
                my.seekTo(progress);
            }, 0);
        });

        // Relay the scroll event from the drawer
        this.drawer.on('scroll', function (e) {
            my.fireEvent('scroll', e);
        });
    },

    createBackend: function () {
        var my = this;

        if (this.backend) {
            this.backend.destroy();
        }

        // Back compat
        if (this.params.backend == 'AudioElement') {
            this.params.backend = 'MediaElement';
        }

        if (this.params.backend == 'WebAudio' && !WaveSurfer.WebAudio.supportsWebAudio()) {
            this.params.backend = 'MediaElement';
        }

        this.backend = Object.create(WaveSurfer[this.params.backend]);
        this.backend.init(this.params);

        this.backend.on('finish', function () {
            my.fireEvent('finish');
        });

        this.backend.on('audioprocess', function (time) {
            my.fireEvent('audioprocess', time);
        });
    },

    restartAnimationLoop: function () {
        var my = this;
        var requestFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame;
        var frame = function () {
            if (!my.backend.isPaused()) {
                my.drawer.progress(my.backend.getPlayedPercents());
                requestFrame(frame);
            }
        };
        frame();
    },

    getDuration: function () {
        return this.backend.getDuration();
    },

    getCurrentTime: function () {
        return this.backend.getCurrentTime();
    },

    play: function (start, end) {
        console.log("PLAY PLAY PLAY: ", start, " ", end, " ", playfalg);

        var loopcheckbox = document.getElementById("loop-checkbox");


        if(start != undefined)
        {
            this.downloadstart = start;
            this.downloadend = end;

            var karaokeaudio = document.getElementById("audio-karaoke");
            karaokeaudio.currentTime = start;

            if(playfalg == 2)
            {
                var intervelflag = 0;
                setInterval(function(){
                    // console.log("wavesurfer.getCurrentTime(): ", wavesurfer.getCurrentTime());

                    if(karaokeaudio.currentTime>=end)
                    {
                        if(playfalg == 2 && loopcheckbox.checked)
                        {
                            intervelflag = 0;
                            console.log("1");
                            var currenttime = wavesurfer.getCurrentTime();
                            console.log("currenttime PLAY: ", currenttime);
                            // karaokeaudio.currentTime = start;
                            wavesurfer.play(start, end);
                        }
                        else if(playfalg == 2 && intervelflag != 1)
                        {
                            intervelflag = 1;
                            console.log("2");
                            var currenttime = wavesurfer.getCurrentTime();
                            console.log("currenttime PLAY: ", currenttime);
                            karaokeaudio.pause();
                            wavesurfer.backend.setTime(karaokeaudio.currentTime);
                        }
                    }
                },100);
            }

            if(karaokeaudio.paused)
            {
                karaokeaudio.play();
            }

        }


        this.backend.play(start, end);
        console.log("PLAY", start);
        console.log("loopcheckbox", loopcheckbox.checked);
        if(start != undefined && playfalg == 2)
        {
            console.log("playfalg");
            this.backend.play(start, end);
        }
        else
        {
            this.backend.play(start);
        }
        this.restartAnimationLoop();
        this.fireEvent('play');
    },

    pause: function () {
        console.log("wavesurfer.getCurrentTime()1: ", wavesurfer.getCurrentTime());
        this.backend.pause();
        console.log("wavesurfer.getCurrentTime()2: ", wavesurfer.getCurrentTime());
        this.fireEvent('pause');
        console.log("wavesurfer.getCurrentTime()3: ", wavesurfer.getCurrentTime());
    },

    playPause: function () {
        console.log("this.backend.isPaused(): ", this.backend.isPaused());
        this.backend.isPaused() ? this.play() : this.pause();
    },

    isPaused: function ()
    {
        return this.backend.isPaused();
    },


    skipBackward: function (seconds) {
        console.log("this.params.skipLength: ", this.params.skipLength)
        this.skip(-seconds || -this.params.skipLength);
    },

    skipForward: function (seconds) {
        console.log("this.params.skipLength: ", this.params.skipLength)
        this.skip(seconds || this.params.skipLength);
    },

    skip: function (offset) {
        var position = this.getCurrentTime() || 0;
        var duration = this.getDuration() || 1;
        position = Math.max(0, Math.min(duration, position + (offset || 0)));
        this.seekAndCenter(position / duration);
    },

    seekAndCenter: function (progress) {
        this.seekTo(progress);
        this.drawer.recenter(progress);
    },

    seekTo: function (progress) {
        // console.log("seekTo");
        var paused = this.backend.isPaused();
        // avoid small scrolls while paused seeking
        var oldScrollParent = this.params.scrollParent;
        if (paused) {
            this.params.scrollParent = false;
        }

        // this.downloadstart

        this.backend.seekTo(progress * this.getDuration());
        this.drawer.progress(this.backend.getPlayedPercents());

        // console.log("this.backend.getPlayedPercents(): ", this.backend.getPlayedPercents())

        var karaokeaudio = document.getElementById("audio-karaoke");
        karaokeaudio.currentTime = this.backend.getPlayedPercents()*karaokeaudio.duration;

        if (!paused) {
            this.backend.pause();
            this.backend.play();
        }
        this.params.scrollParent = oldScrollParent;
        this.fireEvent('seek', progress);
    },

    stop: function () {
        this.pause();
        this.seekTo(0);
        this.drawer.progress(0);
    },

    /**
     * Set the playback volume.
     *
     * @param {Number} newVolume A value between 0 and 1, 0 being no
     * volume and 1 being full volume.
     */
    setVolume: function (newVolume) {
        this.backend.setVolume(newVolume);
    },

    /**
     * Set the playback rate.
     *
     * @param {Number} rate A positive number. E.g. 0.5 means half the
     * normal speed, 2 means double speed and so on.
     */
    setPlaybackRate: function (rate) {
        this.backend.setPlaybackRate(rate);
    },

    /**
     * Toggle the volume on and off. It not currenly muted it will
     * save the current volume value and turn the volume off.
     * If currently muted then it will restore the volume to the saved
     * value, and then rest the saved value.
     */
    toggleMute: function () {
        if (this.isMuted) {
            // If currently muted then restore to the saved volume
            // and update the mute properties
            this.backend.setVolume(this.savedVolume);
            this.isMuted = false;
        } else {
            // If currently not muted then save current volume,
            // turn off the volume and update the mute properties
            this.savedVolume = this.backend.getVolume();
            this.backend.setVolume(0);
            this.isMuted = true;
        }
    },

    toggleScroll: function () {
        this.params.scrollParent = !this.params.scrollParent;
        this.drawBuffer();
    },

    toggleInteraction: function () {
        this.params.interact = !this.params.interact;
    },

    drawBuffer: function () {
        console.log("drawBuffer");
        var nominalWidth = Math.round(
            this.getDuration() * this.params.minPxPerSec * this.params.pixelRatio
        );
        console.log("nominalWidth: ", nominalWidth);
        var parentWidth = this.drawer.getWidth();
        var width = nominalWidth;

        console.log("parentWidth: ", parentWidth);

        // Fill container
        if (this.params.fillParent && (!this.params.scrollParent || nominalWidth < parentWidth)) {
            width = parentWidth;
        }

        var peaks = this.backend.getPeaks(width);
        // console.log("this.backend: ", this.backend);
        this.drawer.drawPeaks(peaks, width);
        this.fireEvent('redraw', peaks, width);

        console.log("END drawBuffer");
    },

    /**
     * Internal method
     */
    loadArrayBuffer: function (arraybuffer) {
        console.log("loadArrayBuffer")
        this.decodeArrayBuffer(arraybuffer, function (data) {
            this.loadDecodedBuffer(data);
        }.bind(this));
    },

    UploadloadDecodedBuffer: function (buffer) {
        this.backend.load(buffer);
        console.log("UploadloadDecodedBuffer OK");
        this.drawBuffer();
        console.log("START UPDLOAD");
        this.fireEvent('ready');
        this.fireEvent('upload');
        console.log("END UploadloadDecodedBuffer");
    },

    UploadArrayBuffer: function (arraybuffer) {
        console.log("UploadArrayBuffer");
        this.decodeArrayBuffer(arraybuffer, function (data) {
            this.UploadloadDecodedBuffer(data);
        }.bind(this));
    },

    /**
     * Directly load an externally decoded AudioBuffer.
     */
    loadDecodedBuffer: function (buffer) {
        console.log("this.backend: ", this.backend);
        this.backend.load(buffer);
        console.log("OKOK");
        this.drawBuffer();
        this.fireEvent('ready');
    },

    /**
     * Loads audio data from a Blob or File object.
     *
     * @param {Blob|File} blob Audio data.
     */
    loadBlob: function (blob) {
        console.log("loadBlob function");
        var my = this;
        // Create file reader
        var reader = new FileReader();

        reader.addEventListener('progress', function (e) {
            console.log("'progress reader");
            my.onProgress(e);
        });

        reader.addEventListener('load', function (e) {
            console.log("reader.addEventListener: wavesurfer!", e.target.result);
            my.UploadArrayBuffer(e.target.result);
        });

        reader.addEventListener('error', function () {
            my.fireEvent('error', 'Error reading file');
        });

        reader.readAsArrayBuffer(blob);

        this.empty();
    },

    /**
     * Loads audio and rerenders the waveform.
     */
    load: function (url, peaks) {
        switch (this.params.backend) {
            case 'WebAudio': return this.loadBuffer(url);
            case 'MediaElement': return this.loadMediaElement(url, peaks);
        }
    },

    /**
     * Loads audio using Web Audio buffer backend.
     */
    loadBuffer: function (url) {
        this.empty();
        // load via XHR and render all at once
        return this.getArrayBuffer(url, this.loadArrayBuffer.bind(this));
    },

    loadMediaElement: function (url, peaks) {
        this.empty();
        this.backend.load(url, this.mediaContainer, peaks);

        this.tmpEvents.push(
            this.backend.once('canplay', (function () {
                this.drawBuffer();
                this.fireEvent('ready');
            }).bind(this)),

            this.backend.once('error', (function (err) {
                this.fireEvent('error', err);
            }).bind(this))
        );


        // If no pre-decoded peaks provided, attempt to download the
        // audio file and decode it with Web Audio.
        if (!peaks && this.backend.supportsWebAudio()) {
            this.getArrayBuffer(url, (function (arraybuffer) {
                console.log("getArrayBuffer");
                this.decodeArrayBuffer(arraybuffer, (function (buffer) {
                    this.backend.buffer = buffer;
                    this.drawBuffer();
                }).bind(this));
            }).bind(this));
        }
    },

    decodeArrayBuffer: function (arraybuffer, callback) {
        this.backend.decodeArrayBuffer(
            arraybuffer,
            this.fireEvent.bind(this, 'decoded'),
            this.fireEvent.bind(this, 'error', 'Error decoding audiobuffer')
        );
        this.tmpEvents.push(
            this.once('decoded', callback)
        );
    },

    getArrayBuffer: function (url, callback) {
        var my = this;
        var ajax = WaveSurfer.util.ajax({
            url: url,
            responseType: 'arraybuffer'
        });
        this.tmpEvents.push(
            ajax.on('progress', function (e) {
                my.onProgress(e);
            }),
            ajax.on('success', callback),
            ajax.on('error', function (e) {
                my.fireEvent('error', 'XHR error: ' + e.target.statusText);
            })
        );
        return ajax;
    },

    onProgress: function (e) {
        if (e.lengthComputable) {
            var percentComplete = e.loaded / e.total;
        } else {
            // Approximate progress with an asymptotic
            // function, and assume downloads in the 1-3 MB range.
            percentComplete = e.loaded / (e.loaded + 1000000);
        }
        this.fireEvent('loading', Math.round(percentComplete * 100), e.target);
    },

    /**
     * Exports PCM data into a JSON array and opens in a new window.
     */
    exportPCM: function (length, accuracy, noWindow) {
        length = length || 1024;
        accuracy = accuracy || 10000;
        noWindow = noWindow || false;
        var peaks = this.backend.getPeaks(length, accuracy);
        var arr = [].map.call(peaks, function (val) {
            return Math.round(val * accuracy) / accuracy;
        });
        var json = JSON.stringify(arr);
        if (!noWindow) {
            window.open('data:application/json;charset=utf-8,' +
                encodeURIComponent(json));
        }
        return json;
    },

    clearTmpEvents: function () {
        this.tmpEvents.forEach(function (e) { e.un(); });
    },

    /**
     * Display empty waveform.
     */
    empty: function () {
        if (!this.backend.isPaused()) {
            this.stop();
            this.backend.disconnectSource();
        }
        this.clearTmpEvents();
        this.drawer.progress(0);
        this.drawer.setWidth(0);
        this.drawer.drawPeaks({ length: this.drawer.getWidth() }, 0);
    },

    /**
     * zoom waveform.
     */
    zoom: function(pxPerSec) {
        console.log("pxPerSec: ", pxPerSec);
      if (!pxPerSec) {
        this.params.minPxPerSec = this.defaultParams.minPxPerSec;
        this.params.scrollParent = false;
      } else {
        this.params.minPxPerSec = pxPerSec;
        this.params.scrollParent = true;
      }

      this.drawBuffer();
      this.drawer.progress(this.backend.getPlayedPercents());
      this.drawer.recenter(this.getCurrentTime() / this.getDuration());
      this.fireEvent('zoom', pxPerSec);

      var lyrics = [];
      for(const regionID in wavesurfer.regions.list)
      {

            var start = wavesurfer.regions.list[regionID]["start"];
            var end = wavesurfer.regions.list[regionID]["end"];
            var data = wavesurfer.regions.list[regionID]["data"];
            var color = wavesurfer.regions.list[regionID]["color"];
            var region = {"start": start, "end": end, "color": color, "data": data};

            console.log("region: ", region);
            lyrics.push(region);
      }
      loadRegions(lyrics);
      saveRegions();
    },

    /**
     * Remove events, elements and disconnect WebAudio nodes.
     */

    destroy: function () {
        this.fireEvent('destroy');
        this.clearTmpEvents();
        this.unAll();
        this.backend.destroy();
        this.drawer.destroy();
    },

    download: function () {
        console.log("WaveForm download");
        console.log("AudioBuffer: ", this.backend.buffer);
        console.log("this.downloadstart: ", this.downloadstart);
        var karaokeaudio = document.getElementById("audio-karaoke");

        // for()
        console.log("wavesurfer.regions.list: ", typeof(wavesurfer.regions.list));

        for (const child of Object.keys(wavesurfer.regions.list))
        {
             var region = wavesurfer.regions.list[child];
             console.log("region: ", region);

            var start = region.start;
            var end = region.end;

            if(start < end)
            {
                var annotation = region.data.note.split(" ");
                console.log("annotation: ", annotation);

                var filename = "";
                var i = 0;
                for(const char in annotation)
                {
                    filename += annotation[char] + "_";
                    i++;
                    if(i > 5) break;
                }

                filename = filename.substring(0, filename.length - 1);
                filename += ".mp3"

                console.log("this.downloadstart: ", start);
                console.log("this.downloadend: ", end);

                var newArrayBuffer = this.AudioBufferSlice(this.backend.buffer, start, end);

                console.log("newArrayBuffer: ", newArrayBuffer)

                this.BlobDownload(newArrayBuffer, filename)
            }
        }


        // if(this.downloadstart != -1 && this.downloadstart !=  undefined && karaokeaudio.currentTime >= this.downloadstart && karaokeaudio.currentTime <= this.downloadend)
        // {
        //     var begin = this.downloadstart;
        //     var end = this.downloadend;
        //
        //     console.log("this.downloadstart: ", this.downloadstart);
        //     console.log("this.downloadend: ", this.downloadend);
        //
        //     var newArrayBuffer = this.AudioBufferSlice(this.backend.buffer, begin, end);
        //
        //     console.log("newArrayBuffer: ", newArrayBuffer)
        //
        //     this.BlobDownload(newArrayBuffer)
        // }
        // else
        // {
        //     alert("Please select annotation area!");
        // }
    },

    AudioBufferSlice: function(buffer, begin, end) {
              // if (!(this instanceof AudioBufferSlice)) {
              //   return new AudioBufferSlice(buffer, begin, end);
              // }

            var audioContext = new (window.AudioContext || window.webkitAudioContext);
            // var source = audioContext.createBufferSource();

            var error = null;

            var duration = buffer.duration;
            var channels = buffer.numberOfChannels;
            var rate = buffer.sampleRate;


            var startOffset = rate * begin;
            var endOffset = rate * end;
            var frameCount = endOffset - startOffset;
            var newArrayBuffer;

            try {
                if (begin < 0) {
                    error = new RangeError('begin time must be greater than 0');
                }

                if (end > duration) {
                    error = new RangeError('end time must be less than or equal to ' + duration);
                }

                newArrayBuffer = audioContext.createBuffer(channels, endOffset - startOffset, rate);
                var anotherArray = new Float32Array(frameCount);
                var offset = 0;

                for (var channel = 0; channel < channels; channel++) {
                  buffer.copyFromChannel(anotherArray, channel, startOffset);
                  newArrayBuffer.copyToChannel(anotherArray, channel, offset);
                }

                return newArrayBuffer;

            } catch(e) {
                error = e;
                console.log("error: ", error);
            }


        },

    BlobDownload: function(audioBuffer, filename){
        console.log("audioBuffer: ", audioBuffer)
        // Float32Array samples
        const [left, right] =  [audioBuffer.getChannelData(0), audioBuffer.getChannelData(1)]

        // interleaved
        const interleaved = new Float32Array(left.length + right.length)
        for (let src=0, dst=0; src < left.length; src++, dst+=2) {
          interleaved[dst] =   left[src]
          interleaved[dst+1] = right[src]
        }

        // get WAV file bytes and audio params of your audio source
        const wavBytes = this.getWavBytes(interleaved.buffer, {
          isFloat: true,       // floating point or 16-bit integer
          numChannels: 2,
          sampleRate: 44100,
        })

        const wav = new Blob([wavBytes], { type: 'audio/wav' })
        var urlObject = URL.createObjectURL(wav)

        console.log("urlObject: ", urlObject)

        var n = document.createElement("a");
        n.href = urlObject;
        n.download = filename;
        n.click()

    },

    // Returns Uint8Array of WAV bytes
    getWavBytes: function(buffer, options) {
        const type = options.isFloat ? Float32Array : Uint16Array
        const numFrames = buffer.byteLength / type.BYTES_PER_ELEMENT

        const headerBytes = this.getWavHeader(Object.assign({}, options, { numFrames }))
        const wavBytes = new Uint8Array(headerBytes.length + buffer.byteLength);

        // prepend header, then add pcmBytes
        wavBytes.set(headerBytes, 0)
        wavBytes.set(new Uint8Array(buffer), headerBytes.length)

        return wavBytes
    },

    getWavHeader: function(options) {
        const numFrames =      options.numFrames
        const numChannels =    options.numChannels || 2
        const sampleRate =     options.sampleRate || 44100
        const bytesPerSample = options.isFloat? 4 : 2
        const format =         options.isFloat? 3 : 1

        const blockAlign = numChannels * bytesPerSample
        const byteRate = sampleRate * blockAlign
        const dataSize = numFrames * blockAlign

        const buffer = new ArrayBuffer(44)
        const dv = new DataView(buffer)

        let p = 0

        function writeString(s) {
        for (let i = 0; i < s.length; i++) {
          dv.setUint8(p + i, s.charCodeAt(i))
        }
        p += s.length
        }

        function writeUint32(d) {
        dv.setUint32(p, d, true)
        p += 4
        }

        function writeUint16(d) {
        dv.setUint16(p, d, true)
        p += 2
        }

        writeString('RIFF')              // ChunkID
        writeUint32(dataSize + 36)       // ChunkSize
        writeString('WAVE')              // Format
        writeString('fmt ')              // Subchunk1ID
        writeUint32(16)                  // Subchunk1Size
        writeUint16(format)              // AudioFormat
        writeUint16(numChannels)         // NumChannels
        writeUint32(sampleRate)          // SampleRate
        writeUint32(byteRate)            // ByteRate
        writeUint16(blockAlign)          // BlockAlign
        writeUint16(bytesPerSample * 8)  // BitsPerSample
        writeString('data')              // Subchunk2ID
        writeUint32(dataSize)            // Subchunk2Size

        return new Uint8Array(buffer)
    }

};

WaveSurfer.create = function (params) {
    var wavesurfer = Object.create(WaveSurfer);
    wavesurfer.init(params);
    return wavesurfer;
};