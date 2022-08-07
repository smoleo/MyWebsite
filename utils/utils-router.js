const AppError = require('../errors/app-error');
const ObjectId = require('mongoose').Types.ObjectId;

function checkId(req, _res, next) {
  if (!ObjectId.isValid(req.params._id))
    next(new AppError(400, `'${req.params._id}' is not a valid objectid`));
  else next();
}

function denyQueryString(req, _res, next) {
  if (Object.keys(req.query).length > 0)
    next(
      new AppError(
        400,
        `get by _id not allowed in combination with a querystring.`,
      ),
    );
  else next();
}

module.exports.checkId = checkId;
module.exports.denyQueryString = denyQueryString;