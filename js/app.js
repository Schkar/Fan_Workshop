document.addEventListener("DOMContentLoaded",function () {
    console.log("Działam");
    
    let audioContext = null;
    let meter = null;
    let rafID = null;
    let mediaStreamSource = null;
    let noMic = document.querySelector(".no_mic");
    let degrees = 0;
    let styleElem = document.head.appendChild(document.createElement("style"));
    let currentHeight = 15;

    document.querySelector(".shroud").addEventListener("mousemove", function(event){    
        styleElem.innerHTML = ".shroud:after {left: "+event.clientX+"px; top: "+event.clientY+"px;}"
    })

    // Retrieve AudioContext with all the prefixes of the browsers
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    // Get an audio context
    audioContext = new AudioContext();

    /**
     * Callback triggered if the microphone permission is denied
     */
    function onMicrophoneDenied() {
        noMic.style.display = "block";
    }

    /**
     * Callback triggered if the access to the microphone is granted
     */
    function onMicrophoneGranted(stream) {
        // Create an AudioNode from the stream.
        mediaStreamSource = audioContext.createMediaStreamSource(stream);
        // Create a new volume meter and connect it.
        meter = createAudioMeter(audioContext);
        mediaStreamSource.connect(meter);

        // Trigger callback that shows the level of the "Volume Meter"
        onLevelChange();
    }

    /**
     * This function is executed repeatedly
     */
    function onLevelChange(time) {
        // set up the next callback
        rafID = window.requestAnimationFrame(onLevelChange);

        let mv = meter.volume
        //console.log(mv);
        degrees = degrees + ~~(mv * 100);
        rotate(degrees);
        powerGaugeChange(mv);
    }

     function rotate(rotation) {
        document.querySelector(".windmil_pic").style.transform = "rotate("+rotation+"deg)";
    }

    let c = document.getElementById("power_gauge");
    let ctx = c.getContext("2d");

    // Create gradient
    let grd = ctx.createLinearGradient(0,300,0,0);
    grd.addColorStop(0.15,"darkred");
    grd.addColorStop(0.2,"red");
    grd.addColorStop(0.5,"orange");
    grd.addColorStop(0.8,"darkgreen");
    grd.addColorStop(1,"lightgreen");
    // Fill with gradient
    ctx.fillStyle = grd;
    
    function powerGaugeChange(number) {
        if (currentHeight <= 0) {
             return false;
         }
        if (number < 0.4) {
            number = 0;
        }
        currentHeight = currentHeight + number;
        console.log(currentHeight);
        if (currentHeight >= 280) {
            currentHeight = 281;
        }
        opacity = 1-((1/2.8)*currentHeight)/100;
        document.querySelector(".shroud").style.opacity = opacity;
        numberToIncrease = -(currentHeight);
        ctx.clearRect(0,0,100,300)
        ctx.fillRect(10,295,80,numberToIncrease);
    }

    powerInterval = setInterval( () => {
        currentHeight = currentHeight - 0.5;
        if (currentHeight <= 0 || currentHeight >= 280) {
             clearInterval(powerInterval);
        }
        opacity = 1-((1/2.8)*currentHeight)/100;
        document.querySelector(".shroud").style.opacity = opacity;
        change(currentHeight)
    },100);
    
    function change(number){
        ctx.clearRect(0,0,100,300)
        ctx.fillRect(10,280,80,-number);
    }    

    // Try to get access to the microphone
    try {

        // Retrieve getUserMedia API with all the prefixes of the browsers
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        // Ask for an audio input
        navigator.getUserMedia(
            {
                "audio": {
                    "mandatory": {
                        "googEchoCancellation": "false",
                        "googAutoGainControl": "false",
                        "googNoiseSuppression": "false",
                        "googHighpassFilter": "false"
                    },
                    "optional": []
                },
            },
            onMicrophoneGranted,
            onMicrophoneDenied
        );
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }
});