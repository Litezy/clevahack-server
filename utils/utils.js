const cloudinary = require('cloudinary').v2
const path = require('path')
const fs = require('fs')

exports.ServerError = (res, error) => {
    res.status(500).send({ message: error.message })
}
exports.WebName = 'Innovators'



exports.GlobalImageUploads = async (images, uploadPath, path_id) => {
    const isProduction = process.env.NODE_ENV === 'production'
    if (!images || images.length === 0) {
        throw new Error('No images uploaded')
    }

    let imgUrls = []

    if (isProduction) {
        try {
            for (const img of images) {
                const folder = `innovators/${uploadPath}/${path_id}`
                const { tempFilePath } = img
                const { secure_url } = await cloudinary.uploader.upload(tempFilePath, { folder: folder })
                imgUrls.push(secure_url)
            }
        } catch (error) {
            console.error('Error uploading images:', error)
            throw new Error('Image upload failed')
        }
    } else {
        try {
            const date = new Date()
            const timestamp = date.getTime()
            const baseURI = `http://localhost:${process.env.PORT || 5004}`

            for (const img of images) {
                const fileName = `${timestamp}`
                const filePath = path.join('public', uploadPath, path_id)
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath, { recursive: true })
                }
                const fullPath = path.join(filePath, `${fileName}.jpg`)
                await img.mv(fullPath)
                const localUrl = `${baseURI}/${uploadPath}/${path_id}/${fileName}.jpg`
                imgUrls.push(localUrl)
                console.log(`Local URL for image:`, localUrl)
            }
        } catch (error) {
            console.error('Error saving images locally:', error)
            throw new Error('Local image save failed')
        }
    }

    return imgUrls
}



exports.GlobalDeleteSingleImage = async (imageUrl) => {
    const isProduction = process.env.NODE_ENV === 'production';
    if (!imageUrl || typeof imageUrl !== 'string') return;

    if (isProduction) {
        try {
            const parts = imageUrl.split('/');
            const publicIdIndex = parts.findIndex(part => part === 'upload') + 2; 
            const publicId = parts.slice(publicIdIndex).join('/').replace(/\.[^/.]+$/, '');

            const result = await cloudinary.uploader.destroy(publicId);
            if (result.result === 'ok') {
                console.log(`Deleted from Cloudinary: ${publicId}`);
            } else {
                console.log(`Cloudinary deletion failed: ${JSON.stringify(result)}`);
            }
        } catch (error) {
            console.error(`Cloudinary delete error for ${imageUrl}:`, error);
            throw error
        }
    } else {
        const filePath = imageUrl.replace(`http://localhost:${process.env.PORT}/`, 'public/');
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

}


exports.GlobalVideoUploads = async (videos, path, path_id) => {
    const isProduction = process.env.NODE_ENV === 'production'
    if (!videos || videos.length === 0) {
        throw new Error('No videos uploaded')
    }

    let videoUrls = []

    if (isProduction) {
        try {
            for (const video of videos) {
                const folder = `innovators/${path}/${path_id}`
                const { tempFilePath } = video
                const { secure_url } = await cloudinary.uploader.upload(tempFilePath, { folder: folder, resource_type: 'video' })
                videoUrls.push(secure_url)
            }
        } catch (error) {
            console.error('Error uploading videos:', error)
            throw new Error('Video upload failed')
        }
    } else {
        try {
            const date = new Date()
            const timestamp = date.getTime()
            const baseURI = 'http://localhost:3000'

            for (const video of videos) {
                const fileName = `${timestamp}-${path_id}`
                const filePath = path.join('public', path, path_id)
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath, { recursive: true })
                }
                const fullPath = path.join(filePath, `${fileName}.mp4`)
                await video.mv(fullPath)
                const localUrl = `${baseURI}/${path}/${path_id}/${fileName}.mp4`
                videoUrls.push(localUrl)
                console.log(`Local URL for video:`, localUrl)
            }
        } catch (error) {
            console.error('Error saving videos locally:', error)
            throw new Error('Local video save failed')
        }
    }

    return videoUrls
}



exports.GlobalDeleteSingleVideo = async (videoUrl) => {
    const isProduction = process.env.NODE_ENV === 'production'
    if (!videoUrl || typeof videoUrl !== 'string') return

    if (isProduction) {
        try {
            const parts = videoUrl.split('/')
            const publicIdIndex = parts.findIndex(part => part === 'upload') + 2
            const publicId = parts.slice(publicIdIndex).join('/').replace(/\.[^/.]+$/, '')

            const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'video' })
            if (result.result === 'ok') {
                console.log(`Deleted from Cloudinary: ${publicId}`)
            } else {
                console.log(`Cloudinary deletion failed: ${JSON.stringify(result)}`)
            }
        } catch (error) {
            console.error(`Cloudinary delete error for ${videoUrl}:`, error)
            throw error
        }
    } else {
        const filePath = videoUrl.replace(`http://localhost:${process.env.PORT}/`, 'public/')
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
            console.log(`Deleted locally: ${filePath}`)
        } else {
            console.log(`File not found: ${filePath}`)
        }
    }
}