var readline = require('readline');
var req = require('request');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});



rl.question('Please enter your medium token ', function(token) {
    if (token.trim() === '') {
        console.log('Please enter a valid token');
        rl.close();
    } else {
        req({
            'url':'https://api.medium.com/v1/me',
            headers:{
                'Authorization': 'Bearer '+token
            }
        }, function(error, response, body) {
            body = JSON.parse(body);
            if (body.errors != undefined) {
                console.log('Invalid token, Please try again');
                rl.close();
            } else {
                var medium = new Medium();
                console.log('\n--------------------\n');
                console.log('Welcome to medium via command line');
                console.log('\n----------------\n');
                console.log('Hi '+body.data.name+'('+body.data.username+'). Your medium url is: '+body.data.url+'\n\n');
                var authorId = body.data.id;

                console.log('To post game of thrones quotes to medium, Enter 1\nTo view publications, enter 2\nTo make a custom post, enter 3');

                rl.question('Enter your choice ', function(choice) {
                    if (choice == 1) {
                        rl.question('Enter number of game of thrones quotes you want ', function(numberOfQuotes) {
                            while(numberOfQuotes--) {
                                req('https://got-quotes.herokuapp.com/quotes', function(err, res, body) {
                                    var quoteDetails = JSON.parse(body);
                                    medium.postToMedium(quoteDetails.quote, quoteDetails.character, authorId, token);
                                });
                            }
                        });
                    }
                })
                
            }
        })
    }
});

class Medium {
    constructor() {

    }

    postToMedium(content, title, authorId, token) {
        var options = {
            'url':'https://api.medium.com/v1/users/'+authorId+'/posts',
            headers:{
                'Authorization':'Bearer '+token
            },
            form: {
                "title":title,
                "contentFormat":'html',
                "content":'<p>'+content+'</p>',
                "publishStatus":'draft'
            }
        }

        req.post(options, function(err, resp, body) {
            var body = JSON.parse(body);
            if (body.data != undefined) {
                console.log('Post successfully saved to drafts');
            }
        })
    }
}