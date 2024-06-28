const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose')

// @desc GET all Notes
// @route GET /notes
// @access public

const getAllNotes = asyncHandler(async (req,res) => {
    const notes = await Note.find().lean()
    if(!notes?.length) {
        return res.status(400).json({message: "No notes found"})
    }
    // 添加 User
    const notesWithUser = await Promise.all(notes.map(async (note)=> {
        const user = await Note.findById(note.user).lean().exec()
        return {...note,user: user}
    }))

    res.json(notes)
})

// @desc create a new Note
// @route POST /notes
// @access private
const createNote = asyncHandler(async (req,res) => {
    const { user,title,text,completed } = req.body

    // const userId = new mongoose.Types.ObjectId(user)
    // if(!userId || !title || !completed) {
    //     return res.status(400).json({message : "All field ard required.."})
    // }

    if(!user || !title || !completed) {
        return res.status(400).json({message : "All field ard required.."})
    }

    // check for the duplaicate title
    const duplaicate = await Note.findOne({title}).lean().exec()
    if(duplaicate) { res.status(409).json({message: "duplaicate note title"}) }

    // create and store note
    const note = await Note.create({user,title,text,completed})
    if (note) {
        res.status(201).json({message: "note has created"})
    }else {
        res.status(400).json({message: "something was wrong, go check it out"})
    }
})
// @desc GET all Notes
// @route PATCH /notes
// @access private
const editNote = asyncHandler(async (req,res) => {
    const { id,user,title,text,completed } = req.body
    
    // const userId = new mongoose.Types.ObjectId(user)

    if(!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({message: "All fields except password are required,except if completed ,you can choice one of it"})
    }

    const note = await Note.findById(id).exec()
    // const note = await Note.findOne({title: title}).exec()

    if(!note) {
        return res.status(400).json({mesage :"note not found"})
    }

    // 确定改了之后有没有重名的
    const duplicate = await Note.findOne({title}).lean().exec()

    if(duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({message:"duplicate note title"})
    }
    // 可以改进的地方，如果有重名，在后面加一些字符，而不是报错

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updateNote = await note.save()

    res.json(`Note:[${updateNote.title}] updated`)
})
// @desc delete a Notes
// @route DELETE /notes
// @access private
const deleteNote = asyncHandler(async (req,res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({message: "Note id Required"})
    }
    const note = await Note.findById(id).exec()

    if(!note) {
        return res.status(409).json({message: "Note not found"})
    }

    await note.deleteOne()

    const reply = `Note [${note.title}] has deleted`

    res.json(reply)
})

module.exports = {
    getAllNotes,
    createNote,
    editNote,
    deleteNote
}
