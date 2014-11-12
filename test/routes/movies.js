var chai       = require('chai');
var expect     = chai.expect;
var sinon      = require('sinon');
var proxyquire = require('proxyquire');

chai.use(require('sinon-chai'));

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
    query: sinon.spy()
  };
  next = sinon.spy();
  res = {
    send: sinon.spy(),
    render: sinon.spy()
  };
  service = {
    get: sinon.stub().returns(promise),
  };
  movies = proxyquire(process.cwd() + '/lib/routes/movies', {
    '../services/movies': service
  });
});

describe('#movies', function() {
  it('should be a function', function () {
    expect(movies).to.be.a('function');
  });

  it('should call the Db to get one movie', function () {
    movies(req,res,next);
    expect(service.get).calledOnce.and.calledWith(req);
  });

  it('should get some movies back and render index', function () {
    var result = { results: [{ title: 'Non-Stop' }]};
    movies(req,res,next);
    promise.then.yield(result);
    expect(res.send).calledOnce.and.calledWith(result);
  });

  it("should call next with error if any", function() {
    var error = { oh: 'noes' };
    movies(req, res, next);
    promise.catch.yield(error);
    expect(next).calledOnce.and.calledWith(error);    
  });
});