const AWS = require('aws-sdk');
AWS.config.update({region:'eu-west-3'});

const util = require('../utils/util')
const bcrypt = require('bcryptjs')

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const userTable = 'fullapp-users';

async function register(userInfo){
    const name = userInfo.name;
    const email = userInfo.email;
    const username = userInfo.username;
    const password = userInfo.password;
    if(!name || !email || !username || !password){
        return util.buildResponse(401,'All fields must be provided.')
    }

    const dynamoUser = await getUser(username.toLowerCase().trim());
    if(dynamoUser && dynamoUser.username){
        return util.buildResponse(401,{message:'Username already exist. Please choose another one'})
    }
    const encryptedPW = bcrypt.hashSync(password.trim(),10);
    const user = {
        name: name,
        email: email,
        username: username.toLowerCase().trim(),
        password: encryptedPW
    }
    const savedUserResponse = await saveUser(user);
    if(!savedUserResponse) {
        return util.buildResponse(503,{message: 'Server Error. Please try later.'})
    }
    return util.buildResponse(200,{username: username});
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
async function saveUser(user){
    const params = {
        TableName: userTable,
        Item: user
    }
    return await dynamoDB.put(params).promise().then(
        ()=>{return true;},
        (error)=>{console.error('error with saving user: ', error);}
        )
}
module.exports.register = register;