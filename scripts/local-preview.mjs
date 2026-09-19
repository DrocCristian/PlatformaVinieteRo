// Loopback-only TCP relay. The application and compilation stay inside Docker.
import net from 'node:net';
import {spawn} from 'node:child_process';
const server=net.createServer(socket=>{
  const child=spawn('docker',['exec','-i','platformavinietero-dev-20260919','node','/workspace/scripts/container-bridge.mjs'],{windowsHide:true,stdio:['pipe','pipe','pipe']});
  socket.pipe(child.stdin);child.stdout.pipe(socket);
  child.stderr.on('data',data=>process.stderr.write(data));
  child.stdin.on('error',()=>socket.destroy());
  child.on('error',()=>socket.destroy());child.on('exit',()=>socket.destroy());
  socket.on('error',()=>child.kill());socket.on('close',()=>child.kill());
});
server.on('error',error=>{console.error(error.message);process.exit(1);});
server.listen(3000,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:3000'));
