const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = process.env.PORT || 3000;

app.get('/scrape/:country/:number', async (req, res) => {
  try {
    const { country, number } = req.params;
    const url = `https://temp-number.com/temporary-numbers/${country}/${number}/1`;

    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const messages = [];
    $('.direct-chat-msg').each((index, element) => {
      const sender = $(element).find('.direct-chat-name').text();
      const time = $(element).find('.direct-chat-timestamp').text();
      const text = $(element).find('.direct-chat-text').text();

      messages.push({ sender, time, text });
    });

    res.json({ country, number, messages });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/country/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const url = `https://temp-number.com/countries/${country}/1`;

    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Now you can use jQuery-like syntax to manipulate the HTML content
    const countryData = [];
    $('div.country-box').each((index, element) => {
      const time = $(element).find('.add_time-top').text().trim();
      const phoneNumber = $(element).find('.card-title').text().trim();

      countryData.push({ time, phoneNumber, country });
    });

    res.json({ country, countryData });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/allcountry', async (req, res) => {
  try {
    const url = 'https://temp-number.com/';
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const status = "on";
    const countries = [];
    $('.country-link').each((index, element) => {
      const countryLink = $(element).attr('href');
      const countryCode = countryLink.split('/').pop();
      const countryName = $(element).find('.card-title').text().trim();

      countries.push({ countryCode, countryName });
    });

    res.json({ status, countries });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use('/images', express.static('images'));


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
