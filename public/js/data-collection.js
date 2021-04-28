// this is your function for recording but it's not used
// I put consol log whereever something happens so just play and see
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

                blob.arrayBuffer().then(res => {

                    const buffer = new Int8Array(res);
                    console.log(buffer);

                    axios({
                        method: 'post',
                        url: '/collect-data',
                        data: {
                            gt: 'KC4',
                            signal: buffer
                        },
                        headers: {
                            'content-type': 'multipart/form-data'
                        }
                    });
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


let chess = Chess();

const fetchPuzzle = async () => {
    const res = await axios.get("https://lichess.org/api/puzzle/daily");
    return res.data.game.pgn;

}

function setupPosition(pgn) {
    // const board = document.querySelector(".board");
    chess.load_pgn(pgn);
    console.log(pgn)
    console.log(chess.fen())
    init(chess.fen())

}

function startup() {

    fetchPuzzle().then((res) => {

        setupPosition(res);
    })
    // setupRecording();
}

window.onload = startup;

var init = function(fenLi) {

    var board = null
    var game = chess
    var $status = $('#status')
    var $fen = $('#fen')
    var $pgn = $('#pgn')

    function onDragStart(source, piece, position, orientation) {
        if (game.game_over()) return false

        // only pick up pieces for the side to move
        if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (game.turn() === 'b' && piece.search(/^w/) !== -1)) {

            return false
        } else{
            // probably should be somehwere else to check the end of the game as well but well stuff happens here
            console.log('Piece picked up')
        }
    }

    function onDrop(source, target) {
        // see if the move is legal
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        })

        // illegal move
        if (move === null) {
            console.log('Illegal - go to horny jail')
            return 'snapback'
        } else {
            console.log('Legit move, bro')
        }

        updateStatus()
    }

// update the board position after the piece snap
// for castling, en passant, pawn promotion
    function onSnapEnd() {
        board.position(game.fen())
    }

    function updateStatus() {
        var status = ''

        var moveColor = 'White'
        if (game.turn() === 'b') {
            moveColor = 'Black'
        }

        // checkmate?
        if (game.in_checkmate()) {
            status = 'Game over, ' + moveColor + ' is in checkmate.'
        }

        // draw?
        else if (game.in_draw()) {
            status = 'Game over, drawn position'
        }

        // game still on
        else {
            status = moveColor + ' to move'

            // check?
            if (game.in_check()) {
                status += ', ' + moveColor + ' is in check'
            }
        }

        $status.html(status)
        $fen.html(game.fen())
        $pgn.html(game.pgn())
    }

    var config = {
        draggable: true,
        position: fenLi,
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
    }
    board = Chessboard('myBoard', config)

    updateStatus()

}; // end init()
$(document).ready(init);



