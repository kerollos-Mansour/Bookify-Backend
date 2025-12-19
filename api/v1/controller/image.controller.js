const uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: 'fail', message: 'No image uploaded. Make sure the field name is "image".' });
    }

    res.status(200).json({
        status: 'success',
        message: 'Image uploaded successfully',
        data: {
            imageUrl: req.file.path,
            publicId: req.file.filename
        }
    });
};

module.exports = { uploadImage };
