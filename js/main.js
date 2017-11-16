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
const successAd = 'data:image/jpeg;base64,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'
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











