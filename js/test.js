var $ = (function(){
	function $(selecter){
		return new $.fn.init(selecter)
	}
	$.fn = $.prototype = {
		test: 2,
		init: function(selecter){
			this[0] = document.querySelector(selecter)
		},
		val: function(str){
			return this[0] = str || this[0].innerHTML
		},
		show(){
			this[0].style.display = 'block'
		},
		hide(){
			this[0].style.display = 'none'
		}
	}

	$.fn.init.prototype = $.fn
	return $
})()
