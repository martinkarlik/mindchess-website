let movePlayed = "";
let mediaRecorder = null;


function displayMessage(){
    var message = document.getElementById('message')
    message.style.display = 'block'
}

function hideMessage(){
    var message = document.getElementById('message')
    message.style.display = 'none'
}

const fetchPuzzle = async () => {

    const res = await axios.get("https://lichess.org/api/puzzle/daily");
    return res.data.game.pgn;

}


function setupRecording() {
    if (navigator.mediaDevices.getUserMedia) {

        let onSuccess = function(stream) {
            mediaRecorder = new MediaRecorder(stream);
            let chunks = [];

            mediaRecorder.ondataavailable = function (e) {
                chunks.push(e.data);
            }

            mediaRecorder.onstop = function () {

                if (movePlayed !== "") {
                    const clipContainer = document.querySelector('.clip');
                    clipContainer.innerHTML = "";

                    const clipLabel = document.createElement('h3');
                    clipLabel.classList.add('display-6');
                    clipLabel.textContent = movePlayed;

                    const audio = document.createElement('audio');
                    audio.setAttribute('controls', '');
                    audio.setAttribute('style', 'float: left');


                    clipContainer.appendChild(audio);
                    clipContainer.appendChild(clipLabel);


                    const blob = new Blob(chunks, {'type': 'audio/ogg; codecs=opus'});
                    audio.controls = true;
                    audio.src = window.URL.createObjectURL(blob);
                    console.log(audio.src);

                    chunks = [];

                    const formData = new FormData();
                    formData.append('audio_blob', blob, movePlayed);

                    axios({
                        method: 'post',
                        url: '/collect-data',
                        data: formData,
                        headers: {
                            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`
                        },
                    });
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
            displayMessage();
        }
    }

    function onDrop(source, target) {

        // see if the move is legal
        var move = chessGame.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        })

        // illegal move
        if (move === null) {
            movePlayed = "";
        } else {
            movePlayed = move.san;
        }

        mediaRecorder.stop();
        hideMessage();
        updateStatus();

        if (move === null) {
            return 'snapback';
        }
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


window.onload = startup;
