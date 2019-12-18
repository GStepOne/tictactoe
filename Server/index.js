socket.on('login', async (payload, cb) => {
    const player = await Players.login(payload);
    socket.playerId = player._id;

    let resumeData = {};

    //恢复房间
    if (player.roomId) { //如果玩家此前有加入的房间
        const join = promisify(socket, join).bind(socket); // 将 socket.join 接口转为 async await 形式
        await join(player, roomId); // 重新加入该房间
        const opponent = await Player.getOpponent(socket.playerId); // 获得玩家的公开信息
        const opponentInfo = opponent && await Players.getPlayerInfo(opponent);// 获得对手的公开信息
        resumeData.room = {
            roomId: player.roomId,
            roomOwner: player.roomOwner,
            opponent: opponentInfo,
        };

    }

    //恢复游戏

    if (player.playing) {// 如果有未完成的游戏-+

        const game = TicTacToe.getGame(player.roomId); // 获得该游戏的信息
        resumeData.game = game && game.getInfoForPlayer(player._id);// 整理为发送给小游戏的格式
    }

    cb && cb('',{
        session: player.session,// 向小游戏端返回自定义登陆态
        resumeData,// 恢复房间、游戏用的数据（若没有需要恢复的内容，则为 {} )
    });
})
    .on('create room')
    .on('join room')
    .on('ready')
    .on('place piece')
    .on('leave room',);
