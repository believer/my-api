var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var Q = require('q');

chai.use(require('sinon-chai'));

describe('/moviesService', function () {
  var moviesService,
    routes,
    promise,
    req,
    mongojs,
    q;

  beforeEach(function () {
    q = {
      defer: sinon.stub().returns({
        promise: sinon.spy(),
        resolve: sinon.spy()
      })
    };

    mongojs = {
      connect: sinon.stub().returns({
        movies: {
          find: sinon.stub().returns({
            sort: sinon.stub().returns({
              skip: sinon.stub().returns({
                limit: sinon.spy()
              })
            })
          })
        }
      })
    };

    moviesService = proxyquire(process.cwd() + '/lib/services/movies', {
      'mongojs': mongojs,
      'q': q
    });
  });

  it('should be a function', function () {
    expect(moviesService.get).to.be.a('function');
  });

  it('should setup connection to db', function () {
    expect(mongojs.connect).calledOnce.and.calledWith('movies', ['movies', 'movies-org', 'imdb']);
  });

  it("should call db to find movies without query", function() {
    req = {
      query: {}
    };

    moviesService.get(req);
    expect(mongojs.connect.defaultBehavior.returnValue.movies.find).calledOnce.and.calledWith({});
  });

  it("should call db to find movies WITH query", function() {
    req = {
      query: {
        title: 'Inception'
      }
    };

    moviesService.get(req);
    expect(mongojs.connect.defaultBehavior.returnValue.movies.find).calledOnce.and.calledWith({ title: { $regex: 'Inception', $options: 'i' } });
  });

  it("should call with correct sortorder", function() {
    req = {
      query: {}
    };

    moviesService.get(req);
    expect(mongojs.connect.defaultBehavior.returnValue.movies.find.defaultBehavior.returnValue.sort).calledOnce.and.calledWith({ _id: -1 });
  });

  it("should call skip with 0 if no skip is given in query", function() {
    req = {
      query: {}
    };

    moviesService.get(req);
    expect(mongojs.connect.defaultBehavior.returnValue.movies.find.defaultBehavior.returnValue.sort.defaultBehavior.returnValue.skip).calledOnce.and.calledWith(0);    
  });

  it("should call skip with 1337 if query has skip:1337", function() {
    req = {
      query: {
        skip: 1337
      }
    };

    moviesService.get(req);
    expect(mongojs.connect.defaultBehavior.returnValue.movies.find.defaultBehavior.returnValue.sort.defaultBehavior.returnValue.skip).calledOnce.and.calledWith(1337);    
  });


  it("should call limit with 500 if query has limit:500", function() {
    req = {
      query: {
        limit: 500
      }
    };

    moviesService.get(req);
    expect(mongojs.connect.defaultBehavior.returnValue.movies.find.defaultBehavior.returnValue.sort.defaultBehavior.returnValue.skip.defaultBehavior.returnValue.limit).calledOnce.and.calledWith(500);    
  });
});