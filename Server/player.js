// socket.on('create room', async cb => {
//     let player = await Players.createRoom(socket.playerId);//创建随机房间ID 写入数据库，当前玩家为房主
//     const join = promisify(socket.join).bind(socket);//将回调形式的接口转为async await形式
//     await join(player.roomId);// 调用 socket.join 加入 Socket.IO 房间
//     cb && cb(player.roomId);//// 将房间 ID 返回小游戏，用于邀请好友加入
// });
//
//
// socket.on('join room', async (roomId, cb) => {
//     await joinRoom(socket, roomId);// 将房间信息写入数据库
//     const player = await Players.getPlayer(socket.playerId);//获的玩家实例
//     const opponent = await Players.getOpponent(socket.playerId);// 获得对手的玩家实例
//     const opponentInfo = opponent && await Players.getPlayerInfo(opponent);// 获得对手的公开信息
//     cb && cb('', {roomId: roomId});//告知调用方加入房间成功
//     socket.emit('opponent joined', opponentInfo);//向双方发送对手信息公开
//     socket.to(roomId).emit('opponent joined', await Players.getPlayerInfo(player));
// });
//
//
// socket.on('ready', async (cb) => {
//     let player = await Players.getPlayer(socket.playerId);//获取玩家实例
//     player = await Players.roomReady(socket.playerId);//将准备情况写入数据库
//     const opponent = await Players.getOpponent(socket.playerId);//获得对手实例
//
//     socket.to(player.roomId).emit('opponent ready');//向对手发送对手已准备
//     if (player.roomReady && opponent && opponent.roomReady) { //如果双方都准备了
//
//         const game = TicTacToe.createGame(player.roomId, [player._id, opponent._id]);//创建游戏
//
//         Players.gameStart(player._id)//设置玩家游戏状态开始
//         Players.gameStart(opponent._id)//设置玩家游戏状态位开始
//
//         game.start() //开始游戏，开始计时
//     }
// });
//
//
// socket.on('place piece', async (col, row) => {
//     let player = await Players.getPlayer(socket.playerId);
//     const game = TicTacToe.getGame(player.roomId);//获得所在游戏
//     game.placePiece(col, row) //在指定位置落子
// });
//
//
// socket.on('leave room', async () => {
//     // 拿到玩家和对手的数据与对应的 Socket 实例
//
//     const Player = await Players.getPlayer(socket.playerId);
//     const opponent = await Players.getOpponent(socket.playerId);
//     const sockets = await getSocketsInRoom(player.roomId);
//     const socketPlayer = sockets.find(socket => socket.playerId === player._id)
//     const socketOpponent = opponent && sockets.find(socket => socket.playerId === opponent._id);
//
//     //游戏中 则销毁游戏
//
//     if (player.roomId && !player.playing) {
//         if (player.roomOwner) {
//             //房主退出
//             socketPlayer.leave(player.roomId);
//             Players.leaveRoom(player._id);
//             opponent && Players.leaveRoom(opponent._id)
//             socketOpponent && socketOpponent.emit('room dissmissed').leave(player.roomId);
//             Players.leaveRoom(player._id)
//         }
//
//         cb && cb();
//         return
//     }
//
// })
//
// //游戏生命周期
// //游戏开始事件
// TicTacToe.onGameStart = async game => {
//     //告知双方游戏开始
// }
//
// //游戏进入下一轮事件
// TicTacToe.onNextRound = async (game, lastAction) => {
//     //告知轮到哪个玩家落子
// }
//
// //游戏结束事件
// TicTacToe.onGameOver = async (game, winner, lastAction) => {
//
// }
//
//
// update(delta)
// { // delta 是距离上一次调用过去的毫秒数
//
//     if (!this.playing) return; // 本游戏没开始的话不更新
//
//     this.countdowns[this.currentPlayer] -= delta;
//
//     if (this.countdowns[this.currentPlayer] <= 0) { //超时
//
//         this._gameover(1 - this.currentPlayer);//对方获胜 会触发TicTacToe.onGameOver 事件
//     }
// }
//
// // 使用一个定时器更新所有游戏实例
//
// const gameMap = new Map() //创建游戏实例时会将新游戏加入gameMap
// let lastTimestamp = Date.now();//存储上次调用时间
//
// setInterval(() => {
//     const now = Date.now();//计算delta
//     const delta = now - lastTimestamp
//     lastTimestamp = now
//     gameMap.forEach(game => game.update(delta)); // 使用 delta 更新所有游戏的倒计时
// },200)// 不断更新
//
