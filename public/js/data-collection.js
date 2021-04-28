

let move_history = "";
let solution = [];
let chess = Chess();

const fetchPuzzle = async () => {
    const res = await axios.get("https://lichess.org/api/puzzle/daily");
    return res.data.game.pgn;
}

function setupPosition(pgn) {
    const board = document.querySelector(".board");
    // board.textContent = pgn;


    chess.load_pgn(pgn);
    board.textContent = chess.ascii();
}

function setupRecording() {
    const recordButton = document.querySelector('.button_record');
    const soundClips = document.querySelector('.sound-clips')

    recording = false;

    if (navigator.mediaDevices.getUserMedia) {

        let onSuccess = function(stream) {
            var mediaRecorder = new MediaRecorder(stream);
            let chunks = [];

            recordButton.onclick = function () {

                if (recording) {
                    mediaRecorder.stop();
                } else {
                    mediaRecorder.start();
                }

                recording = !recording;
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

                let formData = new FormData();
                formData.append('audio_blob', blob);

                axios({
                    method: 'post',
                    url: "/collect-data",
                    data: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                        // ; boundary=${formData._boundary}`,
                    }
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


    fetchPuzzle().then((res) => {
        setupPosition(res);
    })
    setupRecording();
}

window.onload = startup;