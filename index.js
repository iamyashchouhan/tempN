const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

// Endpoint to scrape SMS data
app.get("/scrape/:country/:number", async (req, res) => {
  try {
    const { country, number } = req.params;
    const url = `https://temp-number.com/temporary-numbers/${country}/${number}/1`;

    const response = await axios.get(url);
    const html = response.data;

    // Save HTML code to file
    fs.writeFileSync("sms.html", html);

    // Load HTML from file for processing
    const $ = cheerio.load(html);
    const messages = [];

    $(".direct-chat-msg").each((index, element) => {
      const sender = $(element).find(".direct-chat-name").text();
      const time = $(element).find(".direct-chat-timestamp").text();
      const text = $(element).find(".direct-chat-text").text();

      if (sender.toLowerCase() !== "") {
        messages.push({ sender, time, text });
      }
    });

    // Extract SIM card information
    const simInfo = {
      status: $(".sim-info__status").text().trim(),
      country: $(".sim-info__country p").text().trim(),
      receivedToday: $('.sim-info:contains("Received Today") p').text().trim(),
      activeSince: $('.sim-info:contains("Active since") p').text().trim(),
    };

    res.json({ country, number, messages });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to fetch and process country data
app.get("/country/:country", async (req, res) => {
  try {
    const { country } = req.params;
    const url = `https://temp-number.com/countries/${country}/1`;

    const response = await axios.get(url);
    const html = response.data;

    // Save HTML code to file
    fs.writeFileSync("numbers.html", html);

    // Load HTML from file for processing
    const $ = cheerio.load(html);
    const countryData = [];

    $("div.country-box").each((index, element) => {
      const time = $(element).find(".add_time-top").text().trim();
      const phoneNumber = $(element).find(".card-title").text().trim();

      countryData.push({ time, phoneNumber, country });
    });

    res.json({ country, countryData });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to fetch and process country data
app.get("/allcountry", async (req, res) => {
  try {
    const url = "https://temp-number.com/";
    const response = await axios.get(url);
    const html = response.data;

    // Save HTML code to file
    fs.writeFileSync("country.html", html);

    // Load HTML from file for processing
    const $ = cheerio.load(html);
    const status = "on";
    const countries = [];

    $(".country-link").each((index, element) => {
      const countryLink = $(element).attr("href");
      const countryCode = countryLink.split("/").pop();
      const countryName = $(element).find(".card-title").text().trim();

      // Exclude specific countries
      if (
        countryName.toLowerCase() !== "france" &&
        countryName.toLowerCase() !== "netherlands" &&
        countryName.toLowerCase() !== "poland" &&
        countryName.toLowerCase() !== "lithuania" &&
        countryName.toLowerCase() !== "estonia" &&
        countryName.toLowerCase() !== "timor leste" &&
        countryName.toLowerCase() !== "estonia" &&
        countryName.toLowerCase() !== "italy" &&
        countryName.toLowerCase() !== "hong kong" &&
        countryName.toLowerCase() !== "canada"
      ) {
        countries.push({ countryCode, countryName });
      }
    });

    res.json({ status, countries });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to scrape information
app.get("/info/:country/:number", async (req, res) => {
  try {
    const { country, number } = req.params;
    const url = `https://temp-number.com/temporary-numbers/${country}/${number}/1`;

    const response = await axios.get(url);
    const html = response.data;

    // Save HTML code to file
    fs.writeFileSync("info.html", html);

    // Load HTML from file for processing
    const $ = cheerio.load(html);

    const messages = [];
    $(".direct-chat-msg").each((index, element) => {
      const sender = $(element).find(".direct-chat-name").text();
      const time = $(element).find(".direct-chat-timestamp").text();
      const text = $(element).find(".direct-chat-text").text();

      messages.push({ sender, time, text });
    });

    // Extract SIM card information
    const simInfo = {
      status: $(".sim-info__status").text().trim(),
      country: $(".sim-info__country p").text().trim(),
      receivedToday: $('.sim-info:contains("Received Today") p').text().trim(),
      activeSince: $('.sim-info:contains("Active since") p').text().trim(),
    };

    res.json({ simInfo });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.use("/images", express.static("images"));

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
