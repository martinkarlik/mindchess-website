
let mediaRecorder = null;

function setupRecording() {
    const recordButton = document.querySelector('.button_record');
    const soundClips = document.querySelector('.sound-clips')

    let recording = false;

    if (navigator.mediaDevices.getUserMedia) {

        let onSuccess = function(stream) {
            mediaRecorder = new MediaRecorder(stream);
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

                const formData = new FormData();

                formData.append('audio_blob', blob);
                formData.append('move_gt', 'KC4');

                axios({
                    method: 'post',
                    url: '/collect-data',
                    data: formData,
                    headers: {
                        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`
                    },
                });

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


const fetchPuzzle = async () => {
    const res = await axios.get("https://lichess.org/api/puzzle/daily");
    return res.data.game.pgn;

}

function setupPosition(chessGame) {

    function updateStatus() {
        var status = '';

        var moveColor = 'White';
        if (chessGame.turn() === 'b') {
            moveColor = 'Black';
        }

        if (chessGame.in_checkmate()) {
            status = 'Game over, ' + moveColor + ' is in checkmate.';
        }

        else if (chessGame.in_draw()) {
            status = 'Game over, drawn position';
        }

        else {
            status = moveColor + ' to move';

            if (chessGame.in_check()) {
                status += ', ' + moveColor + ' is in check';
            }
        }

        $status.html(status);
        $fen.html(chessGame.fen());
        $pgn.html(chessGame.pgn());
    }

    function onDragStart(source, piece, position, orientation) {
        if (chessGame.game_over())
            return false;

        // only pick up pieces for the side to move
        if ((chessGame.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (chessGame.turn() === 'b' && piece.search(/^w/) !== -1)) {

            return false;
        } else{
            // probably should be somehwere else to check the end of the game as well but well stuff happens here
            console.log('Piece picked up');
            mediaRecorder.start();
        }
    }

    function onDrop(source, target) {

        mediaRecorder.stop();

        // see if the move is legal
        var move = chessGame.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        })

        // illegal move
        if (move === null) {
            console.log('Illegal - go to horny jail');
            return 'snapback';
        } else {
            console.log('Legit move, bro');



        }

        updateStatus();
    }

    function onSnapEnd() {
        board.position(chessGame.fen());
    }


    var config = {
        draggable: true,
        position: chessGame.fen(),
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
    }

    const board = Chessboard('myBoard', config);

    let $status = $('#status');
    let $fen = $('#fen');
    let $pgn = $('#pgn');

    updateStatus();

}

function startup() {

    setupRecording();

    fetchPuzzle().then((pgn) => {
        const chessGame = Chess();
        chessGame.load_pgn(pgn);
        setupPosition(chessGame);
    })


}

function expandConfig (config) {
    // default for orientation is white
    if (config.orientation !== 'black') config.orientation = 'white'

    // default for showNotation is true
    if (config.showNotation !== false) config.showNotation = true

    // default for draggable is false
    if (config.draggable !== true) config.draggable = false

    // default for dropOffBoard is 'snapback'
    if (config.dropOffBoard !== 'trash') config.dropOffBoard = 'snapback'

    // default for sparePieces is false
    if (config.sparePieces !== true) config.sparePieces = false

    // draggable must be true if sparePieces is enabled
    if (config.sparePieces) config.draggable = true

    // default piece theme is wikipedia
    if (!config.hasOwnProperty('pieceTheme') ||
        (!isString(config.pieceTheme) && !isFunction(config.pieceTheme))) {
        config.pieceTheme = '../public/img/chesspieces/wikipedia/{piece}.png'
    }

    // animation speeds
    if (!validAnimationSpeed(config.appearSpeed)) config.appearSpeed = DEFAULT_APPEAR_SPEED
    if (!validAnimationSpeed(config.moveSpeed)) config.moveSpeed = DEFAULT_MOVE_SPEED
    if (!validAnimationSpeed(config.snapbackSpeed)) config.snapbackSpeed = DEFAULT_SNAPBACK_SPEED
    if (!validAnimationSpeed(config.snapSpeed)) config.snapSpeed = DEFAULT_SNAP_SPEED
    if (!validAnimationSpeed(config.trashSpeed)) config.trashSpeed = DEFAULT_TRASH_SPEED

    // throttle rate
    if (!validThrottleRate(config.dragThrottleRate)) config.dragThrottleRate = DEFAULT_DRAG_THROTTLE_RATE

    return config
}


window.onload = startup;