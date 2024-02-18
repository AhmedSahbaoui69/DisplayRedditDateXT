// Get text color
const textColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-col-txt-snippet');

// Function to wait for page load
function waitForPageLoad(callback) {
    if (document.readyState === 'complete') {
        callback();
    } else {
        window.addEventListener('load', callback);
    }
}

// Function to fecth date data from a Reddit post url
function getDateAndComments(url) {
    if (url.startsWith("https://www.reddit.com/r/")) {
        url = url.replace("https://www.reddit.com/", "https://old.reddit.com/");
    }
    return fetch(url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            return {
                "upvotes": doc.querySelector('.score.unvoted').textContent.trim(),
                "comments": doc.querySelector('a.bylink.comments.may-blank').textContent.trim(),
                "date": doc.querySelector('#siteTable .tagline time').textContent.trim()
            };
        })
        .catch(error => {
            console.log("Error fetching or extracting content for ", url, error);
            return null;
        });
}

// Function to process a single article
async function processArticle(article) {
    try {
        const aElement = article.querySelector('a[href^="https://www.reddit.com/r/"][href*="/comments/"]');
        const url = aElement.href;
        const data = await getDateAndComments(url);
        if (data && !alreadyProcessedArticles.has(article)) {
            const dateElement = document.createElement('p');
            dateElement.textContent = data.upvotes + " upvotes" + " • " + data.comments + " • " + data.date ;
            dateElement.style.color = textColor;
            article.appendChild(dateElement);
            alreadyProcessedArticles.add(article);
        }
    } catch (error) {
        console.log("Error fetching or extracting content: ", error);
    }
}

// Function to process articles
function processArticles() {
    const newArticles = document.querySelectorAll('article');
    newArticles.forEach(article => {
        if (!alreadyProcessedArticles.has(article)) {
            processArticle(article);
        }
    });
}

// List to track already processed articles to avoid duplicates
const alreadyProcessedArticles = new Set();

// Wait for the page to load, then process articles each time the user presses "more-results"
waitForPageLoad(() => {
    let articles = [];
    processArticles()
    const moreResultsButton = document.getElementById('more-results');
    if (moreResultsButton) {
        moreResultsButton.addEventListener('click', processArticles);
    }
});
