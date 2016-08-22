var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('What is your name ', (name) => {
    console.log('So your name is ', name);

    rl.close();
});