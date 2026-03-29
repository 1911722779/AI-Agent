// exec 执行命令的tool
import {
    spawn
    // node 内置模块 
    // 创建一个子进程
    // 线程 是执行的最小单位
    // 主进程 node node-exec.mjs
    // 执行npm i  npm run dev npm init vite
    // cmd 命令本身就是进程 不能阻塞主进程
    // node 是多进程架构
    // 拆分成为 父子进程 父 启动子进程 子进程执行命令 父进程等待子进程执行完成
    // 父mini-cursor 启动 子进程
} from 'node:child_process';
// bash 命令
// git bash 
const command = 'ls -la';
// 新建一个子进程
const [cmd,...args] = command.split(' '); // 列出当前目录下的所有文件和目录
const cwd = process.cwd();
console.log(`当前工作目录:, ${cwd}`);
// 并发
const child = spawn(command, args, {
    cmd,
    // 继承父进程的输入输出流 stdin stdout stderr
    stdio: 'inherit', // 继承父进程的输入输出流
    shell: true // 使用shell执行命令
})

// 等待子进程执行完成
let errorMsg = '';

child.on('error', (error) => {
    errorMsg = error.message;
});

child.on('close',(code)=>{
    if(code ===0){
        // 成功退出
        console.log('命令执行成功,子进程退出');
        process.exit(0);
    }else {
        if(errorMsg) {
            console.error(`错误: ${errorMsg}`);
        }
        process.exit(code || 1);
    }
})
