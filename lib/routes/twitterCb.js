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

var twitterCb = function (req, res, next) {
 if (req.session.oauth) {
    req.session.oauth.verifier = req.query.oauth_verifier;
    var oauth_data = req.session.oauth;
 
    oauth.getOAuthAccessToken(
      oauth_data.token,
      oauth_data.token_secret,
      oauth_data.verifier,
      function (error, oauth_access_token, oauth_access_token_secret, results) {
        if (error) {
          console.log(error);
          res.send("Authentication Failure!");
        } else {
          req.session.oauth.access_token = oauth_access_token;
          req.session.oauth.access_token_secret = oauth_access_token_secret;
          res.redirect('/np'); // You might actually want to redirect!
        }
      }
    );
  } else {
    res.redirect('/login'); // Redirect to login page
  }
};

module.exports = twitterCb;