const Prismic = require('prismic-javascript');
const prismic = require('prismic-nodejs');
const PrismicDOM = require('prismic-dom');
const request = require('request');
const Cookies = require('cookies');
const PrismicConfig = require('./prismic-configuration');
const Onboarding = require('./onboarding');
const app = require('./config');

const PORT = app.get('port');


app.listen(PORT, () => {
    Onboarding.trigger();
    process.stdout.write(`Point your browser to: http://localhost:${PORT}\n`);
});

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
            res.render('homepage', {
                pageContent: document,
                data: document.data,
                services: document.data.services
            });
            // console.log(document.data);
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
            // console.log(document.data);
        })
        .catch((err) => {
            res.status(500).send(`Error 500: ${err.message}`);
            console.log(err.message);
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
 */
app.get('/help', (req, res) => {
    const repoRegexp = /^(https?:\/\/([-\w]+)\.[a-z]+\.(io|dev))\/api(\/v2)?$/;
    const [_, repoURL, name, extension, apiVersion] = PrismicConfig.apiEndpoint.match(repoRegexp);
    const host = req.headers.host;
    const isConfigured = name !== 'your-repo-name';
    res.render('help', { isConfigured, repoURL, name, host });
});

/*
 * Preconfigured prismic preview
 */
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
