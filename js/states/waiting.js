/**
 * 等待对手界面（仅创建房间者有此步骤）
 */

/**
 * 取消 对战按钮的回调函数
 */

function cancelBattle() {
    go.server.leaveRoom(() => {
        // 离开房间 成功后 跳转主菜单场景
        go.game.state.start('menu')
    });
}


class Waiting extends Phaser.State {
    create() {
        //绘制背景
        this.add.image(0, 0, 'bg_waiting');

        //绘制玩家头像
        go.common.addAvatar({
            x: 115,
            y: 816,
            avatarKey: go.userInfo.avatarUrl || 'avatar_unknown',
            size: 168,
        });


        //创建/取消对战按钮

        go.common.addBtn({
            x: 248,
            y: 700,
            text: '不想等了',
            callback: cancelBattle,
        });

        //等待对手加入房间，once方式注册的监听器只会被触发一次就自动取消
        go.server.once('opponent joined', (opponent) => {
            //将对手的基本信息保存到global object
            console.log('opponent joined');
            go.opponentInfo = opponent;
        });

        //等待游戏开始
        go.server.once('game start', (game) => {
            //将对战初始状态 保存到global object
            go.battle = game;
            //跳转对战场景
            console.log('game start');
            this.game.state.start('battle');
        });
    }
}

module.exports = Waiting;
