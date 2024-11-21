const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 5000 });

let rooms = {};  // 방을 저장할 객체

wss.on('connection', (ws) => {
  console.log('새로운 클라이언트 연결');
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'createRoom') {
      const roomCode = generateRoomCode();
      rooms[roomCode] = { players: [ws], board: Array(15).fill(null).map(() => Array(15).fill(null)) };
      ws.send(JSON.stringify({ type: 'startGame', roomCode }));
    }
    
    if (data.type === 'joinRoom') {
      const { roomCode } = data;
      if (rooms[roomCode] && rooms[roomCode].players.length < 2) {
        rooms[roomCode].players.push(ws);
        ws.send(JSON.stringify({ type: 'startGame' }));
      } else {
        ws.send(JSON.stringify({ type: 'error', message: '이미 두 명의 플레이어가 있습니다.' }));
      }
    }
    
    if (data.type === 'updateBoard') {
      const { roomCode, board } = data;
      if (rooms[roomCode]) {
        rooms[roomCode].board = board;
        rooms[roomCode].players.forEach((player) => player.send(JSON.stringify({ type: 'updateBoard', board })));
      }
    }
  });
});

// 방 코드 생성 함수
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

console.log('WebSocket 서버가 5000번 포트에서 실행 중입니다.');
