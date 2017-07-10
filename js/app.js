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
    let backupButton = document.querySelector(".button_to_smash");
    let c = document.getElementById("power_gauge");
    let ctx = c.getContext("2d");
    let heightOfGauge = c.scrollHeight > 200 ? 280 : 140;
    let numberToDivideOpacityBy = c.scrollHeight > 200 ? 2.8 : 1.4;
    let textArray = 
        [
            "Welcome to our PowerPlant!",
            "This is main control room.",
            "Here we didly-do some technical stuff, which you won't understand, because you aren't scientist, like me",
            "Don't touch anything! You may break the PowerPlant!",
            "And if you do, the whole world will drown in darkness!",
            "So, just don't break anything",
            "Oops, I have to charge my phone. Where is the socket?",
            "Oh, here it is. *click*",
            "Oops...",
            "Quick! Something broke. You need to save us!",
            "Here, have a flashlight",
            "We have a backup power system!",
            "To your left, there is a power gauge.",
            "In the middle there is an emergency windmill.",
            "Since we are inside the building and there is no wind, you will have to use your breath.",
            "Quick! Save us!"
        ];

    let successText = 
        [
            "Phew! We are saved!",
            "It's good I was on the post.",
            "If I hadn't been here, we would have most certainly died!",
            "But that is just my job, as a scientist, no need to thank me.",
            "Let's get out of here before anyone notices any problems."
        ];

    let failureText = "Oh no. You failed:(. There is no hope for us now...";

    let speechBubble = document.querySelector(".speech_bubble");

    let textToShow = "";

    function speller(text) {
        let textLength = text.length;
        if (textToShow.length === text.length) {
            clearInterval(spellerInterval)
            textToShow = "";
            return;
        }
        textToShow = text.substring(0,textToShow.length + 1);
        speechBubble.innerText = textToShow;    
    }

    spellerInterval = setInterval( () => {   
        speller(failureText) 
    },50)
    

    // Create gradient
    let grd = ctx.createLinearGradient(0,c.scrollHeight,0,0);
    grd.addColorStop(0.15,"darkred");
    grd.addColorStop(0.2,"red");
    grd.addColorStop(0.5,"orange");
    grd.addColorStop(0.8,"darkgreen");
    grd.addColorStop(1,"lightgreen");
    // Fill with gradient
    ctx.fillStyle = grd;

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
        degrees = degrees + ~~(mv * 100);
        rotate(degrees);
        powerGaugeChange(mv);
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

    function rotate(rotation) {
        document.querySelector(".windmil_pic").style.transform = "rotate("+rotation+"deg)";
        //window.requestAnimationFrame(rotate)
    }
    
    function powerGaugeChange(number) {
        if (currentHeight <= 0) {
             return false;
         }
        if (number < 0.4) {
            number = 0;
        }
        currentHeight = currentHeight + number;
        if (currentHeight >= heightOfGauge) {
            currentHeight = heightOfGauge + 1;
        }
        opacity = 1-((1/numberToDivideOpacityBy)*currentHeight)/100;
        document.querySelector(".shroud").style.opacity = opacity;
        numberToIncrease = currentHeight;
        change(numberToIncrease)
    }

    powerInterval = setInterval( () => {
        currentHeight = currentHeight - 0.5;
        if (currentHeight <= 0 || currentHeight >= heightOfGauge) {
             clearInterval(powerInterval);
             return;
        }
        opacity = 1-((1/numberToDivideOpacityBy)*currentHeight)/100;
        document.querySelector(".shroud").style.opacity = opacity;
        change(currentHeight)
    },100);
    
    function change(number){
        ctx.clearRect(0,0,c.scrollWidth,c.scrollHeight)
        ctx.fillRect(10,scrollHeight-5,c.scrollWidth-10,-number);
    }

    backupButton.addEventListener("click",function(e){
        e.preventDefault();
        let noMicValue = Math.random();
        degrees = degrees + ~~(noMicValue * 1000);
        rotate(degrees);
        powerGaugeChange(noMicValue * 5);
    }); 

    backupButton.addEventListener("touch",function(e){
        e.preventDefault();
        let noMicValue = Math.random();
        degrees = degrees + ~~(noMicValue * 1000);
        rotate(degrees);
        powerGaugeChange(noMicValue * 5);
    }); 
});