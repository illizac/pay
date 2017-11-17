import '../css/weui.min.css'
import '../css/main.css'

// const baseUrl = "http://pay.qdxiao2.com"
const baseUrl = 'http://pay.zanzanmd.cn'

const dlb = {
    byName: name => document.getElementsByName(name),
    byId: id => document.getElementById(id),
    byQs: ele => document.querySelector(ele),
    byQsa: eles => document.querySelectorAll(eles),
    show: obj => obj.style.display = 'block',
    hide: obj => obj.style.display = 'none',
    isNumeric: num => !!Number(num),
    //判断是否是整数
    isInt: num => num % 1 == 0 ? parseInt(num) : Number(num).toFixed(1),
    //事件监听
    addEvent: (obj, sEv, fn) => obj.addEventListener ? obj.addEventListener(sEv, fn, false) : obj.attachEvent('on' + sEv, fn),
    removeEvent: (obj, sEv, fn) => obj.removeEventListener ? obj.removeEventListener(sEv, fn, false) : obj.detachEvent('on' + sEv, fn),
    //增加className
    addClass: (obj, sClass) => {
        if (obj.className) {
            var reg = new RegExp('\\b' + sClass + '\\b', 'g')
            if (obj.className.search(reg) == -1) {
                obj.className += ' ' + sClass
            }
        } else {
            obj.className = sClass
        }
    },
    //删除className
    removeClass: (obj, sClass) => {
        if (obj.className) {
            var reg = new RegExp('\\b' + sClass + '\\b', 'g')
            if (obj.className.search(reg) != -1) {
                obj.className = obj.className.replace(reg, '').replace(/^\s+|\s+$/, ' ').replace(/\s+/g, ' ')
                if (!obj.className) {
                    obj.removeAttribute("class")
                }
            }
        }
    },
    //查看是否有这个class名，有就返回true否则返回false
    hasClass: (obj, cls) => {
        var obj_class = obj.className,              //获取 class 内容.
            obj_class_lst = obj_class.split(/\s+/)     //通过split空字符将cls转换成数组.
        var x = 0
        for (x in obj_class_lst) {
            if (obj_class_lst[x] == cls) {          //循环数组, 判断是否包含cls
                return true
            }
        }
        return false
    },
    //清除所有iclass
    clear: (item, iclass) => {
        for(let i in item)
            dlb.removeClass(item[i], iclass)
    },
    //ajax函数 封装
    json2url: json => {
        let arr = []
        for (let name in json) {
            arr.push(name + '=' + encodeURIComponent(json[name]))
        }
        return arr.join('&')
    },
    // data, type, timeout, url, success, error
    ajax: json => {
        var timer = null
        json = json || {}
        if (!json.url)return
        json.data = json.data || {}
        json.type = json.type || 'get'
        json.timeout = json.timeout || 8000

        if (window.XMLHttpRequest) {
            var oAjax = new XMLHttpRequest()
        } else {
            var oAjax = new ActiveXObject('Microsoft.XMLHTTP')
        }
        switch (json.type.toLowerCase()) {
            case 'get':
                oAjax.open('GET', json.url + '?' + dlb.json2url(json.data), true)
                oAjax.send()
                break
            case 'post':
                oAjax.open('POST', json.url, true)
                oAjax.setRequestHeader('Content-Type', json.header || 'application/x-www-form-urlencoded')
                oAjax.send(json.header ? JSON.stringify(json.data) : dlb.json2url(json.data))
                break
        }
        oAjax.onreadystatechange = function () {
            if (oAjax.readyState == 4) {
                clearTimeout(timer)
                if (oAjax.status >= 200 && oAjax.status < 300 || oAjax.status == 304) {
                    json.success && json.success(oAjax.responseText)
                } else {
                    json.error && json.error(oAjax.status)
                }
            }
            timer = setTimeout(function () {
                if (oAjax.readyState != 4) {
                    clearTimeout(timer)
                    json.error && json.error()
                }
            }, json.timeout)
        }
    },
    jsonp: json => {
        json = json || {}
        if (!json.url)return
        json.cbName = json.cbName || 'cb'
        json.data = json.data || {}

        json.data[json.cbName] = 'show' + Math.random()
        json.data[json.cbName] = json.data[json.cbName].replace('.', '')

        var arr = []
        for (var i in json.data) {
            arr.push(i + '=' + encodeURIComponent(json.data[i]))
        }
        var str = arr.join('&')

        window[json.data[json.cbName]] = function (result) {
            json.success && json.success(result)
            oH.removeChild(oS)
            window[json.data[json.cbName]] = null
        }
        var oH = document.getElementsByTagName('head')[0]
        var oS = document.createElement('script')
        oS.src = json.url + '?' + str
        oH.appendChild(oS)
        oS.onerror = function () {
            window[json.data[json.cbName]] = null
            oH.removeChild(oS)
            json.error && json.error()
        }
    }
}


const keybord = {
    //获取键盘内容
    getCon: obj => obj.innerHTML,
    //触摸键盘时颜色改变
    changeBc: obj => {
        obj.style.backgroundColor = '#eee'
        var _obj = obj
        setTimeout(function () {
            _obj.style.backgroundColor = '#fff'
        }, 30)
    },
    //键盘收起
    slideDown: box => {
        var oF = box.offsetHeight
        var timer = null
        var h = 0
        timer = setInterval(function () {
            h += 10
            if (h >= oF) {
                h = oF
                clearInterval(timer)
            }
            box.parentNode.style.bottom = -h + 'px'
        }, 5)
    },
    //键盘弹出
    slideUp: (box, pos) => {
        var oF = box.offsetHeight
        var timer = null
        var h = -oF
        timer = setInterval(function () {
            h += 10
            if (h >= 0) {
                h = 0
                clearInterval(timer)
            }
            box.parentNode.style.bottom = h + 'px'
        }, 5)
        dlb.removeEvent(pos, 'click', toUp)
    },
    //键盘点击输入
    input: (am, item) => {
        var num = keybord.getCon(item)
        var newAm
        //判断输入金额在小数点前五位、小数点后两位
        if ((am == null || am == '') && num == '.') {
            newAm = "0" + num
        } else if (am == null || am == '') {
            newAm = num
        } else if (num == '.' && am.indexOf(".") > 0) {
            newAm = am
        } else if (num == '0' && am.indexOf(".") < 0 && am.indexOf("0") == 0) {
            newAm = am
        } else if (num == '.' && am.indexOf(".") < 0 && parseInt(am) < 5000) {
            newAm = am + num
        } else if (am.indexOf(".") > 0 && (am.length - am.indexOf(".")) > 2) {
            newAm = am
        } else if (am.length > 8) {
            newAm = am
        } else if (am == '0' && num != '.') {
            newAm = num
        } else if (am.indexOf(".") < 0 && parseInt(am) == 500 && num != '0') {
            newAm = am
        } else if (am.indexOf(".") < 0 && parseInt(am) > 500) {
            newAm = am
        } else if (am.indexOf(".") < 0 && parseInt(am) <= 5000 && am.length >= 4 && num != '.') {
            newAm = am
        } else {
            newAm = am + num
        }
        return newAm
    }
}


//支付成功图片
const successImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJMAAACTCAYAAACK5SsVAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjlCRDk3NDUxOUU3QjExRTdBMDg0OTZEMkE0QUYyRTVGIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjlCRDk3NDUyOUU3QjExRTdBMDg0OTZEMkE0QUYyRTVGIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OUJEOTc0NEY5RTdCMTFFN0EwODQ5NkQyQTRBRjJFNUYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OUJEOTc0NTA5RTdCMTFFN0EwODQ5NkQyQTRBRjJFNUYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4lrBhbAAAOOElEQVR42uxd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'

//支付成功广告图片和url
const successAd = 'data:image/png;base64,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'
const successLink = 'https://qr.alipay.com/c1x06518inuxsorkhnqqm5b'


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
    let merchantDiscount = dlb.byId("merchantDiscount").value,
        couponReceiveSum = dlb.byId('couponReceiveSum').value,
        cpCouponReceiveId = dlb.byId("cpCouponReceiveId").value,
        type = dlb.byId('cpCouponReceiveType').value,
        fullCount = dlb.byId('cpCouponReceiveFull').value

    if( (cpCouponReceiveId != '0' && fullCount == couponReceiveSum && Number(amount) <= fullCount) || (cpCouponReceiveId != '0' && fullCount > couponReceiveSum && Number(amount) < fullCount) ){
        dlb.byId("cpCouponReceiveId").value = '0'
        couponReceiveSum = dlb.byId("couponReceiveSum").value = '0'
        type = dlb.byId('cpCouponReceiveType').value = '0'
        fullCount = dlb.byId('cpCouponReceiveFull').value = '0'
    }

    amount = calamount(amount, couponReceiveSum,  merchantDiscount)

    if (amount) {
        dlb.byId("platformTransactionAmount").value = amount
    } else {
        if(dlb.isNumeric(amount)){
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
    // dlb.isNumeric(amount) && newAmount > 0 ? readPayment(newAmount) : dlb.byId("platformTransactionAmount").value = 0
    dlb.isNumeric(amount) ? readPayment(newAmount) : dlb.byId("platformTransactionAmount").value = 0
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

    const baseUrl = 'http://pay.zanzanmd.cn'

	const handleProxyPath = (path, success, param, type) => {
        let obj = {
            url: `${baseUrl}${path}`,
            type,
            data: param,
            success
        }
        path === '/pay/rest/v1/createOrder' ? obj.header = 'application/json' : null
        return obj
        // Object.assign(, path === '/pay/rest/v1/createOrder' ? {header: 'application/json'} : {})
    }

	api.prototype = {
		IsWeixinOrAlipay: _ => {
			let userAgent = navigator.userAgent.toLowerCase()
			return userAgent.match(/MicroMessenger/i) == "micromessenger" ? 'wx' : userAgent.match(/Alipay/i) == "alipay" ? 'aliy' : null
		},
		//店铺信息
		getShopInfo: param => new Promise((rsl, rej) => {
			dlb.ajax(handleProxyPath(`/sp/shop/v1/payShopInfo/${param.qrcode}`, data => rsl(data), {}, 'post'))
		}).then(data => {
			data = JSON.parse(data)
			if(data.code == '200')
				setTimeout(hideToast, 500)
				return data.data
		}),
		//优惠券列表
		getcarddata: param => new Promise((rsl, rej) => {
			showToast('加载中')
			dlb.ajax(handleProxyPath(`/sp/shop/v1/getCouponInfo/${param.o}/${param.q}`, data => rsl(data), {}, 'post'))
		}).then(data => {
			data = JSON.parse(data)
			if(data.code == '200')
				setTimeout(hideToast, 500)
				return data
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
const saveCard = (type = 'list', elem) => {
	type == 'none' ? (
		dlb.byId('couponReceiveSum').value = "0",
		dlb.byId('cpCouponReceiveId').value = "0",
        dlb.byId('cpCouponReceiveType').value = "0",
        dlb.byId('cpCouponReceiveFull').value = "0"
	) : (
		dlb.byId('couponReceiveSum').value = JSON.parse(elem.childNodes[1].innerHTML).count,
		dlb.byId('cpCouponReceiveId').value = JSON.parse(elem.childNodes[1].innerHTML).id,
        dlb.byId('cpCouponReceiveType').value = JSON.parse(elem.childNodes[1].innerHTML).type,
        dlb.byId('cpCouponReceiveFull').value = JSON.parse(elem.childNodes[1].innerHTML).fullCount,
		readPayment(dlb.byId('transactionPrice').value)
	)
	movePage('back')
}


const wechatApliy = _ => new Promise((rsl, rej) => {
    let openId = dlb.byId("openid").value,
        qrcode = dlb.byId("qrcode").value,
        couponReceiveSum = dlb.byId("couponReceiveSum").value,
        cpCouponReceiveId = dlb.byId("cpCouponReceiveId").value,
        transactionPrice = dlb.byId("transactionPrice").value,
        shop = JSON.parse(dlb.byId("shop").value),
        amount = dlb.byId("platformTransactionAmount").value,
        isCouponReceiveId = cpCouponReceiveId === '0' ? '2' : '1',
        merchantDiscount = dlb.byId('merchantDiscount').value,
        receivedPrice = parseFloat((Number(transactionPrice) - Number(couponReceiveSum)).toFixed(2))

    let o = {
			qrcode,
			openId,
			transactionPrice,
			merchantDiscount,
			receivedPrice,
			couponReceiveSum,
			discountAmount: 0 < amount < 0.01 ? 0.01 : amount,
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
    for(let i in array) {
        s += array[i]
    }
    let sercet = CryptoJS.SHA1(s).toString()
    // o = Object.assign({}, o, {sercet})
    o.sercet = sercet
    
    Api.createOrder(o).then(data => {
        hideToast()
		if (data.code == '200')
            rsl(data.data)
	})
})

const onBridgeReady = data => new Promise((rsl, rej) => {
    WeixinJSBridge.invoke(
        'getBrandWCPayRequest', {
            appId: data.appId,     //公众号名称，由商户传入
            timeStamp: data.timeStamp,         //时间戳，自1970年以来的秒数
            nonceStr: data.nonceStr, //随机串
            package: data.package,
            signType: data.signType,         //微信签名方式：
            paySign: data.paySign//微信签名
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

const fmoney = (s = s || '0', n = 2) => {  
    n = n > 0 && n <= 20 ? n : 2;  
    s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";  
    let l = s.split(".")[0].split("").reverse()
    let r = s.split(".")[1];  
    let t = "";  
    for (let i = 0; i < l.length; i++) {  
        t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");  
    }  
    return t.split("").reverse().join("") + "." + r;  
}

const successDom = ({all, cut}) => `<div class = 'success'>
    <div class="successMess">
        <div class='paymess'>
            <img src="${successImg}" class='payimg'>
            <p class='paytitle'>支付成功</p>
            <p class='payfinall'>${cut} 元</p>
            <p class='payprev' style='display: ${all == cut ? 'none' : 'block'}'>${all} 元</p>
        </div>
        <div class="shopCut" style='display: ${all == cut ? 'none' : 'block'}'>
            <span style="float: left;">商家优惠</span>
            <span class='cutnum' style='float: right;'>${fmoney(cut-all)}</span>
        </div>
    </div>
    <a href='${successLink}'>
        <img style="width: 100%; display: block;" src="${successAd}" >
    </a>
</div>`


window.onload = function(){
    //初始化金额
    dlb.byQs('.payment-cont-num').innerHTML = ''
    dlb.byId("amount").value = ''

    //-------------------------------------------------------------------------------------------//
    let p = {}
    document.location.search.substring(1, document.location.search.length).split('&').map(val => {
        let a
        a = val.split('=')
        p[a[0]] = a[1]
    })
    
    var param = {
        o: p.o,
        q: p.q
    }
    dlb.byId('openid').value = param.o
    dlb.byId('qrcode').value = param.q

    Api.getShopInfo({
        qrcode: param.q
    }).then(data => {
        dlb.byId("merchantDiscount").value = data.platformDiscount && data.platformDiscount != '0' && data.platformDiscount != null ? data.platformDiscount : 10
        dlb.byId("shop").value = JSON.stringify(data)

        Api.IsWeixinOrAlipay() === 'aliy' ? 
        AlipayJSBridge.call('setTitle', {
          title: data.shopName,
        })
        : document.title = data.shopName

        if(data.lineState == '0'){
            return true
        }
        return false
        
    }).then(state => {

        if(!state){
            showToast('店铺已下线')
            setTimeout(_ => {
                hideToast()
            }, 500)

            keybord.slideDown(dlb.byQs('.keybord'))

            return false
        }






        //光标调用
        dlb.byQs('.tickets').style.display = Api.IsWeixinOrAlipay() === 'wx' ? 'block' : 'none'
        // dlb.byQs('.tickets').style.display = 'block'

        let mark = setInterval((_ => {
            let n = 1
            return _ => {
                dlb.byId("marker").style.color = n % 2 === 0 ? "#333333" : "#ffffff"
                n++
            }
        })(), 580)

        //当页面文档加载完成之后弹出键盘
        dlb.addEvent(document, 'DOMContentLoaded', _ => {
            var html = document.documentElement
            var windowWidth = html.clientWidth
            html.style.fontSize = windowWidth / 7.5 + 'px'
            // 等价于html.style.fontSize = windowWidth / 640 * 100 + 'px'
            toUp()
        })
        //点击键盘收起按钮，键盘收起
        dlb.addEvent(dlb.byQs('.retract'), 'touchend', function () {
            keybord.slideDown(dlb.byQs('.keybord'))
            dlb.addEvent(dlb.byQs('.payment-cont'), 'click', toUp)
        })

        //监听触摸键盘事件
        const oBack = dlb.byQs('.keybord-back')

        for(let i = 0; i < dlb.byName('number').length; i++){
            //键盘触摸的时候颜色变化
            dlb.addEvent(dlb.byName('number')[i], 'touchstart', function (e) {
                keybord.changeBc(this)
                e.preventDefault()
            })
            //键盘触摸抬起的时候输入值
            dlb.addEvent(dlb.byName('number')[i], 'touchend', inputing)
        }

        //按下退格键颜色变化
        dlb.addEvent(oBack, 'touchstart', function (e) {
            keybord.changeBc(this)
            e.preventDefault()
        })
        //按下退格按钮
        dlb.addEvent(oBack, 'touchend', backClick)

        //    /键盘收起按钮按下颜色变化
        dlb.addEvent(dlb.byQs('.retract'), 'touchstart', function (e) {
            keybord.changeBc(this)
            e.preventDefault()
        })







        dlb.addEvent(dlb.byQs('.tickets'), 'click', _ => {
            movePage()
            Api.getcarddata(param).then(data => {
                let html = `<li class='cardNone'>
                        <span>不使用优惠券</span>
                        <img class='img' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjJDRkI0RkZBODRCODExRTdBMTQ5QzM0RTE4NDJEMUNCIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjJDRkI0RkZCODRCODExRTdBMTQ5QzM0RTE4NDJEMUNCIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MkNGQjRGRjg4NEI4MTFFN0ExNDlDMzRFMTg0MkQxQ0IiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MkNGQjRGRjk4NEI4MTFFN0ExNDlDMzRFMTg0MkQxQ0IiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7aR3DhAAAFJElEQVR42tRaCYhVVRi+je2oMYZELgWVLWI0pI5bG6VkaEGZY5tlRWgLllCa7WSLFUVZVAxF5lg5WuSgENimrU5p88rRwkwqxWgj1LQpTfv+5nvT5fb/5567PG998PEe95x73/vu+c+/3btXS0tLkBM6g0PBE8ETwF5gT7ALuC/4J/gruIlsBVeAy8Ef0v5oTU1Nx/e9MwqQ888Dx4DDwW4x86vB3vx+Lj/bwDfBBeArFJwKVRlW4VbwK7ARrPMQYmF/cBQ4G1wP3sOV3CNirgPX8UcPC/JFd96kleCBlRTTB1wKPg4eElQW/cDz09i8D8SMGjyWfzv4Ae/sKnAj+CP4B3+rG/dMX7A/HUa1ca2dlRAzHbwvZs4ycC7YxD/vi67gmeBl3DdlNIMv5y3mXvAWx/hb3DtvpzSnLfRiC+jSRdBmcFZa1+paEUuIuM/J4HM57pNPyExxQsMYh2kt5x7aEPzHoHmz3g57XQgOKVjIGeAS8F1wXJyYRcZFXg1F7aIg7voNcAR4EjivVCqdZYmZxLwqihVMW4rEWDqKKCZqYvYDH1MmS+50esFCZI/ON8ZaNTHTjKB4Ibi1QCEXMP/TsAa8PypGPm9UJr/DTV8U5Ea+5BBSixJgW1RMHeuOKK4uWMiLxthqcCC4TfNmE4xVWVOQkItihNQyD/xXnOlM3x3FrIKEXAK+ELMi262geYqSCcjkxQUJaXB4LVmR31zpzGDluNQtv/+fhJRXpp9y/EPPP3Aog1n/jELGZxVSFnO44fbicDLL5/nMEO5OKeRScI5DyEAfIWUx3ZXjGz3OfTZSp98OzkwoRIqy542xVRTSliRr1uLLLx7n9lCOTQtH5BhMYEdGw2c0rbYkd6bKqGl2eJz7qHH8Zg9BVzgKu08TCBmLrPkucETZm2mNg308LnQbeAQjtSZot1GpXgk+Y1yzBA5iAyQOD4BTO04sla6pMpLI6hwitdYIuSonIQeHhRCPiJiflMm9EpjqxY6ILYJmhObVG/NaEggRHK21pkTM18pA3xQBb67DHBc7xpMKscR8WcV8J4ohOQe+UY6OzCBPhxP3/1aLmGZl4DRWnmkCYEOC1tLgFEIEI5VjzSJmmeLRJBiOzhDRGyooZICRtSwpezOtIzk5Q67lEpRFiPW/1qHiXFsuzrRILKXBcRkFRXOuj1LukbBLHq8cnxOuNBujJSjxVMZsWHKva4P2puIdFLIzw/WsrKM+LEaeNz6sTDoVPCejoCdZJszIeJ0BDAFRNMLEvo+2mmYad20eS+ui0WQcvyna0AhYM0xRJh8QtD9ALRKLjCz9CazKBk3M34NBqEMYQm1gN+IqjaeNMCFlyvVaqykMK77U0eT2tJCJxtjZ4K44Md8E7S1RDfII4T3W/pVEF5qWJURKi/e14kyDmNSdxtgw8HNmwZXAaF7fspDZVvHnenQuDYqHjLGDmAW/RnF5oIZmLCvS05gj45e7ymYXpjLYuRI+MbvXGZmrEwoQly8PsBayFBjnmFtvVLUd8Hl0LsFuPVMGS/xwUp4ey3sAH7Nd9S34M9OXThQrb3UcQw85jClKHKRR8mDcJN+XGqSSXMmS12VWXblaI3MyvbV0Akt9uzO++CJof454g1Fq54kdtIhjfYUkFVOGPCo8it5uU84itjKZ7MO9ujtp3ywNNtPbHcnkr8nIun2wi+nSJLaupjDWJUbWl+fauJ+E8pLPUGa3x9O99mAA7BT88ybgd2Qr96E4i1zeK/hLgAEAP6UovGCFF3QAAAAASUVORK5CYII=' />
                    </li>`
                let arr = data.data || []
                for(let ct in arr){
                    let i = arr[ct], 
                        type = i.couponType === '1' ? '优惠券' : '红包',
                        fullAmount = i.fullAmount / 100,
                        discountAmount = i.discountAmount / 100

                    html += (fullAmount > discountAmount && dlb.byId('transactionPrice').value >= fullAmount) || (fullAmount == discountAmount && dlb.byId('transactionPrice').value > fullAmount)  ? `<li class='cardItem'>
                        <span class='carddetail' style="display: none;">${JSON.stringify({id: i.id, count: discountAmount, type: i.couponType, fullCount: fullAmount })}</span>
                        <div class='cardContent'>
                            <div class='cardCount'>
                                <p><span>¥</span>${discountAmount}</p>
                                <p>${type}</p>
                            </div>
                            <div class='cardMess'>
                                <div>
                                    <p>店铺${discountAmount}元${type}</p>
                                    <p>进店消费满${fullAmount}元可用</p>
                                </div>
                                <img class='img' src='${
                                    dlb.byId('cpCouponReceiveId').value == i.id ? 
                                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjA5Mjk0RDAzODRCOTExRTdBMTdBOERDRDZFMzlENDVEIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjA5Mjk0RDA0ODRCOTExRTdBMTdBOERDRDZFMzlENDVEIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MDkyOTREMDE4NEI5MTFFN0ExN0E4RENENkUzOUQ0NUQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MDkyOTREMDI4NEI5MTFFN0ExN0E4RENENkUzOUQ0NUQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4epYtcAAAD+UlEQVR42tSabWhOYRjH7z2Mzcs2TCJRXjbUrJXWvLTQNqUoopU8mYS8FEJD2swiQqZY84HS0Fj5YEhLYl5WpnxYIUzji1aLmZcNMf9rz3XsdOy83+d5zrnq17bnnOfc12/nnPu+7vucuNz6rUJSJIA5YB6YAdLAGDAUJIPP4BtoA6/Ac/AQPAbdMhIY6PL7iWA5WAUWspBeJDPjQJbqcxK5Cy6Da6Ar2jIpYDvYAlIlnNHFTDs4AypAh90DhRzsvxG0gFIJItpI5eO+5XZCXslMBY2gCowU3sYIbqeR25UqsxI8BdkiupHN7a6UJVMMroAkEZtI4vaL3cocB0dAnIhtxHEex5zK7AE7hb9iF+dlS6YQHBb+DMprmVWZaeC8Dy4tvXgPnlmRob8vgCE+FXkH5oNWKzIbYtD9ShHRylDddCioIlqZzVEY2T0TUctQsbcjoCJpSrWuyCwBowMokgkawFK1TDiAIjQRvMcTwLAiQ6coP2AilG89z6so8miiGGLDhACJ0Mz2Bk/H1RO82SSTGyCRInAVDOpnWy7JZDhsvJunudES2cZl1gCd7RkkM9lB46d4nkE94CiwmhPySqSE1wWM6sUpJDPWZuO/wF7+SfERXLI6sNkUoeRPgjIr6wchVY9gNdp0loMooQU2hMxE6HI6x6tAVmJ4SOdmMgq6tAbrbLMqZCZCOdWAtTby6pX5aVOGRAoMtpsJmYnQ9KMOrLCZ1xeS6XBw01aa9IJ6QmYiKTwYFjjIqVfmg4MvjheRdeI8G0JmIlSW0DLtXIe9YjvJtLhYArrFA5mZ0H0TkQm8T5aLseoNyTS7OEA8D2SlBmNAq4lIOle+6S4H3uYQH8hNkMQB7kbjbX43k8/IRAlVRAPJyHo+Qt3oTWF95VNdwrsNyr8xxL/ckVRjUWn+gDsIoyjQlPBug/LvUiZn1RKr35kisnqfYVDC12lKeLdRrZ5pXpdYAau77nwbJbzTaOf8/8l080AoM5L4HiqyWMI7jUrlnlcvNVVwBSwzlK77toUS3kl84uMKrQxt2O/BDJIEFnk0Oy3jvP+ToTgLnohgBD1RO63+QCvzB6wB330u0ikij+t/G8lQvATrQI9PRSiv9eC1doPew6Yarrf8GPu4exdWZSjKwQmfiSjPWIVdGQrlGWKPDy4tymO30U5WHp0fFZFnnJ0xvNkLOQ/hVoaiFswCTVEWaeJ2a63sbOd1E+o9csAm9UDlUXRwOzn99VoyZJRxiN5pmQQOSi5OlaKxnI9fxe0Jr2TU/7lSnruHufZyOsH7wd8P8/FKnJ55ty/P0crmRSZR9L0JOF30vQk4jCtoupG/ir43AV+AR0yXjNP6V4ABAHQN50uSUtvRAAAAAElFTkSuQmCC'
                                    : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjJDRkI0RkZBODRCODExRTdBMTQ5QzM0RTE4NDJEMUNCIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjJDRkI0RkZCODRCODExRTdBMTQ5QzM0RTE4NDJEMUNCIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MkNGQjRGRjg4NEI4MTFFN0ExNDlDMzRFMTg0MkQxQ0IiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MkNGQjRGRjk4NEI4MTFFN0ExNDlDMzRFMTg0MkQxQ0IiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7aR3DhAAAFJElEQVR42tRaCYhVVRi+je2oMYZELgWVLWI0pI5bG6VkaEGZY5tlRWgLllCa7WSLFUVZVAxF5lg5WuSgENimrU5p88rRwkwqxWgj1LQpTfv+5nvT5fb/5567PG998PEe95x73/vu+c+/3btXS0tLkBM6g0PBE8ETwF5gT7ALuC/4J/gruIlsBVeAy8Ef0v5oTU1Nx/e9MwqQ888Dx4DDwW4x86vB3vx+Lj/bwDfBBeArFJwKVRlW4VbwK7ARrPMQYmF/cBQ4G1wP3sOV3CNirgPX8UcPC/JFd96kleCBlRTTB1wKPg4eElQW/cDz09i8D8SMGjyWfzv4Ae/sKnAj+CP4B3+rG/dMX7A/HUa1ca2dlRAzHbwvZs4ycC7YxD/vi67gmeBl3DdlNIMv5y3mXvAWx/hb3DtvpzSnLfRiC+jSRdBmcFZa1+paEUuIuM/J4HM57pNPyExxQsMYh2kt5x7aEPzHoHmz3g57XQgOKVjIGeAS8F1wXJyYRcZFXg1F7aIg7voNcAR4EjivVCqdZYmZxLwqihVMW4rEWDqKKCZqYvYDH1MmS+50esFCZI/ON8ZaNTHTjKB4Ibi1QCEXMP/TsAa8PypGPm9UJr/DTV8U5Ea+5BBSixJgW1RMHeuOKK4uWMiLxthqcCC4TfNmE4xVWVOQkItihNQyD/xXnOlM3x3FrIKEXAK+ELMi262geYqSCcjkxQUJaXB4LVmR31zpzGDluNQtv/+fhJRXpp9y/EPPP3Aog1n/jELGZxVSFnO44fbicDLL5/nMEO5OKeRScI5DyEAfIWUx3ZXjGz3OfTZSp98OzkwoRIqy542xVRTSliRr1uLLLx7n9lCOTQtH5BhMYEdGw2c0rbYkd6bKqGl2eJz7qHH8Zg9BVzgKu08TCBmLrPkucETZm2mNg308LnQbeAQjtSZot1GpXgk+Y1yzBA5iAyQOD4BTO04sla6pMpLI6hwitdYIuSonIQeHhRCPiJiflMm9EpjqxY6ILYJmhObVG/NaEggRHK21pkTM18pA3xQBb67DHBc7xpMKscR8WcV8J4ohOQe+UY6OzCBPhxP3/1aLmGZl4DRWnmkCYEOC1tLgFEIEI5VjzSJmmeLRJBiOzhDRGyooZICRtSwpezOtIzk5Q67lEpRFiPW/1qHiXFsuzrRILKXBcRkFRXOuj1LukbBLHq8cnxOuNBujJSjxVMZsWHKva4P2puIdFLIzw/WsrKM+LEaeNz6sTDoVPCejoCdZJszIeJ0BDAFRNMLEvo+2mmYad20eS+ui0WQcvyna0AhYM0xRJh8QtD9ALRKLjCz9CazKBk3M34NBqEMYQm1gN+IqjaeNMCFlyvVaqykMK77U0eT2tJCJxtjZ4K44Md8E7S1RDfII4T3W/pVEF5qWJURKi/e14kyDmNSdxtgw8HNmwZXAaF7fspDZVvHnenQuDYqHjLGDmAW/RnF5oIZmLCvS05gj45e7ymYXpjLYuRI+MbvXGZmrEwoQly8PsBayFBjnmFtvVLUd8Hl0LsFuPVMGS/xwUp4ey3sAH7Nd9S34M9OXThQrb3UcQw85jClKHKRR8mDcJN+XGqSSXMmS12VWXblaI3MyvbV0Akt9uzO++CJof454g1Fq54kdtIhjfYUkFVOGPCo8it5uU84itjKZ7MO9ujtp3ywNNtPbHcnkr8nIun2wi+nSJLaupjDWJUbWl+fauJ+E8pLPUGa3x9O99mAA7BT88ybgd2Qr96E4i1zeK/hLgAEAP6UovGCFF3QAAAAASUVORK5CYII='
                                }'/>
                            </div>
                        </div>
                        <div class='cardBottom'>
                            <span>有效期： ${i.startDate.split(' ')[0]} 至 ${i.deadline.split(' ')[0]}</span>
                            <span>未使用</span>
                        </div>
                    </li>` : ''
                }
                appendDom('.cardContainer', html)
                dlb.addEvent(dlb.byQs('.cardNone'), 'click', _ => saveCard('none') )
                for(let i = 0; i < dlb.byQsa('.cardItem').length; i++){
                    dlb.addEvent(dlb.byQsa('.cardItem')[i], 'click', _ => saveCard('list', dlb.byQsa('.cardItem')[i]))
                }
            })
        })

        dlb.addEvent(dlb.byId('lastpay'), 'click', _ => {
            if( dlb.byId('transactionPrice').value > 0 ){
                wechatApliy()
                    .then(data => {
                        let useagent = Api.IsWeixinOrAlipay()
                        return useagent ? useagent === 'aliy' ? tradePay(data) : useagent === 'wx' ? onBridgeReady(data) : null : null
                    })
                    .then(res => {
                        let fail = msg => {
                            showToast(msg)
                            setTimeout(_ => hideToast(), 300)
                        }
                        let wxRes = _ => {
                           switch(res['err_msg']){
                            case 'get_brand_wcpay_request:ok':  
                                clearInterval(marker)
                                dlb.byQs('.page').innerHTML = successDom({
                                    all: dlb.byId("transactionPrice").value,
                                    cut: 0 < dlb.byId("platformTransactionAmount").value < 0.01 ? 0.01 : dlb.byId("platformTransactionAmount").value
                                })
                                break
                            case 'get_brand_wcpay_request:cancel': 
                                fail('支付取消')
                                break
                            case 'get_brand_wcpay_request:fail': 
                                fail('支付失败')
                                break
                            default: 
                                fail('支付失败')
                                break
                           }
                        }
                        let aliyRes = _ => {
                            res.resultCode == '9000' ? (
                                clearInterval(marker),
                                dlb.byQs('.page').innerHTML = successDom({
                                    all: dlb.byId("transactionPrice").value,
                                    cut: dlb.byId("platformTransactionAmount").value
                                })
                            ) : fail('支付失败')
                        }
                        let useagent = Api.IsWeixinOrAlipay()
                        res ? useagent === 'wx' ? wxRes() : useagent === 'aliy' ? aliyRes() : fail('支付失败') : fail('支付失败')
                    })
            }
        })

    })
}











