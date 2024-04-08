const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;


app.get('/info/:country/:number', async (req, res) => {
    const { country, number } = req.params;

    try {
        // Send a POST request to fetch numbers
        const response = await axios.post('https://api-1.online/post/?action=GetFreeNumbers&type=user', {
            country_name: country,
            limit: 10,
            page: 1
        }, {
            headers: {
                'Authorization': 'Bearer ad49fc981fae0a134e6672c8bafee91f',
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept-Encoding': 'gzip, deflate, br',
                'User-Agent': 'okhttp/4.9.2'
            }
        });

        // Extract numbers array from the response
        const numbers = response.data.Available_numbers;

        // Find details of the specific number
        const foundNumber = numbers.find(num => num['E.164'] === `+${number}` || num.number === number);

      const status = foundNumber.status.charAt(0).toUpperCase() + foundNumber.status.slice(1);


        if (foundNumber) {
            const simInfo = {
                status: status,
                country: foundNumber.country,
                receivedToday: `Received Today 198 SMS`,
                activeSince: `Active since ${foundNumber.time}`
            };

            res.json({ simInfo });
        } else {
            res.status(404).json({ error: 'Number not found' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});







app.get('/scrape/:country/:number', async (req, res) => {
    const { country, number } = req.params;

    try {
        const response = await axios.post('https://api-1.online/post/getFreeMessages', {
            no: `+${number}`,
            page: 1
        }, {
            headers: {
                'Authorization': 'Bearer ad49fc981fae0a134e6672c8bafee91f',
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept-Encoding': 'gzip, deflate, br',
                'User-Agent': 'okhttp/4.9.2'
            }
        });

        // Extract messages from the response
        const messages = response.data.messages.map(message => ({
            sender: message.FromNumber.replace('+', ''),
            time: message.message_time,
            text: message.Messagebody
        }));

        // Construct the desired response object
        const responseData = {
            country: country.replace('-', ' '),
            number: number.replace('-', ''),
            messages: messages
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



async function sendPostRequests(countryName) {
    try {
        const response = await axios.post('https://api-1.online/post/?action=GetFreeNumbers&type=user', {
            country_name: countryName.replace(/-/g, ' '), // Remove dashes from country name
            limit: 10,
            page: 1
        }, {
            headers: {
                'Authorization': 'Bearer ad49fc981fae0a134e6672c8bafee91f',
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept-Encoding': 'gzip, deflate, br',
                'User-Agent': 'okhttp/4.9.2'
            }
        });

        return response.data; // Return the response JSON
    } catch (error) {
        throw new Error('Error:', error);
    }
}

app.get('/country/:country', async (req, res) => {
    try {
        const countryName = req.params.country.replace(/-/g, ' '); // Remove dashes from country name
        const responseData = await sendPostRequests(countryName);

        // Extract and transform the data
        const countryData = responseData.Available_numbers.map(item => ({
            time: item.time,
            phoneNumber: item['E.164'].replace('+', ''),
            country: item.country.replace(/\s+/g, '-') // Replace spaces with dashes in country name
        }));

        res.json({ country: countryName, countryData: countryData });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


async function sendPostRequest() {
    try {
        const response = await axios.post('https://api-1.online/get/?action=country', {
            // Add any request body data here if needed
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip, deflate, br',
                'User-Agent': 'okhttp/4.9.2'
            }
        });

        // Extract required fields and format the data
        const formattedData = response.data.records.map(record => ({
            countryCode: record.Country_Name.replace(/\s+/g, '-'),
            countryName: record.Country_Name
        }));

        return { status: 'on', countries: formattedData };
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

app.get('/allcountry', async (req, res) => {
    try {
        // Trigger the function to send the POST request
        const responseData = await sendPostRequest();
        res.json(responseData); // Send response data as JSON
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.use("/images", express.static("images"));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
