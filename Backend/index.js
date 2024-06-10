const express = require('express');
const fs = require('fs');
const cron = require('node-cron');
const path = require('path');
const { connectToDB } = require('./src/Config/db');
const Entry = require('./src/Models/data.schema');
const app = express();
const PORT = process.env.PORT || 3000;

let logs = [];
app.use(express.json());

function addLog(level, message) {
    const logEntry = { level, message, timestamp: new Date() };
    logs.push(logEntry);
    console.log(`${logEntry.timestamp.toISOString()} [${level.toUpperCase()}]: ${message}`);
}

async function readUpload() {
    const filePath = path.join(__dirname, 'data.json');
    let lastId = await getLastEntryId();

    const dataStream = fs.createReadStream(filePath, { encoding: 'utf8' });

    dataStream.on('data', async (chunk) => {
        try {
            const data = JSON.parse(chunk);
            for (let i = 0; i < data.length; i++) {
                const entry = data[i];
                if (entry.id > lastId) {
                    await insertIntoDB(entry);
                    addLog('success', `Inserted entry with ID: ${entry.id}`);
                }
            }
        } catch (error) {
            addLog('error', `Error processing chunk: ${error.message}`);
        }
    });

    dataStream.on('end', () => {
        addLog('info', 'Finished processing file.');
    });

    dataStream.on('error', (error) => {
        addLog('error', `File read error: ${error.message}`);
    });
}


async function getLastEntryId() {
    try {
        const lastEntry = await Entry.findOne().sort({ id: -1 });
        if (lastEntry) {
            return lastEntry.id;
        } else {
            return 0;
        }
    } catch (error) {
        addLog('error', `MongoDB query error: ${error.message}.`);
        return 0;
    }
}


async function insertIntoDB(entry) {
    try {
        await Entry.create(entry);
    } catch (error) {
        addLog('error', `MongoDB insert error: ${error.message}`);
    }
}
readUpload();

cron.schedule('0 0,12 * * *', () => {
    addLog('info', 'Scheduled task started.');
    readUpload();
});



app.get('/logs', (req, res) => {
    res.json(logs);
});

app.listen(PORT, async() => {
    try {
        await connectToDB();
        console.log(`Server started on port ${PORT}`);
    } catch (error) {
        console.log(error);
    }
});
