const Api = (_ => {
	const api = function(){}
	api.prototype = {
		test(){console.log(1)}
	}
	return new api()
})()