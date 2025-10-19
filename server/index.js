require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');
const uniqid = require('uniqid');

const app = express();
app.use(express.json());

app.use(cors({
  origin: ['http://localhost:8080', 'https://ted-x-auc.vercel.app']
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-VERIFY']
}));

const PORT = 3001;
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY;
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX;
const PHONEPE_HOST_URL = process.env.PHONEPE_HOST_URL;
const CLIENT_URL = process.env.CLIENT_URL;

app.post('/api/payment/initiate', async (req, res) => {
    const { amount } = req.body;
    if (!amount) {
        return res.status(400).send({ message: 'Amount is required' });
    }
    const merchantTransactionId = uniqid('MUID-');
    const redirectUrl = `${CLIENT_URL}/payment-status/${merchantTransactionId}`;

    const data = {
        merchantId: PHONEPE_MERCHANT_ID,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: `MUID-${uniqid()}`,
        amount: amount * 100, // Amount in paise
        redirectUrl: redirectUrl,
        // --- THIS IS THE FIX ---
        redirectMode: 'REDIRECT', // Changed from 'POST' to 'REDIRECT'
        // -----------------------
        callbackUrl: `https://webhook.site/callback-url`, // This is for server-to-server notifications, can be left as is
        paymentInstrument: {
            type: 'PAY_PAGE'
        }
    };

    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString('base64');
    const keyIndex = PHONEPE_SALT_INDEX;
    const string = payloadMain + '/pg/v1/pay' + PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + keyIndex;

    try {
        const response = await axios.post(`${PHONEPE_HOST_URL}/pg/v1/pay`, {
            request: payloadMain
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'accept': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error initiating payment:", error.response ? error.response.data : error.message);
        res.status(500).send({
            message: 'Error initiating payment',
            error: error.response ? error.response.data : error.message
        });
    }
});

app.get('/api/payment/status/:merchantTransactionId', async (req, res) => {
    const { merchantTransactionId } = req.params;
    const keyIndex = PHONEPE_SALT_INDEX;
    const string = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}` + PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + keyIndex;

    try {
        const response = await axios.get(`${PHONEPE_HOST_URL}/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}`, {
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': PHONEPE_MERCHANT_ID,
                'accept': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error checking status:", error.response ? error.response.data : error.message);
        res.status(500).send({
            message: 'Error checking payment status',
            error: error.response ? error.response.data : error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
