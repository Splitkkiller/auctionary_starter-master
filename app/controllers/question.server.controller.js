const Joi = require('joi');
const itemModel = require('../models/item.server.model');

const get_questions = (req, res) => {
    const item_id = req.params.item_id;

    itemModel.getItemById(item_id, (err, item) => {
        if (err) return res.sendStatus(500);
        if (!item) return res.status(404).json({ error_message: 'Item not found' });

        itemModel.getQuestions(item_id, (err, questions) => {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }
            res.status(200).json(questions);
        });
    });
};

const create_question = (req, res) => {
    const item_id = req.params.item_id;
    const user_id = req.user_id;

    const schema = Joi.object({
        question_text: Joi.string().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error_message: error.details[0].message });
    }

    const { question_text } = value;

    itemModel.getItemById(item_id, (err, item) => {
        if (err) return res.sendStatus(500);
        if (!item) return res.status(404).json({ error_message: 'Item not found' });

        if (item.creator_id === user_id) {
            return res.status(403).json({ error_message: 'You cannot ask a question on your own item' });
        }

        itemModel.addQuestion(item_id, user_id, question_text, (err) => {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }
            res.sendStatus(200);
        });
    });
};

const get_question = (req, res) => {
    const question_id = req.params.question_id;

    itemModel.getQuestionById(question_id, (err, question) => {
        if (err) return res.sendStatus(500);
        if (!question) return res.sendStatus(404);

        res.status(200).json(question);
    });
};

const answer_question = (req, res) => {
    const question_id = req.params.question_id;
    const user_id = req.user_id;

    const schema = Joi.object({
        answer_text: Joi.string().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error_message: error.details[0].message });
    }

    const { answer_text } = value;

    itemModel.getQuestionById(question_id, (err, question) => {
        if (err) return res.sendStatus(500);
        if (!question) return res.status(404).json({ error_message: 'Question not found' });

        itemModel.getItemById(question.item_id, (err, item) => {
            if (err) return res.sendStatus(500);
            if (!item) return res.status(404).json({ error_message: 'Item not found' });

            if (item.creator_id !== user_id) {
                return res.status(403).json({ error_message: 'Only the item creator can answer questions' });
            }

            itemModel.addAnswer(question_id, answer_text, (err) => {
                if (err) return res.sendStatus(500);
                res.sendStatus(200);
            });
        });
    });
};

module.exports = {
    get_questions,
    create_question,
    get_question,
    answer_question
};