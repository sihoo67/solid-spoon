const socket = io('http://localhost:3000'); // 서버 연결
const createRoomButton = document.getElementById('createRoomButton');
const joinRoomButton = document.getElementById('joinRoomButton');
const joinRoomCodeInput = document.getElementById('joinRoomCode');
const roomInfo = document.getElementById('roomInfo');
const currentPlayerElem = document.getElementById('currentPlayer');
const board = document.getElementById('board');
const ctx = board.getContext('2d');
const cellSize = 40;
const gridSize = 15;
let roomCode = '';
let gameState = Array(gridSize).fill(Array(gridSize).fill(null));
let currentPlayer = '흑';
let playerColor = null;

createRoomButton.addEventListener('click', () => {
    socket.emit('createRoom');
});

joinRoomButton.addEventListener('click', () => {
    const code = joinRoomCodeInput.value;
    if (code) {
        socket.emit('joinRoom', code);
    }
});

socket.on('roomCreated', (code) => {
    roomCode = code;
    roomInfo.textContent = `방 코드: ${roomCode}`;
});

socket.on('roomJoined', (code) => {
    roomCode = code;
    roomInfo.textContent = `방에 접속했습니다.`;
});

socket.on('roomFull', (message) => {
    roomInfo.textContent = message;
});

socket.on('startGame', (initialGameState, startingPlayer) => {
    gameState = initialGameState;
    currentPlayer = startingPlayer;
    currentPlayerElem.textContent = currentPlayer;
    drawBoard();
});

socket.on('updateGame', (updatedGameState, nextPlayer) => {
    gameState = updatedGameState;
    currentPlayer = nextPlayer;
    currentPlayerElem.textContent = currentPlayer;
    drawBoard();
});

board.addEventListener('click', (event) => {
    if (!roomCode || playerColor === null) return; // 방이 없거나 게임이 시작되지 않으면 클릭 불가

    const rect = board.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (gameState[row][col] === null && currentPlayer === playerColor) {
        socket.emit('makeMove', roomCode, row, col);
    }
});

function drawBoard() {
    ctx.clearRect(0, 0, board.width, board.height);
    // 그리드 그리기
    for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, gridSize * cellSize);
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(gridSize * cellSize, i * cellSize);
        ctx.strokeStyle = '#333';
        ctx.stroke();
    }

    // 돌 그리기
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (gameState[row][col] !== null) {
                ctx.beginPath();
                ctx.arc(col * cellSize + cellSize / 2, row * cellSize + cellSize / 2, 15, 0, Math.PI * 2);
                ctx.fillStyle = gameState[row][col] === '흑' ? 'black' : 'white';
                ctx.fill();
            }
        }
    }
}
