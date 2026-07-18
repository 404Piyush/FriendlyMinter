import { POST } from './src/app/api/collections/route.ts';
const req = new Request('http://localhost/api/collections', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({name:'Test',symbol:'T',maxDepth:10,maxBufferSize:16,canopyDepth:3}),
});
try {
  const res = await POST(req);
  console.log('status', res.status);
  console.log('body', await res.text());
} catch (err) {
  console.error('ERR', err.message);
}
