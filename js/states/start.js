/**
 * 开始 state ，负责检查加载资源文件以及申请获得玩家基本资料
 */


/**
 * 创建“开始”按钮，点击后获取用户基本信息并调用回调，若用户拒绝则没有任何效果
 */

function addStartBtn(cb) {

    const config = {
        type: 'Image',
        image: 'images/btn_start.png',
        style: {
            left: 248 / SCALE,
            top: 870 / SCALE,
            width: 254 / SCALE,
            height: 91 / SCALE,
        },
    }

    // wx.createUserInfoButton() 是小游戏 API ，用于创建获取用户信息的按钮，

    const startBtn = wx.createUserInfoButton(config);

    startBtn.onTap((res) => {
        //若用户拒绝授权，则返回值没有userInfo 值
        if (res.userInfo) {
            cb(res.userInfo);
        }
    })

    return startBtn;

}


class Start extends Phaser.State {

    /**
     * Phaser state 的preload 生命周期可以用来预加载游戏资源
     */

    constructor() {
        super();
        // handleOnShow 会作为回调函数，因此要bind this 以保证方法内this 指向不丢失
        this.handleOnShow = this.handleOnShow.bind(this);
    }

    /**
     * wx.onShow 的回调函数
     */

    handleOnShow({query}) {
        //游戏恢复前台，检查是否是由于点击带有房间ID的消息卡片导致
        if (query && query.roomId) {
            //是的话 就把房间ID保存到global object
            //真正的加入房间 要在电机开始按钮之后进行
            go.launchRoomId = query.roomId;
        }
    };

    preload() {
        //配置画面缩放
        this.scale.pageAlignHorizontally = true
        this.scale.pageAlignVertically = true
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
        //预加载资源
        this.load.image('bg_menu', 'images/bg_menu.png')
        this.load.image('bg_playing', 'images/bg_playing.png')
        this.load.image('bg_rank', 'images/bg_rank.png')
        this.load.image('bg_waiting', 'images/bg_waiting.png')
        this.load.image('avatar', 'images/avatar.png')
        this.load.image('avatar_unknown', 'images/avatar_unknown.png')
        this.load.image('btn', 'images/btn_menu.png')
        this.load.image('o', 'images/o.png')
        this.load.image('x', 'images/x.png')
        this.load.image('row', 'images/rank_row.png')
        this.load.image('avatars', 'images/result_avatars.png')
        this.load.image('win', 'images/result_win.png')
        this.load.image('lose', 'images/result_lose.png')
        this.load.image('draw', 'images/result_draw.png')
        this.load.image('bunting', 'images/bunting.png');
    };


    /**
     * Phaser create 生命周期用来初始化游戏场景
     */

    create() {
        //从启动参数获取需要加入的房间 ID
        go.launchRoomId = wx.getLaunchOptionsSync().query.roomId;
        //注册wx.onShow 事件
        wx.onShow(this.handleOnShow);
        //添加一个图片作为背景
        this.game.add.image(0, 0, 'bg_menu');
        //添加开始游戏按钮
        const startBtn = addStartBtn((userInfo) => {
            //销毁开始按钮
            startBtn.destroy();
            // 将玩家信息存入 global object
            go.userInfo = userInfo;
            //预加载玩家头像，微信头像为空则不加载
            if (go.userInfo.avatarUrl !== '') {
                this.load.image(go.userInfo.avatarUrl, go.userInfo.avatarUrl)
                //在preload 生命周期函数以外的进行的资源加载必须手动开始加载
                this.load.start();
            }

            //处理 ’game resume‘ 事件（没有需要恢复的数据也会触发）
            go.server.once('game resume', (resumeData) => {
                if (resumeData.room) {
                    //由于已经加入房间了，不再响应新的游戏邀请
                    go.launchRoomId = null;
                    //保存对手信息（可能还没有对手）
                    go.opponentInfo = resumeData.room.opponent;
                    if (resumeData.game) {
                        //保存对战状态，跳转对战场景
                        go.battle = resumeData.game;
                        // 有房间/游戏数据，进行状态恢复
                        console.log('正在恢复房间/游戏...', resumeData);
                        go.game.state.start('waiting');
                    } else {
                        // 有房间数据，但没游戏数据：恢复游戏的玩家是一名房主
                        // 且没有对手加入房间，跳转等待对手界面
                        go.game.state.start('waiting');
                    }

                } else {
                    //跳转主菜单场景
                    this.game.state.start('menu');
                }
            });

            //连接服务器
            go.server.initSocket();
        });

        //创建游戏圈按钮
        go.gameClub = wx.createGameClubButton({
            icon: 'green',
            style: {
                left: 10,
                top: 76,
                width: 40,
                height: 40
            }
        })
        // go.gameClub.show();
    }

    //在 离开 start场景的时候
    shutdown() {
        //停止监听 wx.onShow
        wx.offShow(this.handleOnShow);
    }
}


module.exports = Start;
