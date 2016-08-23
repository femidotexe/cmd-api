var read = require('readline-sync');
var req = require('request');
require('dotenv').config();

class ApiConsumption {
    constructor() {

    }

    askQuestion(prompt) {
        var reply = read.question(prompt);
        return reply
    }

    displayMediumInfo(mediumData) {
        console.log('\n----------------\n');
        console.log('Hi '+mediumData.data.name+'('+mediumData.data.username+'). Your medium url is: '+mediumData.data.url+'\n\n');
        console.log('To post game of thrones quotes to medium, Enter 1\nTo post current bing news, enter 2\nTo make a custom post, enter 3');
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

console.log('------------------------\n');
console.log('Welocome to medium API consumption\n\n');

var api = new ApiConsumption();
var token = process.env.MEDIUM_KEY;
var mediumData;
while(true) {
    if(token.trim() != ''){
        req({
            'url':'https://api.medium.com/v1/me',
            headers:{
                'Authorization': 'Bearer '+token
            }
        }, function(error, response, body) {
            body = JSON.parse(body);
            if (body.errors != undefined) {
                console.log('Invalid token, Please try again');
                token = api.askQuestion('What is your medium token ');
            } else {
                mediumData = body;
                console.log('\n----------------\n');
                var authorId = mediumData.data.id;
                api.displayMediumInfo(mediumData);
                var choice = api.askQuestion('What is your choice ');
                if (choice == 1) {
                    var numberOfQuotes = api.askQuestion('How many quotes do you want ');
                    var content = '';
                    while(numberOfQuotes--) {
                        req('https://got-quotes.herokuapp.com/quotes', function(err, res, body) {
                            var quoteDetails = JSON.parse(body);
                            content += '<h3>'+quoteDetails.character+'</h3><br/>'+quoteDetails.quote+'<br/><br/>';
                            if (numberOfQuotes < 1) {
                                api.postToMedium(content, 'Game of Thrones quotes', authorId, token);
                            }
                        });
                    }
                } else if (choice == 2){
                    var key = process.env.BING_KEY;
                    console.log(key);
                    if(key == '') {
                        key = api.askQuestion('What\'s your bing subsription key ');
                    }
                    api.getBingNews(key, authorId, token);
                }else if (choice == 3) {
                    var title = api.askQuestion('Enter title ');
                    var content = api.askQuestion('Enter content ');
                    api.postToMedium(content, title, authorId, token);            
                }
            }
        });
        if(mediumData != '') {
            return; 
        }
    }else{
        token = api.askQuestion('What is your medium token ');
    }
}
