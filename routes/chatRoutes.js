const { userMiddleware } = require('../auth/userAuth')
const { CreateRoom, SendChat, getRoomMessages } = require('../controllers/ChatControllers')

const router = require('express').Router()

/** 
 * @swagger
 * /api/v1/chat/create_room:
 *   post:
 *     summary: Create a chat room between two users (authenticated)
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiver:
 *                 type: string
 *                 description: The ID of the user to create a room with
 *             required:
 *               - receiver
 *     responses:
 *       200:
 *         description: Room created successfully or already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 msg:
 *                   type: string
 *                 id:
 *                   type: integer
 *       404:
 *         description: Room ID is required
 *       500:
 *         description: Internal server error
 */
router.post('/create_room', userMiddleware, CreateRoom)

/** 
 * 
 * @swagger
 * /api/v1/chat/send_message:
 *   post:
 *     summary: Send a chat message in a room (authenticated)
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The message content
 *               roomid:
 *                 type: string
 *                 description: The ID of the chat room
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional image to send with the message
 *             required:
 *               - content
 *               - roomid
 *     responses:
 *       200:
 *         description: Message delivered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 msg:
 *                   type: string
 *       404:
 *         description: Incomplete message request or room doesn't exist
 *       400:
 *         description: Invalid file format or file size too large
 *       500:
 *         description: Internal server error
 */
router.post('/send_message', userMiddleware, SendChat)


/** 
 * @swagger
 * /api/v1/chat/get_room_messages/{room_id}:
 *   get:
 *     summary: Fetch all messages in a specific chat room (authenticated)
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: room_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat room to fetch messages from
 *     responses:
 *       200:
 *         description: Messages fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 msg:
 *                   type: string
 *                 data:
 *                   type: object
 *                   description: The chat room and its messages
 *       400:
 *         description: Room ID missing
 *       404:
 *         description: Room not found
 *       500:
 *         description: Internal server error
 */
router.get('/get_room_messages/:room_id', userMiddleware,getRoomMessages)


module.exports = router