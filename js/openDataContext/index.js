// //js/openDataContext以外的代码所运行的作用域称为主域。
// wx.onMessage((data) => {
//     console.log(data)
// });
//
//
// wx.onShareAppMessage({
//     title: '分享游戏',
//     imageUrl: 'images/share.png',
//     query: 'from=share'
// })
//
//
// wx.onShareAppMessage({
//     title: '查看群排行',
//     imageUrl: 'images/share.png',
//     query: 'from=groupRank'
//
// })
//

/**
 * 开放数据域，绘制排行榜
 */

//离屏画布，叫shared 是因为主域，开放数据域都能访问它

const SHARED_CANVAS = wx.getSharedCanvas();

//成绩条相关数值
const SCORE_ROW_WIDTH = 515
const SCORE_ROW_HEIGHT = 94
const SCORE_ROW_GAP = 25
const TOP_TO_SCORE = 375
const LEFT_TO_SCORE = 118

//按序号计算成绩条的top值
function topToScoreRow(index) {
    return LEFT_TO_SCORE, TOP_TO_SCORE + (SCORE_ROW_HEIGHT + SCORE_ROW_GAP) * index;
}

//成绩条内部元素相关数值

const LEFT_TO_INDEX = 150
const LEFT_TO_AVATAR = 196
const LEFT_TO_NAME = 280
const LEFT_TO_WINS = 610
const AVATAR_SIZE = 70
const NAME_MAX_WIDTH = 230
const WINS_MAX_WIDTH = 90

//按序号计算文本的top值

function topToAvatar(index) {
    return topToScoreRow(index) + 10;
}

//按序号计算文本的top值（所有文本都是只有一行垂直居中，所以一样）

function topToTexts(index) {

    return topToScoreRow(index) + 55;
}

/**
 * 画图片的辅助函数
 * Image 的加载是异步的，封装成Promise方便使用
 */

function drawImage(ctx, imgSrc, x, y, width, height) {
    return new Promise((resolve) => {
        //使用wx.createImage()创建图片
        var image = wx.createImage();
        //加载成功回调
        image.onload = function () {
            //实践发现，drawImage 若将width height 设为undefined 会导致宽高变成0
            if (width && height) {
                ctx.drawImage(image, x, y, width, height)
            } else {
                ctx.drawImage(image, x, y)
            }

            //绘制完毕，resolve promise
            resolve()
        }

        //设置src 开始加载，没头像的加载 avatar_unknown
        image.src = imgSrc || 'images/avatar_unknown.png';
    })
}


/**
 * 绘制胜局数量
 */

function drawScore(context, player, index) {
    //锚点定在最右侧，文本框边长时就是向左扩展
    context.textAlign = 'right';
    context.fillText(`胜${player.score.win}场`, LEFT_TO_WINS, topToTexts(index), WINS_MAX_WIDTH)
}

/**
 * 绘制胜局数量
 */

function drawRankList(data) {
    //锚点定在最右侧，文本框边长时就是向左扩展
    const context = SHARED_CANVAS.getContext('2d');
    //清除之前绘制的排行
    context.clearRect(0, 0, SHARED_CANVAS.width, SHARED_CANVAS.height);

    //逐条绘制
    data.forEach((player, index) => {
        //画背景
        const pRow = drawImage(context, 'images/rank_row.png', LEFT_TO_SCORE, topToScoreRow(index))

        //背景图片是异步加载，绘制时会覆盖已经画好的内容
        //因此我们在确定背景绘制完成后再绘制别的
        pRow.then(() => {
            // 画头像（头像也是异步，但它的为止不会覆盖别的东西）
            // 注意：头像是从网络加载的，几乎可以肯定它会比背景图片慢，但对于没有头像的玩家
            // 加载的 avatar_unknow 是本地资源，仍然可能被背景覆盖，所以不能把这行挪到 then 外面。

            drawImage(context, player.avatarUrl, LEFT_TO_AVATAR, topToAvatar(index), AVATAR_SIZE, AVATAR_SIZE);

            //画文本
            context.textAlign = 'left';
            context.fillStyle = 'white';
            context.font = '24px Arial';
            //序号
            context.fillText(index + 1, LEFT_TO_INDEX, topToTexts(index));

            //名字
            context.fillText(player.nickname, LEFT_TO_NAME, topToTexts(index), NAME_MAX_WIDTH);
            //成绩
            drawScore(context, player, index);

        })
    })
}

/**
 * 处理微信API 获得的原始数据，获得我们绘制排行榜所需的数据
 */

function processData(data) {
    return data.//有成绩且成绩数据格式正确
    map((player) => {
        const score = player.KVDataList.find(({key}) => key === 'score')
        if (!score) return null

        //为了避免score.value 中出现无法解析的意外数据
        try {
            player.score = JSON.parse(score.value)
        } catch (e) {
            return null
        }

        return player;
    })
    //剔除无效数据
        .filter(data => data !== null)
        //按胜场排序
        .sort(
            (one, another) => {
                if (one.score.win > another.score.win) {
                    return -1
                } else {
                    return 1;
                }
            }
        )
        .slice(0, 10) //前十名
}

//监听主域中发来的消息
wx.onMessage((data) => {
    switch (data) {
        case 'rank': {
            //拿到好友的...
            wx.getFriendCloudStorage({
                //key为score的云数据
                keyList: ['score'],
                success: res => {
                    //处理原始数据，获得绘制排行榜所需的数据
                    let data = processData(res.data)

                    //出入数据，画排行榜
                    drawRankList(data)
                }
            })
        }

    }
})
