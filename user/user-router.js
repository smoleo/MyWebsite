const express = require('express');
const router = express.Router();

const { handleAsyncError } = require('../errors/error-handler');
const { checkId, denyQueryString } = require('../utils/utils-router');
const controller = require('./message-controller');

router.post(
    '/',
    handleAsyncError(async (req, res, _next) => {
     // console.log(req.body);
      let newUser = await controller.create(req.body);
      res.status(201).json(newUser);
    }),
  );

router.get(
'/',
handleAsyncError(async (req, res, _next) => {
    let users;
    if (Object.keys(req.query).length > 0)
    users = await controller.getFiltered(req.query);
    else users = await controller.getAll();
    res.status(200).json(users);
}),
);

module.exports = router;