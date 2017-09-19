var http = require('http')
	querystring = require('querystring')
	url = require('url')

let opt = {
	// hostname: 'zanzanmd.sssvip4.natapp.cc'
	hostname: 'vfvkxe.natappfree.cc'
}

const getParamHandler = param => {
	let baseStr = '?'
	for(let i in param){
		baseStr += `${i}=${param[i]}&`
	}
	return param === {} ? '' : baseStr
}
const postParamHandler = param => {
	let baseStr = ''
	for(let i in param){
		baseStr += `/${param[i]}`
	}
	return baseStr
}

exports.proxy = (res, param, header) => new Promise((reslove, reject) => {
	let body = ''
	header.authorization ? opt.headers = {
		'Authorization': header.authorization
	} : null
	let fnParam = param.param ? JSON.parse(param.param) : {}
	let req = http.request(Object.assign({}, opt, {
			method: param.method,
			path: param.type === 'normal' ? param.method === 'GET' ? `${param.path}${getParamHandler(fnParam)}` : param.path : `${param.path}${postParamHandler(fnParam)}`
		}, param.method === 'POST' ? {
			headers: Object.assign({}, opt.headers ? opt.headers : {}, {'Content-Type': 'application/x-www-form-urlencoded'})
		} : opt.headers ? {headers: opt.headers} : {}), res => {
			console.log(param.path)
			console.log("Got response: " + res.statusCode);
			res.on('data', d => {
			  	body += d;
			}).on('end', _ => {
			  	reslove(body)
			});
		}).on('error', e => {
		  console.log("Got error: " + e.message);
		})

	param.method === 'POST' && param.type === 'normal' ? req.write(querystring.stringify(fnParam)) : null

	req.end();
}).then(body => {
    res.writeHead(200, {"Content-type": "text/plain"})
    res.write(body)
	res.end()
})







