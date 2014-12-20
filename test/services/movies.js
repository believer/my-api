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

    process.env.MONGO_COLLECTION = 'movies';

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
      query: {},
      params: {}
    };

    moviesService.get(req);
    expect(mongojs.connect().movies.find).calledOnce.and.calledWith({});
  });

  it("should call db to find movies WITH query", function() {
    req = {
      query: {
        title: 'Inception'
      },
      params: {}
    };

    moviesService.get(req);
    expect(mongojs.connect().movies.find).calledOnce.and.calledWith({ title: { $regex: 'Inception', $options: 'i' } });
  });

  it("should call with correct sortorder", function() {
    req = {
      query: {},
      params: {}
    };

    moviesService.get(req);
    expect(mongojs.connect().movies.find().sort).calledOnce.and.calledWith({ date: -1 });
  });

  it("should call skip with 0 if no skip is given in query", function() {
    req = {
      query: {},
      params: {}
    };

    moviesService.get(req);
    expect(mongojs.connect().movies.find().sort().skip).calledOnce.and.calledWith(0);    
  });

  it("should call skip with 1337 if query has skip:1337", function() {
    req = {
      query: {
        skip: 1337
      },
      params: {}
    };

    moviesService.get(req);
    expect(mongojs.connect().movies.find().sort().skip).calledOnce.and.calledWith(1337);    
  });


  it("should call limit with 500 if query has limit:500", function() {
    req = {
      query: {
        limit: 500
      },
      params: {}
    };

    moviesService.get(req);
    expect(mongojs.connect().movies.find().sort().skip().limit).calledOnce.and.calledWith(500);    
  });
});