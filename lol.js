const bcrypt = require('bcrypt')

var salt = bcrypt.genSaltSync(10)
console.log("salt: ", salt);

var salt1 = bcrypt.genSaltSync(10)
console.log("salt1: ", salt1);

var hash2 = bcrypt.hashSync('bacon', salt)
var hash = bcrypt.hashSync('bacon', salt1)
console.log("Hash2", hash2);
console.log("Hash", hash);