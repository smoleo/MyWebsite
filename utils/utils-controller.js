const AppError = require('../errors/app-error');
const bcrypt = require('bcrypt');

function select(collection, _id) {
  let obj = collection.find((x) => x._id == _id);
  if (!obj) throw new AppError(404, `resource with _id '${_id}' not found.`);

  return obj;
}

function getFiltered(collection, filter) {
  const filteredObjects = collection.filter((obj) => {
    for (const key in filter) {
      if (obj[key] != filter[key]) return false;
    }
    return true;
  });
  return filteredObjects;
}
async function hashString(data) {
  let salt = await bcrypt.genSalt(10);
  let hashedData = await bcrypt.hash(data, salt);
  return hashedData;
}

const OperationType = {
  Create: 1,
  Update: 2,
};

function checkPayload(payload, schema, operationMode) {
  // Annahme: nur objects als payload erlaubt
  if (typeof payload !== 'object')
    throw new AppError(400, 'payload is not an object.');

  // no empty objects allowed
  let keys = Object.keys(payload);
  if (keys.length < 1)
    throw new AppError(400, 'payload is an empty object. Not allowed.');

  // map model to array
  let allProps = [];
  let requiredProps = [];

  for (let prop in schema) {
    let o = schema[prop];
    o.name = prop;
    allProps.push(o);

    if (o.required) requiredProps.push(o);
  }

  let numberOfRequiredProps = requiredProps.length;
  let numberOfMaxProps = allProps.length;

  if (
    keys.length < numberOfRequiredProps &&
    operationMode === OperationType.Create
  )
    throw new AppError(400, 'required properties missing.');

  if (keys.length > numberOfMaxProps)
    throw new AppError(400, 'too much properties in payload.');

  for (let payloadProp in payload) {
    if (!allProps.find((p) => p.name === payloadProp))
      throw new AppError(
        400,
        `property '${payloadProp}' is not allowed in payload`,
      );

    let payloadValue = payload[payloadProp];
    let schemaProp = allProps.filter((p) => p.name === payloadProp)[0];

    if (schemaProp.type !== typeof payloadValue)
      throw new AppError(
        400,
        `typeof property '${payloadProp}' is not valid. expected ${
          schemaProp.type
        } but got ${typeof payloadValue}`,
      );
  }

  for (let idx in requiredProps) {
    let requiredProp = requiredProps[idx];
    if (operationMode === OperationType.Create && !payload[requiredProp.name]) {
      // check existence of required properties
      throw new AppError(400, `property "${requiredProp.name}" is missing.`);
    }

    if (payload[requiredProp.name] == '') {
      // check existence of required properties
      throw new AppError(
        400,
        `can not set required property "${requiredProp.name}" to ''`,
      );
    }
  }

  // do schema-based validation
  for (let prop in schema) {
    let validator = schema[prop]?.validation?.validator;
    let value = payload[prop];

    if (typeof validator === 'function' && value) {
      if (!validator(value))
        throw new AppError(
          400,
          prop.validation?.msg ||
            `payload property validation failed for "${prop}"`,
        );
    }
  }
}

module.exports.checkPayload = checkPayload;
module.exports.OperationType = OperationType;
module.exports.select = select;
module.exports.getFiltered = getFiltered;
module.exports.hashString=hashString;
