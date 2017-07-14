document.addEventListener("DOMContentLoaded",function () {
    //TODO: Uncomment whole talking section
    //TODO: Fixes
    
    let audioContext = null;
    let meter = null;
    let rafID = null;
    let mediaStreamSource = null;
    let noMic = document.querySelector(".no_mic");
    let degrees = 0;
    let styleElem = document.head.appendChild(document.createElement("style"));
    let currentHeight = 35;
    let backupButton = document.querySelector(".button_to_smash");
    let c = document.getElementById("power_gauge");
    let ctx = c.getContext("2d");
    let heightOfGauge = c.scrollHeight > 200 ? 280 : 140;
    let numberToDivideOpacityBy = c.scrollHeight > 200 ? 2.8 : 1.4;
    let micValue = true;
    let shouldIStart = false;
    let scientistHead = document.querySelector(".upper_scientist");
    let textArray = 
        [
            "Welcome to our PowerPlant!",
            "This is main control room.",
            "Here we didly-do some technical stuff, which you won't understand, because you aren't scientist, like me",
            "Don't touch anything! You may break the PowerPlant!",
            "And if you do, the whole world will drown in darkness!",
            "So, just don't break anything",
            "*Gasp*, I have to charge my phone. Where is the socket?",
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
    let failureText = ["Oh no. You failed:(. There is no hope for us now..."];
    let speechBubble = document.querySelector(".speech_bubble");
    let textToShow = "";
    let generalCounter = 0;
    let successCounter = 0;
    scientistHead.style.animationPlayState = "paused";

    // Function with promise to spell text in message bubble
        let speller = (data) => {
            scientistHead.style.animationPlayState = "running";
            if (data.text[data.counter].indexOf("Oops") >= 0) {
                document.querySelector(".shroud").style.display = "block";
            }
            if (data.text[data.counter].indexOf("flashlight") >= 0) {
                document.querySelector(".shroud").style.backgroundColor = "transparent";
                c.style.display = "block";
                document.querySelector(".windmil_pic").style.display = "block"
                micValue ? null : noMic.style.display = "block";
                shouldIStart = true;
            }
            let textPromise = new Promise((resolve) => {
                textInterval = setInterval( () => {
                    let textLength = data.text[data.counter].length;
                    if (textToShow.length === data.text[data.counter].length) {
                        //scientistHead.addEventListener("animationiteration", () => {
                            scientistHead.style.animationPlayState = "paused"; //FIXME: first animation plays nice. Next speller however works only once...
                        //})
                        clearInterval(textInterval)
                        textToShow = "";
                        return true;
                    }
                    textToShow = data.text[data.counter].substring(0,textToShow.length + 1);
                    speechBubble.innerText = textToShow;
                },30);
                setTimeout(function(){
                    resolve({text: data.text, counter: data.counter + 1});
                }, data.text[data.counter].length*50+1000);
            });
            return textPromise;
        }
    // Speaking section of promise chain...
        speller({text: textArray, counter: 0})
        .then(speller)
        .then(speller)
        .then(speller)
        .then(speller)
        .then(speller)
        .then(speller)
        .then(speller)
        .then(speller) //<----- Oops
        .then(speller)
        .then(speller)
        .then(speller) //<----- Flashlight
        .then(speller)
        .then(speller)
        .then(speller)
        .then(speller)
        .then(speller)

    // Create gradient
        let grd = ctx.createLinearGradient(0,c.scrollHeight,0,0);
        grd.addColorStop(0.15,"darkred");
        grd.addColorStop(0.2,"red");
        grd.addColorStop(0.5,"orange");
        grd.addColorStop(0.8,"darkgreen");
        grd.addColorStop(1,"lightgreen");
    // Fill with gradient
        ctx.fillStyle = grd;

    // Flashlight functionality
        document.querySelector(".shroud").addEventListener("mousemove", function(event){
            let x = event.clientX - 75;
            let y = event.clientY - 75;
            micValue ? styleElem.innerHTML = ".shroud:after {left: "+ x +"px; top: "+ y +"px;}" : styleElem.innerHTML = ".shroud:after {left: "+ x +"px; top: "+ y +"px; cursor: initial}"  //FIXME: This needs mouse control checking... - can't click on button! This is the case of z-index
        })
    
    // Retrieve AudioContext with all the prefixes of the browsers
        window.AudioContext = window.AudioContext || window.webkitAudioContext;

    // Get an audio context
        audioContext = new AudioContext();

    // Callback triggered if the microphone permission is denied
        function onMicrophoneDenied() {
        micValue = false;
        }

    // Callback triggered if the access to the microphone is granted
        function onMicrophoneGranted(stream) {
            // Create an AudioNode from the stream.
            mediaStreamSource = audioContext.createMediaStreamSource(stream);
            // Create a new volume meter and connect it.
            meter = createAudioMeter(audioContext);
            mediaStreamSource.connect(meter);

            // Trigger callback that shows the level of the "Volume Meter"
            onLevelChange();
        }

    // This function is executed repeatedly
        function onLevelChange(time) {
            // set up the next callback
            rafID = window.requestAnimationFrame(onLevelChange);
            if (shouldIStart) {
                let mv = meter.volume
                degrees = degrees + ~~(mv * 100);
                rotate(degrees);
                powerGaugeChange(mv); 
            }
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
    // Rotation function
        function rotate(rotation) {
            document.querySelector(".windmil_pic").style.transform = "rotate("+rotation+"deg)";
            //window.requestAnimationFrame(rotate)
        }

    // Power gauge changing function
    
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

    // Interval for gradually decreasing power gauge

        powerInterval = setInterval( () => {
            return
            if (shouldIStart === false) {
                currentHeight = currentHeight;
                return;
            }
            currentHeight = currentHeight - 0.5;
            if (currentHeight <= 0 || currentHeight >= heightOfGauge) {
                clearInterval(powerInterval);
            }
            if (currentHeight <= 0) {
                speller({text: failureText, counter: 0})
                return;
            }
            if (currentHeight >= heightOfGauge) {
                speller({text: successText, counter: 0})
                .then(speller)
                .then(speller)
                .then(speller)
                .then(speller)
                return;
            }
            opacity = 1-((1/numberToDivideOpacityBy)*currentHeight)/100; //FIXME: After start shroud gets lighter because currentHeight is high (35)
            document.querySelector(".shroud").style.opacity = opacity;
            change(currentHeight)
        },100);

    // Change function for power gauge change
    
        function change(number){
            ctx.clearRect(0,0,c.scrollWidth,c.scrollHeight)
            ctx.fillRect(10,scrollHeight-5,c.scrollWidth-10,-number);
        }

    // Buttons for no-mic workaround

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