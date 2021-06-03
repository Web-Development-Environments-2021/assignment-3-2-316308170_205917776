const supertest = require('supertest');
const app = require('./main');
//const DB = require('./routes/utils/DButils')
jest.setTimeout(10000)

let server = supertest(app);

// beforeEach((done) => {
//     server = app.listen(4000, (err) => {
//       if (err) return done(err);
//        agent = request.agent(server); // since the application is already listening, it should use the allocated port
//        done();
//     });
// });

// afterEach((done) => {
//   return  server && server.close(done);
// });



describe('TODO API', () => {
    test('GET /todos --> array todos', (done) =>{
        const expectedResponse =  [
            {
                Match_ID: expect.any(Number),
                Home_Team_ID: expect.any(Number),
                Away_Team_ID: expect.any(Number),
                Match_Date: expect.any(String),
                Stadium: expect.any(String),
                Stage: expect.any(Number),
                Score: null,
                EventBook: null,
                Referee_ID: expect.any(Number),
            }
        ];
        server
        .get('/matches/1')
        .expect(200)
        .end((err,res) => {
            expect(res.body).toEqual(expectedResponse);
            done();
        })
    })
})
