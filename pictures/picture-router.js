const express = require('express');
const AppError = require('../errors/app-error');
const router = express.Router();

const { handleAsyncError } = require('../errors/error-handler');
const controller = require('./picture-controller');

router.get('/', handleAsyncError(async (req, res, _next) => {
    res.status(200).json(await controller.getAll());
}));

module.exports = router;