const express = require('express')
const router = express.Router()
const noteControllers = require('../controllers/noteController')

router.route('/')
    .get(noteControllers.getAllNotes)
    .post(noteControllers.createNote)
    .patch(noteControllers.editNote)
    .delete(noteControllers.deleteNote)

module.exports = router