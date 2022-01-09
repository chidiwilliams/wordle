const axios = require('axios');
const { writeFileSync } = require('fs');

// URLs for all 15 pages
const urls = ['https://www.bestwordlist.com/5letterwords.htm'];
for (let i = 2; i <= 15; i++) {
  urls.push('https://www.bestwordlist.com/5letterwordspage' + i + '.htm');
}

// Fetch the responses from all 15 pages, merge, and write to output file
Promise.all(urls.map((url) => getWordsFromURL(url))).then((responses) => {
  const words = new Set(responses.flat(1));
  writeFileSync('./src/data/words.json', JSON.stringify(Array.from(words)));
});

// Matches all 5 letter words in the URL response body
function getWordsFromURL(url) {
  return axios.get(url).then((response) => {
    return [...response.data.matchAll(/[A-Z]{5}/g)].map((match) => match[0].toLowerCase());
  });
}
