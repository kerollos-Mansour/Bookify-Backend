const express = require('express');
const router = express.Router();
const upload = require('../../../shared/config/multer.config');
const { uploadImage } = require('../controller/image.controller');

router.post('/upload', upload.single('image'), uploadImage);

module.exports = router;
