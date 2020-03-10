var newsList = document.getElementById('list');
var home = document.getElementById('home');

var limit = 30;
var offset = 0;

window.addEventListener('DOMContentLoaded', (event) => {
    loadList(offset, limit);

    home.addEventListener("click", function(e) { 
        loadList(offset, limit);
    }, false);

    // add eventlistener to comments
    newsList.addEventListener("click", function(e) {
        if (e.target.classList.contains('ae--comments')) {
            getItem( e.target.dataset.itemid, 'comment' );
        }
    }, false);
});

function loadList(offset, limit) {
    // reset list container
    newsList.innerHTML = '';
    var itemcount = 1 + offset;

    // fetch data from hackernews api
    fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
        .then(function(response) {
            if (!response.ok) {
                throw new Error("HTTP error, status = " + response.status);
            }

            return response.json();
        })
        .then(function(json) {
            // console.log(json);
            var itemIDs =  json || [];

            // cut the array from offset (0) to limit (30)
            var pageItemIDs = itemIDs.slice(offset, limit);

            if (pageItemIDs.length) {
                // looping over the resonse json array of itemids
                pageItemIDs.forEach( function( itemID ) {
                    // get the item content
                    getItem( itemID, 'list' ,itemcount );
                    itemcount++;
                });
            }
        })
        .catch(function(error) {
            var p = document.createElement('p');
            p.appendChild(
                document.createTextNode('Error: ' + error.message)
            );
            document.body.insertBefore(p, newsList);
        });
}

function getItem( itemID, type, counter ) {
    var itemUrl = 'https://hacker-news.firebaseio.com/v0/item/';
    var itemtype = type || 'list';

    fetch(itemUrl + itemID + '.json')
        .then(function(response) {
            if (!response.ok) {
                throw new Error("HTTP error, status = " + response.status);
            }

            return response.json();
        })
        .then(function(json) {
            var item = json;

            if (typeof item !== null && (itemtype == 'list' || itemtype == 'comment')) {
                // show item
                showItem( item, itemtype, counter );
            }
            if (typeof item !== null && itemtype === 'kids') {
                // show comment
                showKid( item, itemtype );
            }
        })
    }

    // shows urls domain only
    function showDomain(uri) {
        var r = /:\/\/(.[^/]+)/; // match ://, cature group to extract substring (.[^/]+), gets all caracters till /
        var domain = '';

        if (typeof uri !== 'undefined' && uri.length > 0) {
            domain = uri.match(r)[1];
            
            return '<span class="ae ae--domain">(<a href="https://news.ycombinator.com/from?site=' + domain + '">' + domain + '</a>)</span>';
        } 

        return '';
    }

    function showItem(item, type, counter) {
        var item = item || {};
        var listItem = document.createElement('article');
        
        listItem.className = 'article';
        if (type === 'comment') {
            listItem.className = 'article ae--comment';
        }
        // create listcount & upvote
        var listleft = document.createElement('div');
        listleft.className = 'ae__count';
        if (type === 'list') {
            listleft.innerHTML +='<span class="counter">' + counter + '.</span>';
        }
        listleft.innerHTML +='<span class="upvote"><a href="https://news.ycombinator.com/vote?id=' + item.id + '&how=up&goto=news">&#9650;</a></span>';
        listItem.appendChild(listleft);
        
        // create item content
        var score = (item.score == 1) ? ' point' : ' points';
        var comments = (item.descendants == 1) ? ' comment' : ' comments';
        var listright = document.createElement('div');
        listright.className = 'ae__content';
        listright.innerHTML = '<h2 class="ae ae--title"><a href="' + item.url + '" target="_blank">' + item.title + '</a>' + showDomain(item.url) + '</h2>';
        listright.innerHTML +='<span class="ae ae--points">' + item.score + score + '</span>';
        listright.innerHTML +='<span class="ae ae--user">by <a href="https://news.ycombinator.com/user?id=' + item.by + '" target="_blank">' + item.by + '</a></span>';
        listright.innerHTML +='<span class="ae ae--time"><a href="https://news.ycombinator.com/item?id=' + item.id + '" target="_blank">' + moment(item.time * 1000).fromNow() + '</a></span>';
        listright.innerHTML +='<span class="ae ae--hide"><a href="https://news.ycombinator.com/hide?id=' + item.id + '&goto=news">hide</a></span>';
        
        if (type === 'comment') {
            listright.innerHTML +='<span class="ae ae--past"><a href="https://news.ycombinator.com/user?id=' + item.id + '" target="_blank">past</a></span>';
            listright.innerHTML +='<span class="ae ae--web"><a href="https://news.ycombinator.com/item?id=' + item.id + '" target="_blank">web</a></span>';
            listright.innerHTML +='<span class="ae ae--favorite"><a href="https://news.ycombinator.com/hide?id=' + item.id + '">favorite</a></span>';
        }
        
        listright.innerHTML +='<span class="ae ae--comments" data-itemid="' + item.id + '">' + item.descendants + comments + '</span>';
        listItem.appendChild(listright);
        
        if (type === 'comment') {
            newsList.innerHTML = '';
        }

        // add item to container
        newsList.appendChild(listItem);

        if (type === 'comment') {
            var commentform = document.createElement('div');

            commentform.className = 'comment';
            commentform.innerHTML +='<form method="post" action="comment"><textarea name="text" rows="6" cols="60"></textarea><br><br><input type="submit" value="add comment"></form>';
            
            // add commnetform to container
            newsList.appendChild(commentform);

            if (item.kids.length > 0) {
                getKids( item.kids );
            }
        }
    }

    function getKids(ids) {
        var kidsIds = ids;
        kidsIds.forEach( function( itemID ) {
            getItem( itemID, 'kids' );
        });
    }

    function showKid(item) {
        //  console.log(item);
        if (typeof item !== 'undefined' && typeof item.deleted == 'undefined') {
            var item = item || {};
            var kidItem = document.createElement('div');
            
            if (typeof item.kids !== 'undefined' && item.kids.length > 0) {
                kidItem.className = 'comment haskids';
            } else {
                kidItem.className = 'comment';
            }
            // create listcount & upvote
            var kidleft = document.createElement('div');
            kidleft.className = 'kid__count';
            kidleft.innerHTML +='<span class="upvote"><a href="https://news.ycombinator.com/vote?id=' + item.id + '&how=up&goto=news">&#9650;</a></span>';
            kidItem.appendChild(kidleft);
            
            // create kid content
            var kidright = document.createElement('div');
            kidright.className = 'kid__content';
            kidright.innerHTML +='<span class="kid kid--user"><a href="https://news.ycombinator.com/user?id=' + item.by + '" target="_blank">' + item.by + '</a></span>';
            kidright.innerHTML +='<span class=kid kid--time"><a href="https://news.ycombinator.com/item?id=' + item.id + '" target="_blank">' + moment(item.time * 1000).fromNow() + '</a> [-]</span><br>';
            kidright.innerHTML += '<div class="kid kid--text">' + item.text + '</div>';

            kidItem.appendChild(kidright);

            // add item to container
            newsList.appendChild(kidItem);

            if (typeof item.kids !== 'undefined' && item.kids.length > 0) {
                getKids( item.kids, );
            }
        }
    }