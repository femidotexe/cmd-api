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

                console.log('To post game of thrones quotes to medium, Enter 1\nTo post current bing news, enter 2\nTo make a custom post, enter 3');

                rl.question('Enter your choice ', function(choice) {
                    if (choice == 1) {
                        rl.question('Enter number of game of thrones quotes you want ', function(numberOfQuotes) {
                            var content = '';
                            while(numberOfQuotes--) {
                                req('https://got-quotes.herokuapp.com/quotes', function(err, res, body) {
                                    var quoteDetails = JSON.parse(body);
                                    content += '<h3>'+quoteDetails.character+'</h3><br/>'+quoteDetails.quote+'<br/><br/>';
                                    if (numberOfQuotes < 1) {
                                        medium.postToMedium(content, 'Game of Thrones quotes', authorId, token);
                                    }
                                });
                            }
                            rl.close();
                        });
                    } else if (choice == 2){
                        rl.question('What\'s your bing subsription key ', function(key) {
                            medium.getBingNews(key, authorId, token);
                        });
                    }else if (choice == 3) {
                        rl.question('Enter title ', function(title) {
                            rl.question('Enter content ', function(content) {
                                medium.postToMedium(content, title, authorId, token);
                                rl.close();
                            })
                        })
                        
                    }
                })
                
            }
        })
    }
});

class Medium {
    constructor() {

    }
    getBingNews(key, authorId, token) {
        var jsonresponse;
        var instance = this;
        req.get({
           'url':'https://api.cognitive.microsoft.com/bing/v5.0/news/',
            headers:{
                'Ocp-Apim-Subscription-Key':key
            }
        }, function(err, response, body) {
            var news = JSON.parse(body);
            news = news.value;
            var content = ''
            for (var i = 0; i < news.length && i < 10; i++) {
                content += '<img width="'+news[i].image.thumbnail.width+'" height="'+news[i].image.thumbnail.height+'" src="'+news[i].image.thumbnail.contentUrl+'"/><h1>'+news[i].name+'</h1><br/>'+news[i].description+'<br/><a href="'+news[i].url+'">Read More</a><br/>';
            }
            instance.postToMedium(content, 'Current News', authorId, token);
        });
        
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