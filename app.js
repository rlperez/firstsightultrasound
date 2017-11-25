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

const PORT = app.get('port');


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
      var images = document.data.body.find(s => s.slice_type === 'gallery').value;

      res.render('homepage', {
        pageContent: document,
        data: document.data,
        services: document.data.services,
        galleryImages: images,
        galleryTags: [... new Set(images.map(i => i.linkText))]
      });
      // console.log(document.data);
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
      res.render('gallery', {
        pageContent: document,
        data: document.data,
        galleryImages: document.data.body[0].value
      });
      console.log(`Galler: ${document.data}`);
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

/*
 * Prismic documentation to build your project with prismic

app.get('/help', (req, res) => {
    const repoRegexp = /^(https?:\/\/([-\w]+)\.[a-z]+\.(io|dev))\/api(\/v2)?$/;
    const [_, repoURL, name, extension, apiVersion] = PrismicConfig.apiEndpoint.match(repoRegexp);
    const host = req.headers.host;
    const isConfigured = name !== 'your-repo-name';
    res.render('help', { isConfigured, repoURL, name, host });
});
 */

/*
 * Preconfigured prismic preview

app.get('/preview', (req, res) => {
    const token = req.query.token;
    if (token) {
        req.prismic.api.previewSession(token, PrismicConfig.linkResolver, '/')
            .then((url) => {
                const cookies = new Cookies(req, res);
                cookies.set(Prismic.previewCookie, token, { maxAge: 30 * 60 * 1000, path: '/', httpOnly: false });
                res.redirect(302, url);
            }).catch((err) => {
                res.status(500).send(`Error 500 in preview: ${err.message}`);
            });
    } else {
        res.send(400, 'Missing token from querystring');
    }
});
 */
