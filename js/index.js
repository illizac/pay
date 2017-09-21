'use strict'
//光标调用
dlb.byQs('.tickets').style.display = Api.IsWeixinOrAlipay() === 'wx' ? 'block' : 'none'
let mark = setInterval((_ => {
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
//-------------------------------------------------------------------------------------------//
let p = location.search.substring(1, location.search.length).split('&').map(val => {
	let o = {}, a
	a = val.split('=')
	o[a[0]] = a[1]
	return o
})
let param = Object.assign(p[0], p[1])
dlb.byId('openid').value = param.o
dlb.byId('qrcode').value = param.q

Api.getShopInfo({
	qrcode: param.q
}).then(data => {
	dlb.byId("merchantDiscount").value = data.platformDiscount
	dlb.byId("shop").value = JSON.stringify(data)
	document.title = data.shopName
})

dlb.addEvent(dlb.byQs('.tickets'), 'click', _ => {
	movePage()
	Api.getcarddata(param).then(data => {
		let html = `<li class='cardNone'>
		        <span>不使用优惠券</span>
		        <div class='img'></div>
		    </li>`
		for(let i of data.data || []){
			let type = i.couponType === '1' ? '优惠券' : '红包'
			html += dlb.byId('transactionPrice').value >= i.fullAmount ? `<li class='cardItem'>
				<span id='carddetail' style="display: none;">${JSON.stringify({id: i.id, count: i.discountAmount})}</span>
		        <div class='cardContent'>
		            <div class='cardCount'>
		                <p><span>¥</span>${i.discountAmount}</p>
		                <p>${type}</p>
		            </div>
		            <div class='cardMess'>
		                <div>
		                    <p>店铺${i.discountAmount}元${type}</p>
		                    <p>进店消费满${i.fullAmount}元可用</p>
		                </div>
		                <div class='img'></div>
		            </div>
		        </div>
		        <div class='cardBottom'>
		            <span>有效期： ${i.startDate.split(' ')[0]} 至 ${i.deadline.split(' ')[0]}</span>
		            <span>未使用</span>
		        </div>
		    </li>` : ''
		}
		appendDom('.cardContainer', html)
		dlb.addEvent(dlb.byQs('.cardNone'), 'click', e => {
			e = e || window.event
			saveCard(e, 'none')
		})
		for(let elem of dlb.byQsa('.cardItem')){
			dlb.addEvent(elem, 'click', saveCard)
		}
	})
})

dlb.addEvent(dlb.byId('lastpay'), 'click', _ => 
	wechatApliy()
	.then(data => {
		let useagent = Api.IsWeixinOrAlipay()
		return useagent ? useagent === 'aliy' ? tradePay(data) : useagent === 'wx' ? onBridgeReady(data) : null : null
	})
	.then(res => {
		clearInterval(marker)
		res ? dlb.byQs('.page').innerHTML = successDom({
			all: dlb.byId("transactionPrice").value,
			cut: dlb.byId("platformTransactionAmount").value
		}) : (
			showToast('支付失败'),
			setTimeout(_ => hideToast(), 300)
		)
	})
)




































