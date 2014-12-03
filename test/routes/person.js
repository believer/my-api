var chai       = require('chai');
var expect     = chai.expect;
var sinon      = require('sinon');
var proxyquire = require('proxyquire');

chai.use(require('sinon-chai'));

describe('#person', function() {
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
    route = proxyquire(process.cwd() + '/lib/routes/person', {
      '../services/person': service
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
    var result = [{ title: 'Forrest Gump', rating: 9 }];
    route(req,res,next);
    promise.then.yield(result);
    expect(res.send).calledOnce.and.calledWith({
      movies: result,
      averageRating: 9,
      name: 'Tom Hanks',
      results: result.length
    });
  });

  it("should calculate the average rating of a person based on the movie ratings", function() {
    var result = [
      { title: 'Forrest Gump', rating: 9 },
      { title: 'Cast Away', rating: 8 },
      { title: 'Saving Private Ryan', rating: 8 },
      { title: 'Joe Versus The Volcano' }
    ];
    route(req,res,next);
    promise.then.yield(result);
    expect(res.send).calledOnce.and.calledWith({
      movies: result,
      averageRating: 8.33,
      name: 'Tom Hanks',
      results: result.length
    });    
  });

  it('should call next with error if any', function () {
    var error = { oh: 'noes' };
    route(req, res, next);
    promise.catch.yield(error);
    expect(next).calledOnce.and.calledWith(error);
  });
});