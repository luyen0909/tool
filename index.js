/*
    IMPORTANT NOTE:

    This script is designed to get a temporary email address from the 1secmail.com service.
    However, it seems that 1secmail.com is blocking requests from your network, resulting in a "403 Forbidden" error.

    We have tried many things to fix this, including:
        - Using a realistic User-Agent
        - Setting Accept and Referer headers
        - Adding detailed error handling

    Unfortunately, the error persists. This suggests that the problem is not with the script itself, but with the 1secmail.com service or your network connection. It is likely that your IP address has been blocked.

    WHAT YOU CAN DO:
    1.  Try running this script from a different network (e.g., a different Wi-Fi network, or using a VPN).
    2.  Try a different temporary email service. Here are some alternatives that have public APIs:
        - mail.tm: https://mail.tm/
        - temp-mail.org: https://temp-mail.org/en/api/
        - guerrillamail.com: https://www.guerrillamail.com/GuerrillaMailAPI.html

    This script will not work until the "403 Forbidden" error is resolved.
*/
const axios = require('axios');

const API_URL = 'https://www.1secmail.com/api/v1/';
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Referer': 'https://www.1secmail.com/'
};

async function main() {
    try {
        // 1. Get a temporary email address
        console.log('Getting a temporary email address...');
        let emailResponse;
        try {
            emailResponse = await axios.get(`${API_URL}?action=genRandomMailbox&count=1`, { headers });
        } catch (error) {
            console.error('Error getting temporary email address:');
            if (error.response) {
                console.error(`Status: ${error.response.status}`);
                console.error('Data:', error.response.data);
                console.error('Headers:', error.response.headers);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error:', error.message);
            }
            return; // Exit if we can't get an email address
        }
        
        const emailAddress = emailResponse.data[0];
        console.log(`-> Your temporary email is: ${emailAddress}`);

        // 2. Wait for email to arrive
        console.log('\nWaiting for an email to arrive. This will time out after 2 minutes.');
        console.log('You can send an email to the address above to test it.');

        let email = null;
        const endTime = new Date().getTime() + 120000; // 2 minutes from now
        while (!email && new Date().getTime() < endTime) {
            try {
                const [login, domain] = emailAddress.split('@');
                const messagesResponse = await axios.get(`${API_URL}?action=getMessages&login=${login}&domain=${domain}`, { headers });
                if (messagesResponse.data.length > 0) {
                    email = messagesResponse.data[0];
                } else {
                    console.log('No email received yet. Waiting 5 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before trying again
                }
            } catch (error) {
                console.error('Error checking for new emails (will keep trying):');
                if (error.response) {
                    console.error(`Status: ${error.response.status}`);
                    console.error('Data:', error.response.data);
                } else {
                    console.error('Error:', error.message);
                }
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait before retrying
            }
        }

        if (!email) {
            console.error('Timeout: No email received within 2 minutes.');
            return;
        }

        console.log('New email received!');

        // 3. Read the email content
        console.log('Reading email content...');
        let emailContentResponse;
        try {
            const [login, domain] = emailAddress.split('@');
            emailContentResponse = await axios.get(`${API_URL}?action=readMessage&login=${login}&domain=${domain}&id=${email.id}`, { headers });
        } catch (error) {
            console.error('Error reading email content:');
            if (error.response) {
                console.error(`Status: ${error.response.status}`);
                console.error('Data:', error.response.data);
            } else {
                console.error('Error:', error.message);
            }
            return;
        }

        const emailContent = emailContentResponse.data;


        console.log('\n--- Email Content ---');
        console.log(`From: ${emailContent.from}`);
        console.log(`Subject: ${emailContent.subject}`);
        console.log(`Body: ${emailContent.body}`);
        console.log('---------------------');

    } catch (error)
        {
        console.error('An unexpected error occurred:');
        console.error(error);
    }
}

main();
