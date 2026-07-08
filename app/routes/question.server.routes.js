const express = require('express');
const router = express.Router();
const questions = require('../controllers/question.server.controller');
const authenticate = require('../authentication');

// Get all questions for an item
router.get('/item/:item_id/question', questions.get_questions);

// Create a question (Requires Auth)
// Ensure this matches "create_question" in your controller!
router.post('/item/:item_id/question', authenticate, questions.create_question);

// Get a single question
router.get('/question/:question_id', questions.get_question);

// Answer a question (Requires Auth)
router.post('/question/:question_id/answer', authenticate, questions.answer_question);

module.exports = router;