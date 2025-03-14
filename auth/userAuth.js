const jwt = require('jsonwebtoken')
const User = require('../models').users

exports.userMiddleware = async (req, res, next) => {
    try {
        const tokenHeader = req.headers.authorization
        if (!tokenHeader) return res.json({ status: 400, msg: 'forbidden' })
        const token = tokenHeader.split(' ')[1]  // Bearer xxxxxx
        const verified = jwt.verify(token, process.env.JWT_SECRET)
        if (!verified) return res.json({ status: 400, msg: 'Invalid token' })
        const findUser = await User.findOne({ where: { id: verified.id } })
        if (!findUser) return res.json({ status: 400, msg: 'Access denied' })
        req.user = findUser.id
        next()
    } catch (error) {
        return res.json({ status: 500, msg: error.message })
    }
}