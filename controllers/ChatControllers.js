const { Op } = require('sequelize')
const { GlobalImageUploads, ServerError } = require('../utils/utils')

const User = require('../models').users
const Room = require('../models').rooms
const Message = require('../models').messages


exports.CreateRoom = async (req, res) => {
    try {
        const { receiver } = req.body
        if (!receiver) return res.json({ status: 404, msg: 'Room ID is required.' })
        const msgsender = req.user
        let room, stat;
        const getRoom = await Room.findOne({
            where:
            {
                [Op.or]: [
                    { sender: msgsender, receiver: receiver },
                    { sender: receiver, receiver: msgsender },
                ]
            }
        })
        if (!getRoom) {
            room = await Room.create({ sender: msgsender, receiver }),
                stat = 'new'
        } else {
            room = getRoom,
                stat = 'exists'
        }
        return res.json({ status: 200, msg: stat === 'new' ? 'Room created successfully' : 'Room already exists', id: room.id, })
    } catch (error) {
        ServerError(res, error)
    }
}

exports.SendChat = async (req, res) => {
    try {
        const { content, roomid } = req.body
        if (!content || !roomid) return res.json({ status: 404, msg: 'Incomplete message request.' })

        const findroom = await Room.findOne({ where: { id: roomid } })
        if (!findroom) return res.json({ status: 404, msg: "Room doesn't exist" })
        let imageUrl;
        if (req.files?.image) {
            const image = req?.files?.image
            if (image.size > 1000000) return res.json({ status: 400, msg: "File size too large" })
            if (!image.mimetype.startsWith('image/')) return res.json({ status: 400, msg: "Invalid file format" })
            imageUrl = await GlobalImageUploads([image], 'messages', roomid)
        }
        await Message.create({
            roomid,
            content,
            sender: req.user,
            image: imageUrl ? imageUrl[0] : null
        })

        return res.json({ status: 200, msg: 'message delivered successfully' })
    } catch (error) {
        ServerError(res, error)
    }
}

exports.getRoomMessages = async (req, res) => {
    try {
        const { room_id } = req.params
        if (!room_id) return res.json({ status: 400, msg: "Room ID missing" })
        const findRoom = await Room.findOne({
            where: { id: room_id },
            include: [
                {
                    model: Message, as: 'room_messages'
                }
            ]
        })
        if (!findRoom) return res.json({ status: 404, msg: "Room not found" })
      return res.json({status:200, msg:'fetch success',data:findRoom})
    } catch (error) {
        ServerError(res, error)
    }
}