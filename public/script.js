let currentPlayer = 'black';
let gameBoard = Array(15).fill(null).map(() => Array(15).fill(null));
let socket;

document.addEventListener('DOMContentLoaded', () => {
  const boardElement = document.getElementById('board');
  const createRoomBtn = document.getElementById('create-room-btn');
  const joinRoomBtn = document.getElementById('join-room-btn');
  const roomCodeInput = document.getElementById('room-code');
  
  // 게임 보드 초기화
  createBoard(boardElement);
  
  // 방 만들기
  createRoomBtn.addEventListener('click', () => {
    socket = new WebSocket('wss://localhost:5000'); // 실제 서버 URL로 변경
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'createRoom' }));
    };
  });

  // 방 참가
  joinRoomBtn.addEventListener('click', () => {
    const roomCode = roomCodeInput.value.trim();
    if (roomCode) {
      socket = new WebSocket('wss://your-server-url'); // 실제 서버 URL로 변경
      socket.onopen = () => {
        socket.send(JSON.stringify({ type: 'joinRoom', roomCode }));
      };
    }
  });

  // WebSocket 이벤트 처리
  socket.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (data.type === 'startGame') {
      console.log('게임 시작!');
      startGame();
    }
    if (data.type === 'updateBoard') {
      updateGameBoard(data.board);
    }
  };

  // 보드 셀 클릭 이벤트
  boardElement.addEventListener('click', (e) => {
    const row = Math.floor(e.target.dataset.index / 15);
    const col = e.target.dataset.index % 15;
    
    if (gameBoard[row][col] === null) {
      gameBoard[row][col] = currentPlayer;
      e.target.style.backgroundColor = currentPlayer === 'black' ? 'black' : 'white';
      currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
      
      // 서버로 보드 업데이트 전송
      socket.send(JSON.stringify({ type: 'updateBoard', board: gameBoard }));
    }
  });
});

// 게임 보드 그리기
function createBoard(boardElement) {
  boardElement.innerHTML = '';
  for (let i = 0; i < 15 * 15; i++) {
    const cell = document.createElement('div');
    cell.classList.add('board-cell');
    cell.dataset.index = i;
    boardElement.appendChild(cell);
  }
}

// 게임 상태 업데이트
function updateGameBoard(board) {
  gameBoard = board;
  const boardElements = document.querySelectorAll('.board-cell');
  boardElements.forEach((cell, index) => {
    const row = Math.floor(index / 15);
    const col = index % 15;
    if (gameBoard[row][col] !== null) {
      cell.style.backgroundColor = gameBoard[row][col] === 'black' ? 'black' : 'white';
    }
  });
}

// 게임 시작
function startGame() {
  console.log('게임이 시작되었습니다.');
  currentPlayer = 'black';
}
