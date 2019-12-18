/*
 * 服务器相关
 */

//引入 Socket.IO SDK

const SocketIO = require('./libs/socket.io.slim.js');


/**
 * 创建房间
 */

function createRoom(cb) {

    go.server.socket.emit('create room', cb);
}

/**
 * 加入房间
 */
function joinRoom(roomId, cb) {
    go.server.socket.emit('join room', roomId, cb);
}

/**
 * 离开房间
 */

function leaveRoom(cb) {

    go.server.socket.emit('leave room', cb);
}

/**
 * 准备游戏
 */

function ready(cb) {
    go.server.socket.emit('ready', cb);
}

/**
 * 落子
 */

function placePiece(col, row) {

    go.server.socket.emit('place piece', col, row);

}


//
/**
 * 使用session 登录，自动用code作为后备
 */

function loginWithSession(callback) {
    //取出登录态
    const session = wx.getStorageSync('session');

    if (!session) {
        //没有登录态则使用wx.login 流程登录
        loginWithSession(callback);
        return;
    }

    //准备login 消息所需信息

    const payload = {
        playerInfo: go.userInfo,//用户基本信息
        session,  //登录态
    }

    go.server.socket.emit('login', payload, (err, res) => {
        if (err) {
            //若通过登录失败，尝试通过wx.login 流程登录
            loginWithCode(callback);
            return;
        }
        //调用登录成功回调
        callback(res);
    });
}


/**
 * 使用code登录
 */

function loginWithCode(callback) {
    //调用wx.login 消息所需消息

    wx.login({
        success: (res) => {
            //准备login消息所需信息
            const payload = {
                playerInfo: go.userInfo,//玩家的基本信息
                code: res.code,//服务器向微信获取登录态所需的code
            };

            go.server.socket.emit('login', payload, (err, res) => {
                //登录失败
                if (err) {
                    wx.showToast({
                        title: '登录失败',
                    });
                    return;
                }
                //保存服务器返回的登录态
                wx.setStorageSync('session', res.session);
                //调用登录成功回调
                callback(res);
            });

        }
    });
}


/**
 * 初始化 socketio
 */


function initSocket() {

    //连接Socket.IO 服务器
    //注意修改这里为上一节中你部署的服务器地址

    go.server.socket = new SocketIO('https://www.liritian.com',
        {
            transports: ['websocket'],
        }
    );

    //小游戏进入后台 断开连接
    wx.offShow(() => {
        go.server.socket.disconnect();
    });

    //小游戏回到前台，连接服务器
    wx.onShow(() => {
        go.server.socket.connect();
    });

    //连接/重连事件

    go.server.socket.on('connect', () => {
        //连接服务器成功，准备login消息的回调
        const callback = (res) => {
            //login
            //成功后，服务器会返回用于恢复游戏的数据
            //我们会触发一个 ‘game resume’ 事件并附上数据 以便其他地方使用

            emitter.emit('game resume', res.resumeData);
        };

        //柑橘微信登录态的有效决定登录方式
        wx.checkSession({
            success: () => {
                //登录态有效，使用登录态
                loginWithSession(callback);
            },

            fail: () => {
                //登录态过期，重新走wx.login 流程
                loginWithCode(callback);
            }
        });
    });

    //对手加入
    go.server.socket.on('opponent joined', playerInfo => {
        console.log('>>>>>> 收到 opponent joined 消息:', playerInfo);
        emitter.emit('opponent joined', playerInfo);
    });

    //游戏开始
    go.server.socket.on('game start', (game) => {
        console.log('>>>>>> 收到 game start 消息:', game);
        emitter.emit('game start', game);
    });

    //轮到玩家落子

    go.server.socket.on('your turn', (game) => {
        console.log('>>>>>> 收到 your turn 消息:', game);
        emitter.emit('your turn', game);
    });

    //游戏结束

    go.server.socket.on('game over', (game) => {
        console.log('>>>>>> 收到game over 消息:', game)
        emitter.emit('game over', game);
    })
}


/**
 * 一个简单的Emitter 实现 ，接口： on、once、emit
 */


function makeEmitter() {

    const events = [];

    return {
        on: (event, fn) => events.push({event, fn}),
        once: (event, fn) => events.push({event, fn, once: true}),
        off: (event, fn) => events.splice(events.find(
            ev => event === ev.event && ev.fn === fn
        ), -1, 1),

        emit: (event, ...args) => events.filter(ev => event === ev.event).forEach(ev => {
            ev.fn.apply(null, args);
            ev.once && events.splice(events.indexOf(ev), 1);
        }),
        events
    };
}


const emitter = makeEmitter()

module.exports = {
    socket: null,
    initSocket,

    on: emitter.on,
    once: emitter.once,
    off: emitter.off,

    createRoom,
    joinRoom,
    leaveRoom,
    ready,
    placePiece

}
