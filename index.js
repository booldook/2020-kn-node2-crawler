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
  // console.log(summary);
}
crawler();

/********** puppeteer **********/
const puppeteer = require('puppeteer');
const stringify = require('csv-stringify/lib/sync');
const add_to_sheet = require('./add_to_sheet');
const crawler2 = async () => {
  let summary = [], el, text, cell;
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.116 Safari/537.36");
  /* const map = new Map();
  map.add();
  map.get();
  map.has() */
  for(let [k, v] of rs2.entries()) {
    let rand = Math.random()*1000 + 1000;
    await page.goto(v.link);
    el = await page.$(".story_area .con_tx");
    if(el) {
      text = await page.evaluate(tag => tag.textContent, el);
      //CSV - summary.push([v.num, v.title, v.link, text]);
      cell = 'D' + (k + 2);
      add_to_sheet(movie, cell, 's', text.trim());
    }
    await page.waitFor(rand);
  }
  console.log(summary);
  await page.close();
  await browser.close();
  /*
  // CSV
  const str = stringify(summary);
  fs.writeFileSync('./excel/result.csv', str);
  */
  xlsx.writeFile(file_xlsx, './excel/result.xlsx');
};
crawler2();