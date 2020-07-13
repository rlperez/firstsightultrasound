module.exports = {

  apiEndpoint: 'https://firstsightultrasound.prismic.io/api/v2',

  // -- Access token if the Master is not open
  accessToken: 'PRISMIC_ACCESS_TOKEN',
  // OAuth
  clientId: 'PRISMIC_CLIENT_ID',
  clientSecret: 'PRISMIC_CLIENT_SECRET',

  // -- Links resolution rules
  // This function will be used to generate links to Prismic.io documents
  // As your project grows, you should update this function according to your routes
  linkResolver(doc, ctx) {
    if (doc.type === 'page') {
      return `/${doc.type}/${doc.uid}`;
    }

    return '/';
  },
};
