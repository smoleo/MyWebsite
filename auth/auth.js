const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { handleAsyncError } = require('../errors/error-handler');
const AppError = require('../errors/app-error');
const controller = require('../user/user-controller');
const { env } = require('yargs');
require('dotenv').config({ path: __dirname + '/.env' });




router.post('/login',handleAsyncError(async (req,res,_next)=>{
    console.log(req.body);
    let user = await controller.getByCredential(req.body);
    let refreshToken = generateRefreshToken(user);
    user.refreshToken=refreshToken;
    controller.updateRefreshToken(user._id,refreshToken);
    res.status(200);
    res.setHeader('content-type', 'text/plain');
    res.cookie('rToken',refreshToken,{
        httpOnly:true,
        secure:false,
        sameSite:'Strict',
        maxAge:1000*60*60*24
    });
    res.send(refreshToken);
}));

router.get('/accessToken',handleAsyncError(async (req,res,next)=>{
       //check if refresh token is present
        let refreshToken = req.cookies['rToken'];
        console.log(refreshToken);
        if(!refreshToken) res.status(401).send('access denied, no refresh token');
        //verify refresh token and if user with refresh token is in Database
        let exp=0;
        try{
            let payload=verifyRefreshToken(refreshToken);
            exp=payload.exp;
        }catch(err){
            next(new AppError(401,'access denied, refresh token expired'));
        }
        let user=await controller.getFiltered({refreshToken:refreshToken});

        if(!user) next( new AppError(401,'access denied, wrong refresh token'));
        //generate new access token
        let accessToken = generateAccessToken(user);
        
        if(exp!=0){
            res.status(200).send(accessToken);
        }
        

}));


async function authenticate(req,res,next){
    if(res.headersSent){
        next();
        return;
    }

    let accessToken =req.headers['authorization'];
    if(!accessToken) next(new AppError(401,'access denied'));

    let lowerCasedAccessToken=accessToken.toLowerCase();
    if(lowerCasedAccessToken.startsWith('bearer ')){
        accessToken=accessToken.slice(7,accessToken.length);
    }
    try {
        let payload = await verifyAccessToken(accessToken);
        req.user = payload;
        console.log(req.user);
        next();
    }
    catch (err) {
        console.error(err);
        next(new AppError(401,'access denied'));
    }
}





function verifyAccessToken(accessToken) {
    return jwt.verify(accessToken, process.env.jwtSecret.toString());
}
function verifyRefreshToken(refreshToken) {
    return jwt.verify(refreshToken, process.env.jwtSecret.toString());
}
function generateRefreshToken(user) {
    console.log("refreshExp: "+process.env.refreshExp);
    return jwt.sign({userName: user.userName}, process.env.jwtSecret, { expiresIn: Number(process.env.refreshExp) || '15s' });
}
function generateAccessToken(user) {
    console.log("accessExp: "+process.env.accessExp);
    return jwt.sign({userName: user.userName}, process.env.jwtSecret, { expiresIn: Number(process.env.accessExp) || '5s' });
}
       

module.exports={authenticate,authRouter:router};