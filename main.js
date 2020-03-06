var newsList = document.getElementById('list');

var limit = 30;
var offset = 0;

// fetch data from hackernews api
fetch('https://hacker-news.firebaseio.com/v0/newstories.json')
    .then(function(response) {
        if (!response.ok) {
            throw new Error("HTTP error, status = " + response.status);
        }

        return response.json();
    })
    .then(function(json) {
        // console.log(json);
        var pageids = json.slice(offset, limit)
        pageids.forEach( function( itemID ) {
            getItem( itemID );
        });
    })
    .catch(function(error) {
        var p = document.createElement('p');
        p.appendChild(
            document.createTextNode('Error: ' + error.message)
        );
        document.body.insertBefore(p, newsList);
    });

    function getItem( itemID ) {
        var itemUrl = 'https://hacker-news.firebaseio.com/v0/item/';
        
        fetch(itemUrl + itemID + '.json')
            .then(function(response) {
                if (!response.ok) {
                    throw new Error("HTTP error, status = " + response.status);
                }

                return response.json();
            })
            .then(function(json) {
                var item = json;
                if (typeof item !== null) {
                    console.log( item );
                    var listItem = document.createElement('article');
                    var score = (json.score == 1) ? ' point' : ' points';
                    var comments = (json.descendants == 1) ? ' comment' : ' comments';

                    listItem.innerHTML = '<h2 class="ae ae--title"><a href="' + item.url + '" target="_blank">' + item.title + '</a>' + showDomain(json.url) + '</h2>';
                    listItem.innerHTML +='<span class="ae ae--points">' + json.score + score + '</span>';
                    listItem.innerHTML +='<span class="ae ae--user">by <a href="https://news.ycombinator.com/user?id=' + json.by + '" target="_blank">' + json.by + '</a></span>';
                    listItem.innerHTML +='<span class="ae ae--time"><a href="https://news.ycombinator.com/item?id=' + json.id + '" target="_blank">' + moment(json.time * 1000).fromNow() + '</a></span>';
                    listItem.innerHTML +='<span class="ae ae--hide"><a href="https://news.ycombinator.com/hide?id=' + json.id + '&goto=news">hide</a></span>';
                    listItem.innerHTML +='<span class="ae ae--comments">' + json.descendants + comments + '</span>';
                    newsList.appendChild(listItem);
                }
            })
    }

    function showDomain(uri){
        var r = /:\/\/(.[^/]+)/;
        var domain = '';

        if (typeof uri !== 'undefined' && uri.length > 0) {
            domain = uri.match(r)[1];
            
            return '<span class="ae ae--domain">(<a href="https://news.ycombinator.com/from?site=' + domain + '">' + domain + '</a>)</span>';
        } 

        return '';
    }