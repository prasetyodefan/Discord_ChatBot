const puppeteer = require('puppeteer');
const delay = require('delay');
const fs = require('fs');
const CronJob = require('cron').CronJob;
const fetch = require('node-fetch');
const translate = require('translate-google')

const reqToChatBot = (text) => new Promise((resolve, reject) => {
    for (let index = 0; index < 2; index++) {
        fetch('https://rebot.me/ask', {
            method: 'POST',
            headers: {
                'authority': 'rebot.me',
                'sec-ch-ua': '"Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93"',
                'sec-ch-ua-mobile': '?0',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'accept': '*/*',
                'x-requested-with': 'XMLHttpRequest',
                'sec-ch-ua-platform': '"macOS"',
                'origin': 'https://rebot.me',
                'sec-fetch-site': 'same-origin',
                'sec-fetch-mode': 'cors',
                'sec-fetch-dest': 'empty',
                'referer': 'https://rebot.me/simsimi',
                'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
            },
            body: `username=simsimi&question=${decodeURI(text)}`
        })
            .then(res => res.text())
            .then(res => {
                if (index === 1) {
                    resolve(res)
                }
            })
            .catch(err => {
                reject(err);
            })

    }
});

const translates = (text) => new Promise((resolve, reject) => {
    translate(text, {
        from: 'en',
        to: 'id'
    }).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    });
});

(async () => {
    
    const width = 1200
    const height = 700

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: {
            width,
            height
        }
    });

    const url = 'https://discord.com/channels/872896252638019605/872911192820162650';
    const page = await browser.newPage();
    await page.goto(url, {
        waitUntil: 'networkidle0',
    });

    await page.waitForNavigation({ waitUntil: 'networkidle0' , timeout: 700000});

    const job = new CronJob('*/6 * * * *', async function () {
        console.log('Every 6 Minutes!')
        await page.bringToFront()
        const general = "#channels > div > div:nth-child(20) > div";
        const idindonesia = "#channels > div > div:nth-child(22) > div";
        const comment = "#app-mount > div.app-1q1i1E > div > div.layers-3iHuyZ.layers-3q14ss > div > div > div > div.content-98HsJk > div.chat-3bRxxu > div.content-yTz4x3 > main > form > div:nth-child(1) > div > div > div.scrollableContainer-2NUZem.webkit-HjD9Er > div > div.textArea-12jD-V.textAreaSlate-1ZzRVj.slateContainer-3Qkn2x > div.markup-2BOw-j.slateTextArea-1Mkdgw.fontSize16Padding-3Wk7zP > div";

        const textEnglishResult = await reqToChatBot('A fact of vast moment');
        const translateResult = await translates(textEnglishResult)

        await page.click(general)
        await page.click(general)
        await delay(2000)
        await page.type(comment, textEnglishResult)
        await delay(2000)
        await page.keyboard.press('Enter');

        await page.click(idindonesia)
        await page.click(idindonesia)
        await delay(2000)
        await page.type(comment, translateResult)
        await delay(2000)
        await page.keyboard.press('Enter');
        console.log("SUCCESS COMMENT")
    }, null, true, 'Asia/Jakarta');
    job.start();



}

)();