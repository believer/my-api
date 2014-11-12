var chai       = require('chai')
,   expect     = chai.expect
,   sinon      = require('sinon')
,   proxyquire = require('proxyquire');

chai.use(require('sinon-chai'));

describe('#lastfm', function() {
  var route, 
    service,
    req,
    res,
    next,
    promise;

  beforeEach(function () {
    promise = {
      then: sinon.stub(),
      catch: sinon.spy()
    };
    promise.then.returns(promise);
    req = {};
    next = sinon.spy();
    res = {
      send: sinon.spy()
    };
    service = {
      get: sinon.stub().returns(promise),
    };
    route = proxyquire(process.cwd() + '/lib/routes/lastfm', {
      '../services/lastfm': service
    });
  });

  it('should be a function', function () {
    expect(route).to.be.a('function');
  });

  it('should call Last.fm API', function () {
    route(req,res);
    expect(service.get).calledOnce.and.calledWith({});
  });

  it('should send result', function () {
    var result = { text: '30 Seconds to Mars' };
    route(req,res,next);
    promise.then.yield(result);
    expect(res.send).calledOnce.and.calledWith(result);
  });

  it('should call next with error if any', function () {
    var error = { oh: 'noes' };
    route(req, res, next);
    promise.catch.yield(error);
    expect(next).calledOnce.and.calledWith(error);
  });
});