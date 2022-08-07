const AppError =require('../errors/app-error');
const {User,UserValidationSchema}=require('./user-mode');
const { OperationType, checkPayload, hashString } = require('../utils/utils-controller');
const bcrypt = require('bcrypt');


const controller = {
    create: async(payload) => {
        checkPayload(payload, UserValidationSchema, OperationType.Create);
        payload.password = await hashString(payload.password);
        return User.create(payload);
    },
    getAll: async() => User.find(),

    getFiltered: async(filter) => User.find(filter),

    getById: async(_id) => {
        let result = await User.findById(_id);
        if (!result) throw new AppError(404, `User with _id ${_id} not found`);

        return result;
    },

    deleteById: async(_id) => {
        User.deleteOne({ _id });
        return;
    },
    getByCredential: async(credentials) => {
        console.log(credentials);
        let user = await User.findOne({ username: credentials.username });
        if (!await bcrypt.compare(credentials.password, user.password)) {
            throw new AppError(400, "Wrong credentials");
        }
        return user;

    },
    updateRefreshToken: async(_id, token) => {
        await User.findByIdAndUpdate(_id, { refreshToken: token });
        return;
    }
}

module.exports=controller;