var chai       = require('chai');
var expect     = chai.expect;
var sinon      = require('sinon');
var proxyquire = require('proxyquire');

chai.use(require('sinon-chai'));

describe('#tmdb', function() {
  var route, 
    service,
    req,
    res,
    next,
    promise,
    mongojs;

  beforeEach(function () {
    promise = {
      then: sinon.stub().returns({
        title: 'Inception'
      }),
      catch: sinon.spy()
    };
    promise.then.returns(promise);
    next = sinon.spy();
    res = {
      send: sinon.spy()
    };

    service = {
      get: sinon.stub().returns(promise),
    };

    mongojs = {
      connect: sinon.stub().returns({
        movies: {
          save: sinon.spy()
        }
      })
    };


    route = proxyquire(process.cwd() + '/lib/routes/tmdb', {
      'mongojs': mongojs,
      '../services/tmdb': service
    });
  });

  it('should be a function', function () {
    expect(route).to.be.a('function');
  });

  it("should setup connection to mongo", function() {
    expect(mongojs.connect).calledOnce.and.calledWith('movies', ['movies', 'movies-org', 'imdb']); 
  });

  it("should call service with IMDb ID from params if it exists", function() {
    req = {
      params: {
        imdbid: 'tt123'
      }
    };
    
    route(req);

    expect(service.get).calledOnce.and.calledWith('tt123');
  });

  it("should call service with IMDb ID from body if it exists", function() {
    req = {
      params: {},
      body: {
        imdbid: 'tt321'
      }
    };

    route(req);

    expect(service.get).calledOnce.and.calledWith('tt321');
  });

  it("should filter out IMDb ID if a URL is provided in params", function() {
    req = {
      params: {
        imdbid: 'http://www.imdb.com/title/tt0278504/'
      }
    };

    route(req);

    expect(service.get).calledOnce.and.calledWith('tt0278504');
  });

  it("should filter out IMDb ID if a URL is provided in body", function() {
    req = {
      params: {},
      body: {
        imdbid: 'http://www.imdb.com/title/tt0278504/'
      }
    };

    route(req);

    expect(service.get).calledOnce.and.calledWith('tt0278504');
  });

  it("should filter out IMDb ID if a complicated IMDb URL is given", function() {
    req = {
      params: {},
      body: {
        imdbid: 'http://www.imdb.com/title/tt1375666/?ref_=fn_al_tt_1'
      }
    };

    route(req);

    expect(service.get).calledOnce.and.calledWith('tt1375666');
  });

});