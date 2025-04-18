// routes/albums.js
const express = require('express')
const router = express.Router()
const s3 = require('../config/s3')

/**
 * GET /api/albums
 * --------------------------------------
 * Returns a list of top-level folders (albums) in the S3 bucket.
 * - Uses `Delimiter: '/'` to group by folder.
 * - Responds with an array of album names like: ["album.1", "album.2"]
 */
router.get('/albums', async (req, res) => {
    const params = {
        Bucket: 'test.poc.new',
        Delimiter: '/',
    }

    try {
        const data = await s3.listObjectsV2(params).promise()
        const albums = data.CommonPrefixes.map(p => p.Prefix.replace('/', ''))
        res.json(albums)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Could not list albums' })
    }
})

/**
 * GET /api/album/:albumName
 * --------------------------------------
 * Returns a list of image (or video) file keys inside a given album (folder).
 * - Assumes each album is a "folder" in the S3 bucket.
 * - Filters out non-media files.
 * - Responds with an array of keys like: ["album.1/image1.jpg", "album.1/image2.png"]
 */
router.get('/album/:albumName', async (req, res) => {
    const album = req.params.albumName

    const params = {
        Bucket: 'test.poc.new',
        Prefix: `${album}/`,
    }

    try {
        const data = await s3.listObjectsV2(params).promise()
        const imageKeys = data.Contents
            .filter(obj => obj.Key.match(/\.(jpg|jpeg|png|gif|mp4)$/i))
            .map(obj => obj.Key)
        res.json(imageKeys)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Could not list album images' })
    }
})

/**
 * GET /image/:album/:filename
 * --------------------------------------
 * Streams a single image or video file from the specified album.
 * - Reads file directly from S3 and pipes it to the browser.
 * - Sends 404 if the file is not found.
 */
router.get('/image/:album/:filename', (req, res) => {
    const { album, filename } = req.params

    const params = {
        Bucket: 'test.poc.new',
        Key: `${album}/${filename}`,
    }

    s3.getObject(params)
        .createReadStream()
        .on('error', () => res.status(404).send('Image not found'))
        .pipe(res)
})

module.exports = router