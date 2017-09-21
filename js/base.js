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


const successImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJMAAACTCAYAAACK5SsVAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjlCRDk3NDUxOUU3QjExRTdBMDg0OTZEMkE0QUYyRTVGIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjlCRDk3NDUyOUU3QjExRTdBMDg0OTZEMkE0QUYyRTVGIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OUJEOTc0NEY5RTdCMTFFN0EwODQ5NkQyQTRBRjJFNUYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OUJEOTc0NTA5RTdCMTFFN0EwODQ5NkQyQTRBRjJFNUYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4lrBhbAAAOOElEQVR42uxd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'