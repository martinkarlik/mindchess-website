
let move_history = "";
let solution = [];

async function fetchPuzzle() {
    await fetch("https://lichess.org/api/puzzle/daily")
        .then(res => res.json())
        .then(res => {

            move_history = res.game.pgn;
            solution = res.puzzle.solution;

            setupPosition();
        })
}

function setupPosition() {
    document.querySelector(".board");
    board.textContent = move_history;
}

function setupRecording() {
    const startButton = document.querySelector('.button_start');
    const stopButton = document.querySelector('.button_stop');
    const soundClips = document.querySelector('.sound-clips')

    stopButton.disabled = true;


    if (navigator.mediaDevices.getUserMedia) {

        let onSuccess = function(stream) {
            var mediaRecorder = new MediaRecorder(stream);
            let chunks = [];

            startButton.onclick = function () {
                mediaRecorder.start();
                startButton.disabled = true;
                stopButton.disabled = false;
            }

            stopButton.onclick = function () {
                mediaRecorder.stop();
                startButton.disabled = false;
                stopButton.disabled = true;
            }

            mediaRecorder.ondataavailable = function (e) {
                chunks.push(e.data);
            }

            mediaRecorder.onstop = function () {
                console.log("data available after MediaRecorder.stop() called.");

                const clipContainer = document.createElement('article');
                const clipLabel = document.createElement('p');
                const audio = document.createElement('audio');
                const deleteButton = document.createElement('button');

                clipContainer.classList.add('clip');
                audio.setAttribute('controls', '');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'button_delete';

                clipLabel.textContent = "KC4";

                clipContainer.appendChild(audio);
                clipContainer.appendChild(clipLabel);
                clipContainer.appendChild(deleteButton);
                soundClips.appendChild(clipContainer);

                const blob = new Blob(chunks, {'type': 'audio/ogg; codecs=opus'});
                audio.controls = true;
                audio.src = window.URL.createObjectURL(blob);
                blob.arrayBuffer()
                    .then((buffer) => {
                        console.log(buffer)
                    })


                chunks = [];

                deleteButton.onclick = function (e) {
                    let eventTarget = e.target;
                    eventTarget.parentNode.parentNode.removeChild(eventTarget.parentNode);
                }

            }


        }

        let onError = function(error) {
            console.log(error);
        }

        navigator.mediaDevices.getUserMedia({audio: true}).then(onSuccess, onError);

    } else {
        console.log("User media not supported on this browser.");
    }
}

function startup() {
    fetchPuzzle().then(() => {
        setupRecording();
    })
}


window.addEventListener('onload', startup, false);