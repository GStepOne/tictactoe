/**
 * wx.login 登录流程，使用code 换取 session_key 与 openid
 * @param code
 * @return {Promise<void>}
 */


async function code2session() {

    const session = await request({
        uri: `https://api.weixin.qq.com/sns/jscode2session?appid=${config.appid}&secret=${config.secret}&js_code=${code}&grant_type=authorization_code`,
        json: true,
    });

    return session;

}


let tokenRefreshTimeout
let token

/**
 * 调用以主动刷新 access token
 *access_token 是服务器端调用微信 API 的凭证，获取它的接口有每日调用次数限制（200次），
 * 且每次调用都会使上次获得的 token 失效。因此需要在一个位置维护它，并定期更新，避免无节制的调用
 */

async function accessToken() {
    try {
        clearTimeout(tokenRefreshTimeout);
        const res = await request({
            uri: `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appid}&secret=${config.secret}`,
            json: true,
        });

        if (res.errcode) throw res;

        //提前200 秒定时刷新access_token
        tokenRefreshTimeout = setTimeout(accessToken, (res.expire_in - 200) * 1000);
        token = res.access_token;
    } catch (e) {
        console.error('access token 获取失败:', e)
        tokenRefreshTimeout = setTimeout(accessToken, 60 * 1000);
    }
}

accessToken();//初始化请求一次 其他位置也可以主动调用以立即刷新token

const crypto = require('crypto');

const hmac_sha256 = (sessionKey, data) => {
    return crypto
        .createHmac('sha256', sessionKey)
        .update(data || '')
        .digest('hex')
}


//转换工具

const object2KVDataList = (o) => {
    let result = []
    Object.keys(o).forEach(key => {
        result.push({
            key: key,
            value: JSON.stringify(o[key])
        });
    });

    return {
        kv_list: result
    };
}


//上报用户数据

async function setUserStorage(player, kv) {
    const kvList = object2KVDataList(kv);
    const postData = JSON.stringify(kvList);
    const res = await request({
        uri: `https://api.weixin.com/wxa/set_user_storage?access_token=${token}&signature=${hmac_sha256(player.sessionKey, postData)}&openid=${player.openId}&sig_method=hmac_sha256`,
        method: 'POST',
        json: true,
        body: kvList
    })
    return res;
}
