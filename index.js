#!/usr/bin/env node

const fs = require('fs');

/********** csv 가져오기 **********/
const csv = require('csv-parse/lib/sync');
const file = fs.readFileSync('./excel/movie.csv');
//console.log(file.toString('utf-8'));
const rs = csv(file.toString('utf-8'));
//console.log(rs);

/********** xlsx 가져오기 **********/
const xlsx = require('xlsx');
const file_xlsx = xlsx.readFileSync('./excel/movie.xlsx');
const movie = file_xlsx.Sheets.movie;
const rs2 = xlsx.utils.sheet_to_json(movie);
//console.log(rs2);


/********** axios, cheerio **********/
const axios = require('axios');
const cheerio = require('cheerio');
const crawler = async () => {
  let result, $, text, summary = [];
  for(let v of rs2) {
    result = await axios.get(v.link);
    // console.log(result.data);
    $ = cheerio.load(result.data);
    text = $(".story_area .con_tx").text();
    summary.push(text);
  }
  //console.log(summary);
}
crawler();

/********** puppeteer **********/
const puppeteer = require('puppeteer');
const crawler2 = async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto(rs2[0].link);
  await page.waitFor(2000);
  await page.goto(rs2[1].link);
  await page.waitFor(3000);
  await page.close();
  await browser.close();
};
crawler2();