/*
 * 单人练习
 */

let cd; // 倒计时
let board;// 棋盘
let currentPlayer; //当前玩家
let intervalId;//倒计时定时器 Id,用于清理倒计时定时器
let lastTimestamp;//用于计算倒计时
let renderCD; //渲染倒计时
let setPiece; //落子

//游戏结束

function over(result) {
    //清理倒计时
    clearInterval(intervalId);
    //调用go.common.showResult 显示结果层
    go.common.showResult({
        result,
        //start 场景中，我们把玩家的基本信息存到了go.userInfo 中
        meName: go.userInfo.nickName,
        // 新注册的微信头像地址为空字符串，提供一个默认头像
        meAvatar: go.userInfo.avatarUrl || 'avatar_unknown',
        opponentName: '电脑',
        opponentAvatar: 'avatar_unknown',
        //结果层UI中有一个回到首页的按钮，这里可以设置它的点击回调
        callback: () => {
            //点击后回到主菜单场景
            go.game.state.start('menu');
        }
    });
}


/**
 * 落子 并返回游戏是否结束
 */

function placePiece(row, col) {
    //玩家落子
    board[row][col] = currentPlayer;
    setPiece(row, col, currentPlayer);
    //检查游戏结果
    if (checkOver()) return true;

    //双方换手
    currentPlayer = 1 - currentPlayer;

    return false;

}


/**
 * 重设游戏
 */


function reset() {
    //重设棋盘 0 是自己 1 是对手 -1 是空
    board = [
        [-1, -1, -1],
        [-1, -1, -1],
        [-1, -1, -1]
    ];

    //随机选择先手玩家

    currentPlayer = Math.round(Math.random());

    //倒计时 60s/人

    cd = [60000, 60000];

    lastTimestamp = Date.now();

    intervalId = setInterval(() => {
        //定时更新倒计时
        const current = Date.now();
        const delta = current - lastTimestamp;
        lastTimestamp = current;
        cd[currentPlayer] = cd[currentPlayer] - delta;
        renderCD(cd[0], cd[1]);
        //时间到，当前执子玩家判负
        cd[0] <= 0 && over('lose');
        cd[1] <= 0 && over('win');
    }, 500);

    return currentPlayer;
}


/**
 * 检查游戏结果
 */

function checkOver() {
    //调用go.common.checkWin 判断是否形成胜局
    if (go.common.checkWin(board)) {
        //若形成胜局，且当前玩家执子，则获胜
        if (currentPlayer === 0) over('win');
        //否则失败
        else over('lose')
        return true;
        //调用go.common.checkDraw 判断是否形成平局
    } else if (go.common.checkDraw(board)) {
        over('draw');
        return true;
    }

    return false;
}

class Practice extends Phaser.State {
    create() {
        //画背景
        this.add.image(0, 0, 'bg_playing');
        //重设游戏
        currentPlayer = reset();
        //调用go.common.addBattleInfo 绘制游戏信息
        //该函数会绘制游戏信息，并返回一个用于更新倒计时的函数

        renderCD = go.common.addBattleInfo({
            meAvatar: go.userInfo.avatarUrl || 'avatar_unknown',
            meName: go.userInfo.nickName,
            opponentAvatar: 'avatar_unknown',
            opponentName: '电脑'
        });

        renderCD(cd[0], cd[1]);

        // 调用 go.common.addPieces 画棋盘
        // 该函数接受一个函数作为棋子被点击后的回调函数，传入 row col 值
        // 并返回一个用于落子的函数

        setPiece = go.common.addPieces((row, col) => {
            //判断有没有轮到玩家落子
            if (currentPlayer !== 0) return;

            //玩家落子
            const isOver = placePiece(row, col);

            if (isOver) return;

            //超级人工智能落子....
            const stratage = [
                [1, 1], [0, 0], [0, 2], [2, 0], [2, 2],
                [0, 1], [1, 0], [1, 2], [2, 1]
            ];

            //找一个空位
            const availableCoord = stratage.find(coord => board[coord[0]][coord[1]] === -1)
            //落子
            setTimeout(() => {
                //落子
                const isOver = placePiece(availableCoord[0], availableCoord[1]);
                !isOver && go.common.alertYourTurn()
            }, 500 + 1000 * Math.random());
        });

        //若随机到电脑先下
        if (currentPlayer === 1) {
            placePiece(1, 1);
        } else {
            go.common.alertYourTurn();
        }
    }
}


module.exports = Practice;
