const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 8000,
  path: '/api/v1/applications/',
  method: 'GET',
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let data = '';
  res.on('data', d => {
    data += d;
  });
  res.on('end', () => {
    console.log(data.substring(0, 500));
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();
