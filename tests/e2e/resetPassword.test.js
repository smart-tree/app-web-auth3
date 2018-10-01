import {RequestMock, RequestLogger} from 'testcafe';

const resetEndpoint = 'https://tmodoux.pryv.me/account/reset-password';
const emailEndpoint = 'https://reg.pryv.me/test@test.com/uid';

const resetLogger = RequestLogger(resetEndpoint, {
  logRequestBody: true,
  stringifyRequestBody: true,
});

const emailLogger = RequestLogger(emailEndpoint);

const resetRequestMock = RequestMock()
  .onRequestTo(resetEndpoint)
  .respond(null, 200, {'Access-Control-Allow-Origin': '*'});

const usernameForEmailMock = RequestMock()
  .onRequestTo(emailEndpoint)
  .respond({uid: 'tmodoux'}, 200, {'Access-Control-Allow-Origin': '*'});

fixture(`Reset password`)
  .page('http://localhost:8080/#/reset?resetToken=1234&requestingAppId=pryv-reset-standalone')
  .requestHooks(resetLogger, emailLogger, resetRequestMock, usernameForEmailMock);

test('Reset password with email conversion', async testController => {
  await testController
    .typeText('#usernameOrEmail', 'test@test.com')
    .typeText('#password', '123456789')
    .typeText('#passConfirmation', '123456789')
    .click('#submitButton')
    .expect(emailLogger.contains(record =>
      record.request.method === 'get' &&
      record.response.statusCode === 200
    )).ok()
    .expect(resetLogger.contains(record =>
      record.request.method === 'post' &&
      record.response.statusCode === 200 &&
      record.request.body.includes('"appId":"pryv-reset-standalone"') &&
      record.request.body.includes('"username":"tmodoux"') &&
      record.request.body.includes('"newPassword":"123456789"') &&
      record.request.body.includes('"resetToken":"1234"')
    )).ok();
});