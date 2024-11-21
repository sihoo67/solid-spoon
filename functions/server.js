const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const rooms = {}; // 방 정보 저장

// 방 생성 시 랜덤 5자리 코드 생성
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
}

// 클라이언트에 접속 시 실행될 코드
io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    // 방 생성
    socket.on('createRoom', () => {
        const roomCode = generateRoomCode();
        rooms[roomCode] = {
            players: [socket.id],
            gameState: Array(15).fill(Array(15).fill(null)), // 게임 초기화
            currentPlayer: '흑',
        };
        socket.emit('roomCreated', roomCode); // 방 코드 전송
    });

    // 방에 참가
    socket.on('joinRoom', (roomCode) => {
        if (rooms[roomCode] && rooms[roomCode].players.length < 2) {
            rooms[roomCode].players.push(socket.id);
            socket.join(roomCode);
            socket.emit('roomJoined', roomCode);
            io.to(roomCode).emit('startGame', rooms[roomCode].gameState, rooms[roomCode].currentPlayer); // 게임 시작
        } else {
            socket.emit('roomFull', '방이 꽉 찼습니다.');
        }
    });

    // 게임 진행 (돌 놓기)
    socket.on('makeMove', (roomCode, row, col) => {
        const room = rooms[roomCode];
        if (room && room.players[room.currentPlayer === '흑' ? 0 : 1] === socket.id) {
            room.gameState[row][col] = room.currentPlayer;
            room.currentPlayer = room.currentPlayer === '흑' ? '백' : '흑'; // 차례 변경
            io.to(roomCode).emit('updateGame', room.gameState, room.currentPlayer); // 게임 상태 업데이트
        }
    });

    // 연결 종료
    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            const playerIndex = room.players.indexOf(socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                if (room.players.length === 0) {
                    delete rooms[roomCode]; // 방에 남은 사람이 없으면 삭제
                }
                break;
            }
        }
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
