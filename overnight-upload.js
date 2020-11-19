/* eslint no-restricted-syntax: 0 */

const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const timer = (ms) => new Promise((res) => setTimeout(res, ms));

async function main() {
  const dir = await fs.promises.opendir('./logs-for-upload');
  let dirent;
  while ((dirent = dir.readSync()) !== null) {
    console.log(dirent.name);

    const readStream = fs.createReadStream(`./logs-for-upload/${dirent.name}`);

    const form = new FormData();
    form.append('file', readStream);

    axios.post('http://localhost:3003/upload', form, {
      headers: form.getHeaders(),
    });

    await timer(60000);
  }
}
main();
