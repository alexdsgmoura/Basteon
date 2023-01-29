const fs = require("fs")
const cidr = require('cidr-range')
const request = require('request')

require('events').defaultMaxListeners = 0;

const cloudflare = cidr('18.160.0.0/15')

const sleep = ms => new Promise(r => setTimeout(r, ms));

const Injector = proxy => {
	return new Promise((resolve) => {
		var req = request({
			url: 'http://d38kumea3y2lw4.cloudfront.net',
			method: 'GET',
			headers: {
				'Host': 'd38kumea3y2lw4.cloudfront.net',
				'Upgrade': 'websocket'
			},
			timeout: 10000,
			proxy: 'http://' + proxy + ':80',
		})
		.on('response', function (response) {
			req.abort(0);
			if (response.statusCode == 101) {
				resolve({ status: 200, proxy, message: 'PROXY LIVE' });
			} else if (response.statusCode === 200) {
				resolve({ status: 200, proxy, message: 'PROXY POSSIVELMENTE LIVE' });
			} 
			
			else {
				resolve({ status: 400, proxy, message: 'PROXY DIE' });
			}
		})
		.on('error', function (err) {
			resolve({ status: 400, proxy, message: 'PROXY ERROR' });
		})
		.on('timeout', function () {
			resolve({ status: 400, proxy, message: 'PROXY TIMEOUT' });
		})
	})
}

(async () => {
	for (proxy of cloudflare) {
		Injector(proxy).then((res) => {
			console.log(res);
			if (res.status == 200) fs.appendFileSync('proxy_live.txt', `${proxy}\n`);
		})
		await sleep(2000);
	}
})();

