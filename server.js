const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const cropRoutes = require('./routes/cropRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const contractRoutes = require('./routes/contractRoute');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve Static Files (Images)
// Note: We serve the 'public' folder so that /images/profiles maps correctly
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/crops', cropRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contract', contractRoutes);
// Chat functionality migrated to Frontend (VoiceAgent.jsx)

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
