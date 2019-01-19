import Opaler from '../index';
import * as request from 'request';
// import * as cards from './mocks/card-details';
// import * as activity from './mocks/card-activity';

jest.mock('request', () => ({
  jar: jest.fn().mockImplementation(() => request.jar),
  get: jest.fn().mockImplementation(() => null),
}));

test('#Opaler', () => {
  const opaler = new Opaler('user', 'password');

  // tslint:disable no-string-literal
  expect(opaler['username']).toBe('user');
  expect(opaler['password']).toBe('password');
  expect(opaler['baseurl']).toBe('https://www.opal.com.au');
  expect(opaler['cookie']).toBe(request.jar);
  // tslint:enable no-string-literal
});

test('#getAccount()', () => {
  const opaler = new Opaler('user', 'password');
  opaler.getAccount();

  expect(request.get).toBeCalledWith(
    'https://www.opal.com.au/registered/my-details/',
    expect.any(Object),
    expect.any(Function),
  );
});
