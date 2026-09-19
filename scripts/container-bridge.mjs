import net from 'node:net';
const socket=net.connect(3000,'127.0.0.1');
process.stdin.pipe(socket); socket.pipe(process.stdout);
socket.on('error',()=>process.exit(1));
socket.on('close',()=>process.exit(0));
