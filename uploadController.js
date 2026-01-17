const mult = require('multer');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Multer Storage (Memory for processing)
const storage = mult.memoryStorage();

// File Filter
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images only!'));
    }
};

const upload = mult({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Controller Function
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filename = `profile-${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;

        // 1. Compress Image using Sharp
        const compressedImageBuffer = await sharp(req.file.buffer)
            .resize(500, 500, { fit: 'cover' }) // Resize to reasonable profile dimensions
            .webp({ quality: 80 }) // Convert to WebP and compress
            .toBuffer();

        // 2. Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('profiles')
            .upload(filename, compressedImageBuffer, {
                contentType: 'image/webp',
                upsert: false
            });

        if (error) {
            console.error('Supabase Upload Error:', error);
            throw error;
        }

        // 3. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('profiles')
            .getPublicUrl(filename);

        res.status(200).json({
            message: 'Image uploaded successfully',
            imageUrl: publicUrl
        });

    } catch (error) {
        console.error('Server Upload Error:', error);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
};

module.exports = {
    upload,
    uploadImage
};
