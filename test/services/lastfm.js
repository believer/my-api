var chai       = require('chai');
var expect     = chai.expect;
var sinon      = require('sinon');
var proxyquire = require('proxyquire');
var Q          = require('q');

chai.use(require('sinon-chai'));

describe("/lastfmService", function() {
  var lastfmService,
    routes,
    promise,
    req,
    request,
    url;

  var key;

  var key;

  beforeEach(function () {
    req = {
      body: {
        'text': 'np:hpbeliever'
      }
    };

    routes = {
      get: sinon.stub()
    };

    key = process.env.LASTFM_KEY;

    process.env.LASTFM_KEY = 'kee';

    url = 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user={user}&api_key=kee&format=json&limit=1';

    request = sinon.stub();

    lastfmService = proxyquire(process.cwd() + '/lib/services/lastfm', {
      'request': request
    });
  });

  afterEach(function () {
    process.env.LASTFM_KEY = key;
  });

  describe("#prepareUrl", function() {
    it("should be a function", function() {
      expect(lastfmService.prepareUrl).to.be.a('function');
    });

    it("should return a nice, prepared URL", function() {
      expect(lastfmService.prepareUrl(req.body)).to.eql(url.replace('{user}', 'hpbeliever'));
    });
  });

  describe("#prepareResponse", function() {
    it("should be a function", function() {
      expect(lastfmService.prepareResponse).to.be.a('function');
    });

    it("should return a prepared response", function() {
      var body = '{"recenttracks": {"track": [{"artist": {"#text": "30 Seconds to Mars"},"name": "The Kill"}],"@attr": {"user": "believer"}}}';

      expect(lastfmService.prepareResponse(body)).to.eql({
        text: '30 Seconds to Mars - The Kill (_believer_)'
      });
    });

    it("should return a message from lastfm if their api throws an error", function() {
      var body = '{"error":"true", "message": "nope"}';

      expect(lastfmService.prepareResponse(body)).to.eql({
        text: 'nope'
      });
    });

    it("should send nothing playing by user if no tracks are returned", function() {
      var body = '{"recenttracks": { "user": "believer" }}';

      expect(lastfmService.prepareResponse(body)).to.eql({
        text: 'Nothing playing (_believer_)'
      });      
    });
  });

  describe('#service', function () {
    it('should be a function', function () {
      expect(lastfmService.get).to.be.a('function');
    });

    it("should return empty if string contains a URL (Alfred NP)", function() {
      req = {
        body: {
          text: 'np: Philter - Lotus Land (http://open.spotify.com/fe423n2od3)'
        }
      }

      expect(lastfmService.get(req)).to.eql({ text: '' });
    });

    it('should send a request to the Last.fm API when someone types "np:username"', function () {
      req = {
        body: {
          'text': 'np:hpbeliever'
        }
      };

      lastfmService.get(req);

      expect(request).calledOnce.and.calledWith(url.replace('{user}', 'hpbeliever'));
    });

    it('should send a request to the Last.fm API when someone types "nowplaying: username"', function () {
      req = {
        body: {
          'text': 'nowplaying: ankjevel'
        }
      };

      lastfmService.get(req);

      expect(request).calledOnce.and.calledWith(url.replace('{user}', 'ankjevel'));
    });

    it('should send a request to the Last.fm API with "iteam1337" when someone types np or nowplaying', function () {
      req = {
        body: {
          'text': 'np'
        }
      };

      lastfmService.get(req);

      expect(request).calledOnce.and.calledWith(url.replace('{user}', 'iteam1337'));
    });
  });
});