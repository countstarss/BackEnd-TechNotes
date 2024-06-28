const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// @desc GET all Users
// @route GET /users
// @access private
const getAllUsers = asyncHandler(async (req,res) => {
    // ? ? ?
    const users = await User.find().select('-password').lean()
    if (!users?.length) {
        return res.status(400).json({message:'No User Found'})
    }
    res.json(users)
})




// @desc Create new User
// @route POST /users
// @access private
const createUser = asyncHandler(async (req,res) => {
    const { username,password,roles } = req.body

    if(!username || !password || !Array.isArray(roles) || !roles.length){
        return res.status(400).json({ message: 'All fields are required' })
    }
    // Check for duplicate(重复)
    const duplicate = await User.findOne({ username }).lean().exec()

    if(duplicate){
        return res.status(409).json({message:"User has exist"})
    }

    // hash password
    const HashedPassword = await bcrypt.hash(password,10)

    const userObject = {username, password:HashedPassword, roles}

    const user = User.create(userObject)

    if (user) {
        res.status(201).json({message: "User has created"})
    } else {
        res.status(400).json({message: "Invaild user data received"})
    }
})
// @desc Update User
// @route PATCH /users
// @access private
const updateUser = asyncHandler(async (req,res) => {
    const { id,username,password,roles,active } = req.body

    // confirm data
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean'){
        return res.status(400).json({message : "All fields except password are required..... "})
    }
    
    // ? ? ?  复习typeof 和instanceOf 

    
    const user = await User.findById(id).exec()
    // .exec()取到一个Promise变量，赋值给user
    // .find(), .findOne(), .updateOne() 等）时，这些方法通常返回查询构造器,想要一个Promise对象，加上exec()

    if(!user) {
        return res.status(400).json({mesage :"user not found"})
    }
    // ? ? ? 复习 lean() 和 exec()
    const duplicate = await User.findOne({ username }).lean().exec()

    if (duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message:"duplicate username"})
    }

    user.username = username
    user.roles = roles
    user.active = active

    // password
    if (password) {
        user.password = await bcrypt.hash(password,10)
    }

    const updatedUser = await user.save() // 更新

    res.json({message : `${updatedUser.username} updated` })
})
// @desc delete user
// @route DELETE /users
// @access private
const deleteUser = asyncHandler(async (req,res) => {
    const { id } = req.body

    if(!id) {
        return res.status(400).json({message:'User ID Required'})
    }
    // 返回js的Promise对象
    const note = await Note.findOne({user :id}).lean().exec()
    if (note) {
        return res.status(409).json({message: 'user has assigned notes'})
    }

    const user = await User.findById(id).exec()

    if(!user) {
        return res.status(409).json({message: "User Not Found"})
    }
    // 如果使用了return，函数会终止执行
    await user.deleteOne()

    const reply = `Username ${user.username} with ID ${user._id} deleted`

    // 这样直接返回的数据可以在前端使用
    res.json(reply)
})

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
}