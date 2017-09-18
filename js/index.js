'use strict'
const baseUrl = "http://pay.qdxiao2.com"
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
                oAjax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
                oAjax.send(dlb.json2url(json.data))
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
        } else if (num == '.' && am.indexOf(".") < 0 && parseInt(am) < 50000) {
            newAm = am + num
        } else if (am.indexOf(".") > 0 && (am.length - am.indexOf(".")) > 2) {
            newAm = am
        } else if (am.length > 8) {
            newAm = am
        } else if (am == '0' && num != '.') {
            newAm = num
        } else if (am.indexOf(".") < 0 && parseInt(am) == 5000 && num != '0') {
            newAm = am
        } else if (am.indexOf(".") < 0 && parseInt(am) > 5000) {
            newAm = am
        } else if (am.indexOf(".") < 0 && parseInt(am) <= 50000 && am.length >= 5 && num != '.') {
            newAm = am
        } else {
            newAm = am + num
        }
        return newAm
    }
}
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



