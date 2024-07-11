const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

//index.html is being served
const app = express();
app.set('view engine', 'hbs');

mongoose.connect('mongodb://localhost:27017/imageUploader');

const imageSchema = new mongoose.Schema({
    filename: String,
});

app.use(express.static('public'));//within same directoey
app.use(express.static('views'));
app.use(express.static(path.join(__dirname, 'styles')));//differ the appli to appli

app.use('/uploads', express.static(path.join(__dirname, 'views', 'uploads')));//middleware
const Image = mongoose.model('Image', imageSchema);

const storage = multer.diskStorage({//storage engine
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'views', 'uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);//give new file name to prevent naming conflicts
    },
});

const upload = multer({ storage: storage });//data is being pushed

// app.post('/upload', upload.single('file'), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ success: false, message: 'No file uploaded' });
//         }

//         const newImage = new Image({ filename: req.file.filename });
//         await newImage.save();
//         res.json({ success: true, message: 'Image uploaded successfully' });
//     } catch (error) {
//         console.error('Upload error:', error.message);
//         res.status(500).json({ success: false, error: error.message });
//     }
// });
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const newImage = new Image({ filename: req.file.filename });
        await newImage.save();
        res.json({ success: true, message: 'Image uploaded successfully' });
    } catch (error) {
        console.error('Upload error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// app.delete('/delete/:id', async (req, res) => {
//     try {
//         const imageToDelete = await Image.findById(req.params.id);
//         if (!imageToDelete) {
//             return res.status(404).json({ success: false, message: 'Image not found' });
//         }

//         const imagePath = path.join(__dirname, 'views', 'uploads', imageToDelete.filename);
//         fs.unlinkSync(imagePath);

//         await imageToDelete.remove();

//         res.json({ success: true, message: 'Image deleted successfully' });
//     } catch (error) {
//         console.error('Error:', error.message);
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

app.get('/image', async (req, res) => {
    try {
        const images = await Image.find().select('filename -_id');
        const filenames = images.map(image => image.filename);

        if (filenames.length > 0) {
            res.render('image', { images: filenames });
        } else {
            res.status(404).json({ success: false, message: 'No images found' });
        }
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});


// app.get('/image', async (req, res) => {
//     try {
//         const filena = await Image.findOne();
//         if (filena) {
//             const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filena.filename}`;
//             console.log('Uploaded image URL:', imageUrl);
//             res.render('image', { imageUrl: imageUrl });
//         } else {
//             console.error('No image found in the database');
//             res.status(404).json({ success: false, message: 'No image found' });
//         }
//     } catch (error) {
//         console.error('Error:', error.message);
//         res.status(500).json({ success: false, error: error.message });
//     }
// });


app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});
