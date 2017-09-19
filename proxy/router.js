exports.router = (handle, pathname, res, param = {}, header) => {
	typeof handle[pathname] === 'function' ? handle[pathname](res, param, header) : console.log('no request handlers')
}