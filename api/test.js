
const crypto = require('crypto');

const main = (password) => {
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.createHash('sha256').update(password + salt).digest('hex');

console.log('Salt: ', salt, '\nPassword: ', hash);
}

main('simpatia');