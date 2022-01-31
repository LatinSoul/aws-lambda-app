const util = require('../utils/util')
const auth = require('../utils/auth')

function verify(requestBody){
    if(!requestBody || !requestBody.user.username || !requestBody.token){
        return util.buildResponse(401,{
            verified: false,
            message:'invalid request body'
        })
    }
    const user = requestBody.user;
    const token = requestBody.token;
    const verification = await util.verified(user.username, token);
    if(!verification.verified){
        return util.buildResponse(401, verification)
    }
    return util.verified(200,{
        verified: true,
        message: 'Success',
        user: user,
        token: token
    })
}
module.exports.verify=verify;