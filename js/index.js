'use strict'
const showToast = msg => {
    !msg ? msg = "数据加载中" : null
    dlb.byId("toast_msg").innerHTML = msg
    dlb.show(dlb.byId("loadingToast"))
}

const hideToast = _ => dlb.hide(dlb.byId("loadingToast"))

const showDialog = title => dlb.show(dlb.byId("mydailg"))

const showToastSuccess = _ => dlb.show(dlb.byId("toastsuccess"))

const hideToastSuccess = _ => dlb.show(dlb.byId("toastsuccess"))

//输入金额临界值触发的事件
const speFunOpen = _ => {
    dlb.byId("marker").style.display = "none"
    if (parseFloat(dlb.byId("amount").value)) {
        dlb.addClass(dlb.byId("lastpay"), "canClick")
    }
}

const readPayment = amount => {
    dlb.byId("transactionPrice").value = amount || 0
    var originalamount = amount
    var merchantDiscount = dlb.byId("merchantDiscount").value
    var amount = calamount(amount, merchantDiscount)
    if (amount) {
        dlb.byId("platformTransactionAmount").value = amount
    } else {
        if(dlb.isNumeric(amount)){
            if(amount<= 0){
                amount = 0.01
            }
            dlb.byId("platformTransactionAmount").value = amount
        }else{
            dlb.byId("platformTransactionAmount").value = 0
        }

    }
}
//输入金额函数
function inputing(e) {
    var oPayNum = dlb.byQs('.payment-cont-num')
    var amount = dlb.byId("amount").value
    var num = this.innerHTML
    var newAmount = keybord.input(amount, this)
    dlb.byId("amount").value = newAmount
    oPayNum.innerHTML = newAmount
    speFunOpen()
   if(dlb.isNumeric(newAmount) && newAmount>0){
        readPayment(Number(newAmount))
   }

    e.preventDefault()
}

//按下退格键函数
const backClick = e => {
    e.preventDefault()
    var amount = dlb.byId("amount").value
    var newAmount
    if (amount == null || amount == '') {
        return
    } else {
        newAmount = amount.substring(0, amount.length - 1)
    }
    dlb.byId("amount").value = newAmount
    dlb.byQs('.payment-cont-num').innerHTML = newAmount
    dlb.isNumeric(amount) && newAmount>0 ? readPayment(newAmount) : dlb.byId("platformTransactionAmount").value = 0
    speFunEnd()     //输入金额临界值触发的事件
}

//键盘弹出函数
const toUp = _ => {
    if (dlb.byQs('.recommend-list') && parseInt(dlb.byQs('.recommend-list').style.bottom) == 0) {
        recommend.toHide(dlb.byQs('.recommend-list'))
    }
    keybord.slideUp(dlb.byQs('.keybord'), dlb.byQs('.payment-cont'))
    speFunEnd()
}


const speFunEnd = _ => {
    if (parseFloat(dlb.byId("amount").value) == 0) {
        dlb.removeClass(dlb.byId("lastpay"), "canClick")
    } else if (dlb.byId("amount").value == '') {
        dlb.byId("marker").style.display = "block"
        dlb.removeClass(dlb.byId("lastpay"), "canClick")
    }
}

//计算金额 o:原价 d:折扣
const calamount = (o, d) => parseFloat( (parseFloat(o) * d / 10).toFixed(2) )

const wechatApliy = _ => {
    showToast(null)
    var amount = dlb.byId("platformTransactionAmount").value
    var openid = dlb.byId("openid").value
    var qrcode = dlb.byId("qrcode").value
    var transactionPrice = dlb.byId("transactionPrice").value
    dlb.ajax({
        url: baseUrl + "/pay/rest/createOrder",
        data: {
            "qrcode": qrcode,
            "openid": openid,
            "amount": amount,
            "transactionPriceTwo": transactionPrice
        },
        type: 'post',
        timeout: 8000,
        success: data => {
            if (data.httpCode == 200) {
                var appId = data.payInfo.appId
                var timeStamp = data.payInfo.timeStamp
                var nonceStr = data.payInfo.nonceStr
                var package1 = data.payInfo.package
                var signType = data.payInfo.signType
                var paySign = data.payInfo.paySign
                onBridgeReady(appId, timeStamp, nonceStr, package1, signType, paySign)
            } else {
                hideToast()
            }
        }
    })
}

const onBridgeReady = (appId, timeStamp, nonceStr, package1, signType, paySign) => {
    WeixinJSBridge.invoke(
        'getBrandWCPayRequest', {
            "appId": appId,     //公众号名称，由商户传入
            "timeStamp": timeStamp,         //时间戳，自1970年以来的秒数
            "nonceStr": nonceStr, //随机串
            "package": package1,
            "signType": signType,         //微信签名方式：
            "paySign": paySign//微信签名
        }, function (res) {
            if (res.err_msg == "get_brand_wcpay_request:ok") {
                toFollowPage()
                hideToast()
            } else {
                hideToast()
            }
        }
    )
}

const toFollowPage = _ => window.location = baseUrl+"/follow"

//光标调用
setInterval((_ => {
    let n = 1
    return _ => {
        dlb.byId("marker").style.color = n % 2 === 0 ? "#333333" : "#ffffff"
        n++
    }
})(), 580)
//初始化金额
dlb.byQs('.payment-cont-num').innerHTML = ''
dlb.byId("amount").value = ''

//监听触摸键盘事件
const oBack = dlb.byQs('.keybord-back')
for(let numEle of dlb.byName('number')){
    //键盘触摸的时候颜色变化
    dlb.addEvent(numEle, 'touchstart', function (e) {
        keybord.changeBc(this)
        e.preventDefault()
    })
    //键盘触摸抬起的时候输入值
    dlb.addEvent(numEle, 'touchend', inputing)
}
//按下退格键颜色变化
dlb.addEvent(oBack, 'touchstart', function (e) {
    keybord.changeBc(this)
    e.preventDefault()
})
//按下退格按钮
dlb.addEvent(oBack, 'touchend', backClick)

//当页面文档加载完成之后弹出键盘
dlb.addEvent(document, 'DOMContentLoaded', _ => {
    var html = document.documentElement
    var windowWidth = html.clientWidth
    html.style.fontSize = windowWidth / 7.5 + 'px'
    // 等价于html.style.fontSize = windowWidth / 640 * 100 + 'px'
    toUp()
})
//    /键盘收起按钮按下颜色变化
dlb.addEvent(dlb.byQs('.retract'), 'touchstart', function (e) {
    keybord.changeBc(this)
    e.preventDefault()
})
//点击键盘收起按钮，键盘收起
dlb.addEvent(dlb.byQs('.retract'), 'touchend', function () {
    keybord.slideDown(dlb.byQs('.keybord'))
    dlb.addEvent(dlb.byQs('.payment-cont'), 'click', toUp)
})
dlb.addEvent(dlb.byId('lastpay'), 'click', _ => wechatApliy())


const switchMove = (ele, speed) => dlb.byQs(`.${ele}`).style.left = dlb.byQs(`.${ele}`).offsetLeft + speed + 'px'
const movePage = state => {
	let speed = document.body.clientWidth / 60 * (state && state === 'back' ? 1 : -1)
	let moveInterval = setInterval(_ => {
		let end = document.body.clientWidth
	    let bl = state && state === 'back' ? dlb.byQs('.cardWrapper').offsetLeft : -dlb.byQs('.container').offsetLeft
	    speed = speed > 1 && end-bl < 1 ? 1 : speed
	    speed = (end - bl) < Math.abs(speed) ? speed < 0 ? bl - end : end - bl : speed
	    switchMove('container', speed)
	    switchMove('keybord-box', speed)
	    switchMove('cardWrapper', speed)
	    if(bl >= end)
	        clearInterval(moveInterval)
	}, 1)
}
const appendDom = (elem, domStr) => {
	dlb.byQs(elem).innerHTML += domStr
}

dlb.addEvent(dlb.byQs('.tickets'), 'click', movePage)
let arr = [1,1,1,1,1,1,1,1,1,1,1,1,1]
let html = `<li class='cardNone'>
        <span>不使用优惠券</span>
        <div class='img'></div>
    </li>`
for(let i in arr){
	html += `<li class='cardItem'>
        <div class='cardContent'>
            <div class='cardCount'>
                <p><span>¥</span>20</p>
                <p>优惠券</p>
            </div>
            <div class='cardMess'>
                <div>
                    <p>店铺20元优惠券</p>
                    <p>进店消费满100元可用</p>
                </div>
                <div class='img'></div>
            </div>
        </div>
        <div class='cardBottom'>
            <span>有效期： 2017-06-11 至 2017-07-28</span>
            <span>未使用</span>
        </div>
    </li>`
}
appendDom('.cardContainer', html)
dlb.addEvent(dlb.byQs('.cardNone'), 'click', _ => movePage('back'))
for(let elem of dlb.byQsa('.cardItem')){
	dlb.addEvent(elem, 'click', _ => movePage('back'))
}

