require('http').createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.end(require('fs').readFileSync('./mock.json'))
}).listen(3000, (err) => {
  if (err) {
    console.error(err)
  }
  console.log('Listen to port 3000')
})
