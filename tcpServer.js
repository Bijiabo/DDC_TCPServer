/**
 * Created by huchunbo on 2017/4/29.
 */
var net = require('net');
var sql = require('./sql');

var HOST = '0.0.0.0';
var PORT = Number(process.env.PORT) || 2008;

sql.connect(function () {
    console.log('sql did connected.');
});

// 创建一个TCP服务器实例，调用listen函数开始监听指定端口
// 传入net.createServer()的回调函数将作为”connection“事件的处理函数
// 在每一个“connection”事件中，该回调函数接收到的socket对象是唯一的
var tcpConnects = {};

net.createServer(function(sock) {
    
    // 我们获得一个连接 - 该连接自动关联一个socket对象
    console.log('CONNECTED: ' +
        sock.remoteAddress + ':' + sock.remotePort);
    
    var uuid = '';
    var lastestDataTime = new Date(); // 最后一次有数据通讯的时间
    
    // 为这个socket实例添加一个"data"事件处理函数
    sock.on('data', function(data) {
        var dataString = data.toString();
        lastestDataTime = new Date(); // 更新最后一次有数据通讯的时间
        console.log('DATA ' + sock.remoteAddress + ': ' + data);
        
        // 设定 uuid
        if (dataString[0] == '_' && dataString.slice(-1) == '_') {
            uuid = dataString.replace(/^_|_$/ig, '');
            return;
        }
        
        if (tcpConnects[uuid] == dataString) { return; }
        var tableName = 'device_logs';
        var sqlStatement = "INSERT INTO "+tableName+" (log, uuid, mark, created_at, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
        sql.query(sqlStatement, [dataString, uuid, false], function(err, res) {
            if(err) {
                return console.error('error running query', err);
            }
        
            // console.log('number:', res);
        });
        tcpConnects[uuid] = dataString;
        
    });
    
    // 为这个socket实例添加一个"close"事件处理函数
    sock.on('close', function(data) {
        console.log(
            'CLOSED: ' +
            sock.remoteAddress + ' ' +
            sock.remotePort
        );
    });
    
    // 非正常断开
    sock.on("error", function (err) {
        // dosomething...
        console.log(
            'Error: ' +
            sock.remoteAddress + ' ' +
            sock.remotePort
        );
    });
    
    // 超时自动断开连接，防止死链
    var checkConnectIntervalTime = 1000 * 20; //每 20s 检测一下是否断开连接
    var checkConnectIntervalID = setInterval(function () {
        var currentTime = new Date();
        if (currentTime - lastestDataTime > checkConnectIntervalTime) {
            console.log('检测到通讯异常，销毁连接：' + uuid + ' -> ' + sock.remoteAddress );
            sock.destroy();
            clearInterval(checkConnectIntervalID);
        }
    }, checkConnectIntervalTime);
    
}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);