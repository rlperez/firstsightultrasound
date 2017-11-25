const Prismic = require('prismic-javascript');
const prismic = require('prismic-nodejs');
const PrismicDOM = require('prismic-dom');
const request = require('request');
const Cookies = require('cookies');
const PrismicConfig = require('./prismic-configuration');
const Onboarding = require('./onboarding');
const app = require('./config');
const sendmail = require('sendmail')({ silent: true });
const bodyParser = require('body-parser');
const https = require('https');
const URI = require("uri-js");
const Twitter = require('twitter');

const PORT = app.get('port');
const FB_APP_SECRET = process.env.FB_APP_SECRET;
const FB_APP_ID = process.env.FB_APP_ID;
const TWIT_CONSUMER_KEY = process.env.TWIT_CONSUMER_KEY;
const TWIT_CONSUMER_SECRET = process.env.TWIT_CONSUMER_SECRET;
const TWIT_ACCESS_TOKEN = process.env.TWIT_ACCESS_TOKEN;
const TWIT_ACCESS_TOKEN_SECRET = process.env.TWIT_ACCESS_TOKEN_SECRET;

const FB_AT_OPTIONS = {
  host: 'graph.facebook.com',
  port: 443,
  path: `/oauth/access_token?type=client_cred&client_id=${FB_APP_ID}&client_secret=${FB_APP_SECRET}`,
  method: 'GET'
};

const FB_POST_OPTIONS = {
  host: 'graph.facebook.com',
  port: 443,
  path: `/v2.11/loveatfirstsightultrasound/posts?limit=5&access_token=`,
  method: 'GET'
}

const TWITTER_OPTIONS = {
  consumer_key: TWIT_CONSUMER_KEY,
  consumer_secret: TWIT_CONSUMER_SECRET,
  access_token_key: TWIT_ACCESS_TOKEN,
  access_token_secret: TWIT_ACCESS_TOKEN_SECRET
}

app.listen(PORT, () => {
  Onboarding.trigger();
  process.stdout.write(`Point your browser to: http://localhost:${PORT}\n`);
});

app.use(bodyParser.json());

// Middleware to inject prismic context
/*
 * Initialize prismic context and api
 */
app.use((req, res, next) => {
  Prismic.api(PrismicConfig.apiEndpoint, { accessToken: PrismicConfig.accessToken, req })
    .then((api) => {
      req.prismic = { api };
      res.locals.ctx = {
        endpoint: PrismicConfig.apiEndpoint,
        linkResolver: PrismicConfig.linkResolver,
      };
      // add PrismicDOM in locals to access them in templates.
      res.locals.PrismicDOM = PrismicDOM;
      next();
    }).catch((err) => {
      const message = err.status === 404 ? 'There was a problem connecting to your API, please check your configuration file for errors.' : `Error 500: ${err.message}`;
      res.status(err.status).send(message);
    });
});

/*
 * Route with documentation to build your project with prismic
 */
app.route('/').get((req, res) => {
  req.prismic.api.getByUID('homepage', 'homepage')
    .then((document) => {
      var images = getGalleryImages(document.data.body);
      var tags = getGalleryTags(images);
      getSocialMediaPosts().then(posts => {
        console.log(posts);
        res.render('homepage', {
          pageContent: document,
          data: document.data,
          services: document.data.services,
          galleryImages: images,
          galleryTags: tags,
          socialMedia: posts
        });
      }, reason => {
        // If for some reason the social media fails.
        console.log(reason);
        res.render('homepage', {
          pageContent: document,
          data: document.data,
          services: document.data.services,
          galleryImages: images,
          galleryTags: tags,
          socialMedia: []
        });
      });
    })
    .catch((err) => {
      res.status(500).send(`Error 500: ${err.message}`);
      console.log(err.message);
    });
});

app.route('/faq').get((req, res) => {
  req.prismic.api.getByUID('page', 'faq')
    .then((document) => {
      res.render('faq', {
        pageContent: document,
        data: document.data,
        faqs: titleAndText(document.data)
      });
      console.log(`FAQ: ${document.data}`);
    })
    .catch((err) => {
      res.status(500).send(`Error 500: ${err.message}`);
      console.log(err.message);
    });
});

app.route('/gallery').get((req, res) => {
  req.prismic.api.getByUID('page', 'gallery')
    .then((document) => {
      var images = getGalleryImages(document.data.body);
      var tags = getGalleryTags(images);
      res.render('gallery', {
        pageContent: document,
        data: document.data,
        galleryImages: images,
        galleryTags: tags
      });
      console.log(`Gallery: ${document.data}`);
    })
    .catch((err) => {
      res.status(500).send(`Error 500: ${err.message}`);
      console.log(err.message);
    });
});

app.route('/contact').post((req, res) => {
  console.log(`Sending mail message: ${JSON.stringify(req.body)}`);
  var message = req.body.message.split('\n').map(s => `<p>${s}</p>`).join('<br />');
  console.log(message);
  sendmail({
    from: 'no-reply@firstsightultrasound.com',
    to: 'daftblight@gmail.com',
    subject: 'Contact Form Message',
    html: `<html>
              <header><title></title></header>
              <body>
                <p><b>Name:</b> ${req.body.name}</p>
                <p><b>Email:</b> ${req.body.email}</p>
                <p><b>Phone:</b> ${req.body.phone}</p>
                <p><b>Message:</b><br /> ${message}</p>
              </body>
           </html>`,
  }, function (err, reply) {
    res.status(500).send(`Error 500: ${err.message}`);
    console.log(err && err.stack);
    console.dir(reply);
    console.log(`Failed to send mail message ${JSON.stringify(req.body)}`);
  });
});

function titleAndText(data) {
  return data.body.map(function (slice) {
    switch (slice.slice_type) {
      case 'title_and_text':
        return slice;
    }
  });
}

function getGalleryTags(images) {
  return [... new Set(images.map(i => i.linkText).filter(t => t !== null))];
}

function getGalleryImages(body) {
  return body.find(s => s.slice_type === 'gallery').value;
}

function getSocialMediaPosts() {
  var posts = [getFacebookPosts(), getTweets()]
  return Promise.all(posts).then(values => {
    return []
      .concat
      .apply([], values)
      .sort((a, b) => {
        return getSocialMediaDateTime(b) - getSocialMediaDateTime(a);
      });
  }, reason => {
    console.log(reason)
  });
}

function getSocialMediaDateTime(post) {
  if (post.social_media_source === 'facebook') {
    return post.created_time;
  } else if (post.social_media_source === 'twitter') {
    return post.created_at;
  } else {
    return 0;
  }
}

function getFacebookPosts() {
  return new Promise(function (resolve, reject) {
    // Get FB auth token
    request({
      url: URI.serialize(URI.parse(`https:\/\/graph.facebook.com/oauth/access_token?type=client_cred&client_id=${FB_APP_ID}&client_secret=${FB_APP_SECRET}`))
    }, function (error, response, body) {
      // Get FB posts
      if (error) {
        console.log(error);
        return reject(error);
      }
      var fields = 'id,caption,created_time,description,icon,link,message,name,permalink_url,picture,source,status_type,type'
      var limit = 10
      request({
        url: URI.serialize(URI.parse(`https:\/\/graph.facebook.com/v2.11/loveatfirstsightultrasound/posts?fields=${fields}&limit=${limit}&access_token=${JSON.parse(body).access_token}`))
      }, function (error, response, body) {
        if (error) {
          console.log(error);
          return reject(error);
        }
        var posts = JSON.parse(body);
        posts = posts.data
          .filter(p => p.status_type !== 'mobile_status_update')
          .map(p => {
            p['social_media_source'] = 'facebook';
            p['created_time'] = Date.parse(p.created_time);
            return p;
          });
        console.log(posts);
        resolve(posts);
      });
    });
  });
}

function getTweets() {
  return new Promise(function (resolve, reject) {
    var client = new Twitter(TWITTER_OPTIONS);
    client.get('search/tweets', { q: 'luvat1stsight4d', count: 10 }, function (error, tweets, response) {
      if (error) {
        console.log(error);
        return reject(error);
      }

      tweets = tweets.statuses.map(t => {
        t['social_media_source'] = 'twitter';
        t['created_at'] = Date.parse(t.created_at);
        return t;
      });
      resolve(tweets);
    });
  });
}
