class Request {
  url;
  constructor(url) {
    this.url = url;
  }
}

class Response {
  send() {
    console.log("send response");
  }
}

class Express {
  _middlewares = [];
  constructor() {}

  use(middleware) {
    this._middlewares.push(middleware);
  }

  handleRequest(req, res) {
    let index = 0;
    let _this = this;
    if (index < this._middlewares.length) {
      function next() {
        const middleware = _this._middlewares[index++];
        middleware(req, res, next);
      }
      next();
    }
  }
}

const app = new Express();
app.use((req, res, next) => {
  console.log("middleware 1");
  next();
});

app.use((req, res, next) => {
  console.log("middleware 2");
  next();
});

app.use((req, res, next) => {
  console.log("middleware 3");
  res.send();
});

const req = new Request("/user");
const res = new Response();
app.handleRequest(req, res);
