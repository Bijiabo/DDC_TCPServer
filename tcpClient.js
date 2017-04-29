/**
 * Created by huchunbo on 2017/4/29.
 */
var net = require('net');

var HOST = '127.0.0.1';
var PORT = 2008;

var client = new net.Socket();
client.connect(PORT, HOST, function() {
    
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    // 建立连接后立即向服务器发送数据，服务器将收到这些数据
    client.write('_local_server_');
    
    setInterval(function () {
        client.write('biubiubiu' + new Date() + '\r\n\r');
    }, 1000);
});

// 为客户端添加“data”事件处理函数
// data是服务器发回的数据
client.on('data', function(data) {
    
    console.log('DATA: ' + data);
    // 完全关闭连接
    // client.destroy();
    
});

// 为客户端添加“close”事件处理函数
client.on('close', function() {
    console.log('Connection closed');
});