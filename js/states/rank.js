/**
 * 排行榜
 */

function backToMenu() {
    go.game.state.start('menu')
}

class Rank extends Phaser.State {
    create() {
        //获得开放数据域实例
        const openDataContext = wx.getOpenDataContext();
        //绘制背景
        this.add.image(0, 0, 'bg_rank');
        //透明的返回主菜单按钮，放在左上角背景图的返回位置
        const backButton = this.add.button(0, 155, 'btn', backToMenu);

        backButton.alpha = 0;

        //向开放数据域发送rank消息
        openDataContext.postMessage('rank');

        wx.showShareMenu();

        wx.onShareAppMessage(
            {
                title: '让我们来一场紧张刺激且健康益智的嘟嘟佐卫门大作战吧！',
                imageUrl: canvas.toTempFilePathSync({
                    destWidth: WIDTH,
                    destHeight: HEIGHT,
                })
            }
        );

    }

    /**
     * 将开放数据域绘制的排行榜绘制到赏瓶画布上
     */

    render() {
        //获得开放数据域实例
        const openDataContext = wx.getOpenDataContext();
        //获得离屏画布
        const sharedCanvas = openDataContext.canvas
        //将离屏画布绘制到上屏画布
        // game.context 是Phaser的接口，用于获取Phaser 正在使用的canvas context
        this.game.context.drawImage(sharedCanvas, 0, 0)
    }
}


module.exports = Rank;
