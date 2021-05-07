const fetch = require('node-fetch')
const cheerio = require('cheerio')
const ejs = require('ejs')
const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const readFile = promisify(fs.readFile)

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.80 Safari/537.36',
    // Opera
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36 OPR/26.0.1656.60',
    'Opera/8.0 (Windows NT 5.1; U; en)',
    'Mozilla/5.0 (Windows NT 5.1; U; en; rv:1.8.1) Gecko/20061208 Firefox/2.0.0 Opera 9.50',
    'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; en) Opera 9.50',
    // Firefox
    'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0',
    'Mozilla/5.0 (X11; U; Linux x86_64; zh-CN; rv:1.9.2.10) Gecko/20100922 Ubuntu/10.10 (maverick) Firefox/3.6.10',
    // Safari
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2',
    // chrome
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
    'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.133 Safari/534.16',
    // 360
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
    // 淘宝浏览器
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.11 TaoBrowser/2.0 Safari/536.11',
    // 猎豹浏览器
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.71 Safari/537.1 LBBROWSER',
    'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; LBBROWSER)',
    'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; QQDownload 732; .NET4.0C; .NET4.0E; LBBROWSER)',
    // QQ浏览器
    'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; QQBrowser/7.0.3698.400)',
    'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; QQDownload 732; .NET4.0C; .NET4.0E)',
    // sogou浏览器
    'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.84 Safari/535.11 SE 2.X MetaSr 1.0',
    'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; SV1; QQDownload 732; .NET4.0C; .NET4.0E; SE 2.X MetaSr 1.0)',
    // maxthon浏览器
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Maxthon/4.4.3.4000 Chrome/30.0.1599.101 Safari/537.36',
]
 
 
//构造请求头-浏览器
function randomHead() {
    return userAgents[
        Math.floor(Math.random() * (0 - userAgents.length) + userAgents.length)
    ];
}
 
//构造请求头-ip
// function returnIp() {
//     return (
//         Math.floor(Math.random() * (10 - 255) + 255) +
//         "." +
//         Math.floor(Math.random() * (10 - 255) + 255) +
//         "." +
//         Math.floor(Math.random() * (10 - 255) + 255) +
//         "." +
//         Math.floor(Math.random() * (10 - 255) + 255)
//     );
// }

function sleep(time) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}

// let search = '南油 9号线'

async function main(search) {
    const pArr = []
    const pages = 2 // 0 - 10
    const contents = []
    const titles = []
    
    for (let i = 0; i < pages; i++) {
        pArr.push(
            fetch(`https://www.douban.com/group/search?start=${i * 50}&cat=1013&group=134156&sort=time&q=${encodeURI(search)}`, {
                headers: {
                    'user-agent': randomHead(),
                }
            })
                .then(res => res.text())
        )
        pArr.push(
            fetch(`https://www.douban.com/group/search?start=${i * 50}&group=637628&cat=1013&q=%E5%8D%97%E6%B2%B9`, {
                headers: {
                    'user-agent': randomHead(),
                }
            })
                .then(res => res.text())
        )
        await sleep(1000)
    }
    
    const pageArr = await Promise.all(pArr)
    
    pageArr.forEach((page, index) => {
        const $ = cheerio.load(page)
        $('tr').each(function (i, el) {
            const titleEl = $(el).children().first().children('a')
            const title = titleEl.attr('title')
            const title_link = titleEl.attr('href')
            // const groupEl = $(el).children().last().children('a')
            // const group = groupEl.text()
            // const group_link = groupEl.attr('href')
            const time = $(el).children().first().next().text()
            if (!titles.includes(title)) {
                contents.push({
                    title,
                    title_link,
                    time
                    // group,
                    // group_link
                })
                titles.push(title)
            }
        })
    })

    const html = await readFile(path.join(__dirname, 'index.ejs'), 'utf8')
    const template = ejs.compile(html)
    const result = template({
        contents
    })
    
    fs.writeFile(path.join(__dirname, '../public/index.html'), result, (err) => err ? console.log(err) : null)
}


module.exports.search = main
// main()