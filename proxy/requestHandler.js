var http = require('http')
	querystring = require('querystring')
	url = require('url')

let opt = {
	// hostname: 'auth.qdxiao2.com'
	hostname: '192.168.1.101',
	port: '8080'
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
	let body = '',
		req,
		method = param.type.toUpperCase(),
		path = param.path
	delete param.type
	delete param.path
	path = method === 'POST' ? path : `${path}${getParamHandler(param)}`
	req = http.request(Object.assign({}, opt, { method, path }, {headers: Object.assign({'user-agent': header['user-agent']}, path === '/pay/rest/v1/createOrder' ? {'Content-Type' : 'application/json'} : {})}), res => {
			console.log("Got response: " + res.statusCode)
			res.on('data', d => {
			  	body += d
			}).on('end', _ => {
			  	reslove(body)
			})
		}).on('error', e => {
		  console.log("Got error: " + e.message)
		})
	method === 'POST' ? req.write(path === '/pay/rest/v1/createOrder' ? JSON.stringify(param) : querystring.stringify(param)) : null
	req.end()
}).then(body => {
    res.writeHead(200, {"Content-type": "text/plain"})
    res.write(body)
	res.end()
})







