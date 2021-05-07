#!/usr/bin/env node
const { program } = require('commander')
const { search } = require('./lib')

program
    .version('1.0.0')
    .description('深圳租房工具')
    .option('-s, --search <type>', '关键字')
program.parse(process.argv)
const options = program.opts()

if (options.search) {
    search(options.search)
} else {
    console.log('请使用-s或--search标志输入查询内容');
}