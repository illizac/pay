const showToast = msg => {
    msg = msg || "数据加载中"
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

function readPayment(amount) {
    dlb.byId("transactionPrice").value = amount || 0
    var merchantDiscount = dlb.byId("merchantDiscount").value
    let couponReceiveSum = dlb.byId('couponReceiveSum').value
    var amount = calamount(amount, couponReceiveSum,  merchantDiscount)
    if (amount) {
        dlb.byId("platformTransactionAmount").value = amount
    } else {
        if($.isNumeric(amount)){
            if(amount<= 0){
                amount = 0.01
            }
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

//计算金额 o:原价 d:折扣 c: 优惠
const calamount = (o, c, d) => parseFloat( (parseFloat(o - c) * d / 10).toFixed(2) )

const Api = (_ => {
	const api = function(){}
	const baseUrl = 'http://pay.qdxiao2.com/proxy'

	const handleProxyPath = (path, success, param, type) => Object.assign({
		url: baseUrl,
		type: 'GET',
		data: Object.assign({}, {path, type}, param),
		success
	}, path === '/pay/rest/v1/createOrder' ? {header: 'application/json'} : {})

	api.prototype = {
		IsWeixinOrAlipay: _ => {
			let userAgent = navigator.userAgent.toLowerCase()
			return userAgent.match(/MicroMessenger/i) == "micromessenger" ? 'wx' : userAgent.match(/Alipay/i) == "alipay" ? 'aliy' : null
		},
		//店铺信息
		getShopInfo: param => new Promise((rsl, rej) => {
			// showToast('加载中')
			dlb.ajax(handleProxyPath(`/sp/shop/v1/payShopInfo/${param.qrcode}`, data => rsl(data), {}, 'post'))
		}).then(data => {
			hideToast()
			return JSON.parse(data).data
		}),
		//优惠券列表
		getcarddata: param => new Promise((rsl, rej) => {
			showToast('加载中')
			dlb.ajax(handleProxyPath(`/sp/shop/v1/getCouponInfo/${param.o}/${param.q}`, data => rsl(data), {}, 'post'))
		}).then(data => {
			hideToast()
			return JSON.parse(data)
		}),
		//创建微信订单
		createOrder: param => new Promise((rsl, rej) => {
			showToast('支付中')
			dlb.ajax(handleProxyPath(`/pay/rest/v1/createOrder`, data => rsl(data), param, 'post'))
		}).then(data => JSON.parse(data))
	}
	return new api()
})()

const switchMove = (ele, speed) => dlb.byQs(`.${ele}`).style.left = dlb.byQs(`.${ele}`).offsetLeft + speed + 'px'
const movePage = state => {
	let s, b, e, m
	s = document.body.clientWidth / 60 * (state && state === 'back' ? 1 : -1)
	m = setInterval(_ => {
		e = document.body.clientWidth
	    b = state && state === 'back' ? dlb.byQs('.cardWrapper').offsetLeft : -dlb.byQs('.container').offsetLeft
	    s = s > 1 && e - b < 1 ? 1 : s
	    s = (e - b) < Math.abs(s) ? s < 0 ? b - e : e - b : s
	    switchMove('container', s)
	    switchMove('keybord-box', s)
	    switchMove('cardWrapper', s)
	    if(b >= e)
	        clearInterval(m)
	}, 1)
}
const appendDom = (elem, domStr) => {
	dlb.byQs(elem).innerHTML = domStr
}
const saveCard = (e, type) => {
	e = e || window.event
	type == 'none' ? (
		dlb.byId('couponReceiveSum').value = "0",
		dlb.byId('cpCouponReceiveId').value = "0"
	) : (
		dlb.byId('couponReceiveSum').value = JSON.parse(dlb.byId('carddetail').innerHTML).count,
		dlb.byId('cpCouponReceiveId').value = JSON.parse(dlb.byId('carddetail').innerHTML).id,
		readPayment(dlb.byId('transactionPrice').value)
	)
	console.log(dlb.byId('cpCouponReceiveId').value)
	movePage('back')
}


const wechatApliy = _ => new Promise((rsl, rej) => {
    let amount = dlb.byId("platformTransactionAmount").value
    let openId = dlb.byId("openid").value
    let qrcode = dlb.byId("qrcode").value
    let couponReceiveSum = dlb.byId("couponReceiveSum").value
    let cpCouponReceiveId = dlb.byId("cpCouponReceiveId").value
    let transactionPrice = dlb.byId("transactionPrice").value
    let shop = JSON.parse(dlb.byId("shop").value)
    let isCouponReceiveId = cpCouponReceiveId === '0' ? '2' : '1'
    let merchantDiscount = dlb.byId('merchantDiscount').value
    let receivedPrice = transactionPrice - couponReceiveSum
    let o = {
			qrcode,
			openId,
			transactionPrice,
			merchantDiscount,
			receivedPrice,
			couponReceiveSum,
			discountAmount: amount,
			cpCouponReceiveId,
			isCouponReceiveId,
			id: shop.id,
			goodName: shop.shopName,
        }
    let array = []
	for(let i in o){
	    array.push(o[i])
	}
    array.sort()
    let s = ""
    for (let i of array) {
        s += i
    }
    let sercet = CryptoJS.SHA1(s).toString()
    o = Object.assign({}, o, {sercet})
    
    Api.createOrder(o).then(data => {
        hideToast()
		if (data.code == '200')
            rsl(data.data)
	})
})

const onBridgeReady = ({appId, timeStamp, nonceStr, package, signType, paySign}) => new Promise((rsl, rej) => {
    WeixinJSBridge.invoke(
        'getBrandWCPayRequest', {
            appId,     //公众号名称，由商户传入
            timeStamp,         //时间戳，自1970年以来的秒数
            nonceStr, //随机串
            package,
            signType,         //微信签名方式：
            paySign//微信签名
        }, function (res) {
        	rsl(res)
        }
    )
})

const tradePay = tradeNO => new Promise((rsl, rej) => {
    // 通过传入交易号唤起快捷调用方式(注意tradeNO大小写严格)
    AlipayJSBridge.call("tradePay", {
        tradeNO
    }, function (data) {
        if ("9000" == data.resultCode)
        	rsl(data)
    })
})

const successDom = ({all, cut}) => `<div class = 'success'>
    <div class="successMess">
        <div class='paymess'>
            <img src="${successImg}" class='payimg'>
            <p class='paytitle'>支付成功</p>
            <p class='payfinall'>${cut} 元</p>
            <p class='payprev' style='display: ${all == cut ? 'none' : 'block'}'>${all} 元</p>
        </div>
        <div class="shopCut" style='display: ${all == cut ? 'none' : 'block'}'>
            <span>商家优惠</span>
            <span class='cutnum'>-${cut-all}</span>
        </div>
    </div>
</div>`















