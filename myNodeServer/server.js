const express = require('express');
const bodyParser = require('body-parser');
const XLSX = require('xlsx');
const app = express();

const FILE_PATH = 'SDG topic list.xlsx';  // Adjust to your file's location and name

app.use(bodyParser.json());
app.use(express.static('public'));  // Serve static files from 'public' directory

// Get available topics from the Excel file
app.get('/getAvailableTopics', (req, res) => {
    const workbook = XLSX.readFile(FILE_PATH);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const availableTopics = data.filter(row => !row.School).map(row => row.Topic);
    res.json(availableTopics);
});

// Choose a topic and update the Excel file
app.post('/chooseTopic', (req, res) => {
    const { topic, school, nameInCharge, email, phoneNumber, numParticipants } = req.body;

    const workbook = XLSX.readFile(FILE_PATH);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    let updated = false;

    for (let i = 0; i < data.length; i++) {
        if (data[i].Topic === topic && !data[i].School) {
            data[i].School = school;
            data[i].NameInCharge = nameInCharge;
            data[i].Email = email;
            data[i].PhoneNumber = phoneNumber;
            data[i].NumParticipants = numParticipants;

            const updatedWorksheet = XLSX.utils.json_to_sheet(data);
            workbook.Sheets[firstSheetName] = updatedWorksheet;
            XLSX.writeFile(workbook, FILE_PATH);
            
            updated = true;
            break;
        }
    }

    res.json({ success: updated });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
