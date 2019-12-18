require('./js/libs/weapp-adapter')
window.p2 = require('./js/libs/p2')
window.PIXI = require('./js/libs/pixi')
window.Phaser = require('./js/libs/phaser-split')

window.WIDTH = 759   //宽度
window.SCALE = WIDTH / canvas.width  //宽度除以高度
window.HEIGHT = canvas.height * SCALE //游戏高度

//设置被动转发信息
wx.onShareAppMessage(() => {
    return {
        title: '嘟嘟左卫门',
        imageUrl: 'images/share.png'
    }
});

//设置离屏canvas 尺寸

let openDataContext = wx.getOpenDataContext();
let sharedCanvas = openDataContext.canvas;
//sharedCanvas 的尺寸只能在主域中设置，在开放数据域中设置是无效的。
sharedCanvas.width = WIDTH;
sharedCanvas.height = HEIGHT;


//创建并显示游戏圈按钮
let button = wx.createGameClubButton({
    icon:'green',
    style: {
        left:10,
        top: 76,
        width: 40,
        height: 40,
    }
})


// //hide
// button.hide()
// //show
// button.show()
// //destroy
// button.destroy()


//go: Global Object 用于在state 之间共享数据和方法

window.go = {
    game: null, //游戏实例
    userInfo: null,//玩家信息
    opponentInfo: null,//对手信息
    common: require('js/common-my'),//公共函数
    server: require('js/server.js'),//与服务器交互
    launchRoomId: null,//进入主菜单时需要加入的房间id
    battle: null, //对战状态
}


//初始化游戏

const config = {
    width: WIDTH,//游戏世界宽度
    height: HEIGHT,//游戏世界高度
    renderer: Phaser.CANVAS,//渲染器,这里我们使用canvas
    canvas: canvas //将游戏绘制在adapter 为我们创建的canvas上
}

localStorage.debug = '*';

const game = new Phaser.Game(config); //创建游戏

go.game = game;

//注册游戏场景

game.state.add('start', require('./js/states/start')); //添加start游戏场景
game.state.add('menu', require('./js/states/menu'));
game.state.add('practice', require('./js/states/practice'));
game.state.add('waiting', require('./js/states/waiting'));
game.state.add('battle', require('./js/states/battle'));
game.state.add('rank', require('./js/states/rank'));
game.state.start('start'); //启动start游戏场景




