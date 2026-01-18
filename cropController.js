const crops = require('../data/crops');

const getCrops = (req, res) => {
    try {
        const { season } = req.query;
        let filteredCrops = crops;

        if (season) {
            // Simple case-insensitive filtering
            filteredCrops = crops.filter(crop =>
                crop.season.toLowerCase() === season.toLowerCase() ||
                (season.toLowerCase() === 'all' ? true : false)
            );
        }

        res.status(200).json(filteredCrops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCrops };
