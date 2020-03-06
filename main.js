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
            getContent( itemID );
        });
    })
    .catch(function(error) {
        var p = document.createElement('p');
        p.appendChild(
        document.createTextNode('Error: ' + error.message)
        );
        document.body.insertBefore(p, myList);
    });

    function getContent( itemID ) {
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
                console.log( item );
                var listItem = document.createElement('article');
                listItem.innerHTML = '<h2 class="news-item__title"><a href="' + item.url + '" target="_blank">' + item.title + '</a></h2>';
                listItem.innerHTML +='<span class="news-item__user">by ' + json.by + '</span>';
                listItem.innerHTML +='<span class="news-item__time">' + json.time + '</span>';
                listItem.innerHTML +='<span class="news-item__hide">hide</span>';
                listItem.innerHTML +='<span class="news-item__comments">' + json.descendants + ' comments</span>';
                newsList.appendChild(listItem);
            })
    }

    // article structure
    // <article class="news-item">
    //     <h2 class="news-item__title"></h2>
    //     <span class="news-item__source"></span>
    //     <span clas="news-item__points">points</span>
    //     <span class="news-item__user">by user</span>
    //     <span class="news-item__time">time</span>
    //     <span class="news-item__hide">hide</span>
    //     <span class="news-item__comments">comments</span>
    // </article>
