const AWS = require('aws-sdk');
AWS.config.update({region:'eu-west-3'});

const util = require('../utils/util')
const bcrypt = require('bcryptjs')
const auth = require('../utils/auth')

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const userTable = 'fullapp-users';

async function login(user){
    const username = user.username;
    const password = user.password;
    
    if(!user || !username || !password){
        return util.buildResponse(401,'Both username and password must be provided.')
    }

    const dynamoUser = await getUser(username.toLowerCase().trim());
    if(!dynamoUser || !dynamoUser.username){
        return util.buildResponse(403,{message:'Username doesn\'t exist.'})
    }
    if(!bcrypt.compareSync(password,dynamoUser.password)){
        return util.buildResponse(403,{message:'Password is incorrect.'})
    }
    
    const userInfo = {
        username: dynamoUser.username,
        name: dynamoUser.name,
    }
    const token = auth.generateToken(userInfo);
    const response = {
        user: userInfo, 
        token: token
    }

    return util.buildResponse(200, response);
}

async function getUser(username){
    const params = {
        TableName: userTable,
        Key: {
            username: username
        }
    }
    return await dynamoDB.get(params).promise().then(
        (response)=>{return response.Item;},
        (error)=>{console.error('error with getting user: ', error);}
        )
}

module.exports.login = login;