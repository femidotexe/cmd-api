var readline = require('readline');
var req = require('request');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('Welcome to medium\'s api');

rl.question('What is your medium token ', (token) => {
    
    var options = {
      url: 'https://api.medium.com/v1/me',
      headers: {
        'User-Agent': 'request',
        'Authorization': 'Bearer '+token
      }
    };

    req(options, function(error, response, body) {
        body = JSON.parse(body);
        if(body.errors != undefined) {
            console.log('Your token is invalid');
        }else {
            var id = body.data.id;
            console.log('\n\nWelcome '+body.data.name+'('+body.data.username+') to cmd version of medium\n');
            console.log('\nTo create a post enter 1');
            console.log('\nTo  enter 2');
            console.log('');
            rl.question('What is your choice ', (action) => {
                if(action === 1) {
                    rl.question('Enter title: ', (title) => {
                        rl.question('Enter content: ', (content) => {
                            rl.question('To publish enter 1, to save to draft enter 2 ', (status) => {
                                var publishStatus = 'public';
                                if (status == 2){
                                    publishStatus = 'draft';
                                }
                                var options = {
                                  url: 'https://api.medium.com/v1/users/'+id+'/posts',
                                  headers: {
                                    'User-Agent': 'request',
                                    'Authorization': 'Bearer '+token
                                  },
                                  form: {
                                    "title":title,
                                    "content":'<p>'+content+'</p>',
                                    "publishStatus":publishStatus,
                                    'contentFormat':'html',
                                  }
                                };
                                req.post(options, function(err, resp, body) {
                                    body = JSON.parse(body);
                                    if(body.data != undefined) {
                                        console.log('Your post was successfully saved');
                                    }
                                });
                                rl.close();
                            })
                        })
                    })
                }
            })
        }
    });

    
});

