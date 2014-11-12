var chai       = require('chai');
var expect     = chai.expect;
var sinon      = require('sinon');
var proxyquire = require('proxyquire');

chai.use(require('sinon-chai'));

describe('#actor', function() {
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
    req = {
      query: {
        name:'Tom Hanks'
      }
    };
    next = sinon.spy();
    res = {
      send: sinon.spy()
    };
    service = {
      get: sinon.stub().returns(promise),
    };
    route = proxyquire(process.cwd() + '/lib/routes/actor', {
      '../services/actor': service
    });
  });

  it('should be a function', function () {
    expect(route).to.be.a('function');
  });

  it('should get movies from db', function () {
    route(req,res);
    expect(service.get).calledOnce.and.calledWith({ query: { name: 'Tom Hanks' }});
  });

  it('should send result', function () {
    var result = [{ title: 'Forrest Gump' }];
    route(req,res,next);
    promise.then.yield(result);
    expect(res.send).calledOnce.and.calledWith({
      movies: result,
      actor: 'Tom Hanks'
    });
  });

  it('should call next with error if any', function () {
    var error = { oh: 'noes' };
    route(req, res, next);
    promise.catch.yield(error);
    expect(next).calledOnce.and.calledWith(error);
  });
});