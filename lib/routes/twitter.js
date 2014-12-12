var OAuth = require('oauth').OAuth;

var oauth = new OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  process.env.T_CONSKEY,
  process.env.T_SECRET,
  '1.0',
  process.env.T_CBURL + '/auth/twitter/callback',
  'HMAC-SHA1'
);

var twitter = function (req, res, next) {
  oauth.getOAuthRequestToken(function (error, oauth_token, oauth_token_secret, results) {
    if (error) {
      console.log(error);
      res.send("Authentication Failed!");
    } else {
      req.session.oauth = {
        token: oauth_token,
        token_secret: oauth_token_secret
      };
      
      console.log(req.session.oauth);

      res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token)
    }
  });
}

module.exports = twitter;