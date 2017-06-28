document.addEventListener("DOMContentLoaded",function () {
    console.log("Działam");
    
    let audioContext = null;
    let meter = null;
    let rafID = null;
    let mediaStreamSource = null;

    // Retrieve AudioContext with all the prefixes of the browsers
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    // Get an audio context
    audioContext = new AudioContext();

    /**
     * Callback triggered if the microphone permission is denied
     */
    function onMicrophoneDenied() {
        alert('Stream generation failed.');
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
        // check if we're currently clipping

        // if (meter.checkClipping()) {
        //     console.warn(meter.volume);
        // } else {
        //     console.log(meter.volume);
        // }

        // set up the next callback
        rafID = window.requestAnimationFrame(onLevelChange);

        let degrees = -(meter.volume * 10000)
        document.querySelector(".windmil_pic").style.transform = "rotate("+degrees+"deg)"
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


})