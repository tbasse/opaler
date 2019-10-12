import Opaler from '../index';
import * as request from 'request';
// import * as cards from './mocks/card-details';
// import * as activity from './mocks/card-activity';

jest.mock('request', () => ({
  jar: jest.fn().mockImplementation(() => request.jar),
  get: jest.fn().mockImplementation(() => request.get),
  post: jest.fn().mockImplementation(() => request.post),
}));

describe('Opaler', () => {
  test('constructor', () => {
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

  test('#authorize()', () => {
    const opaler = new Opaler('user', 'password');
    const cb = jest.fn();
    // tslint:disable-next-line no-string-literal
    opaler['authorize'](cb);

    expect(request.post).toBeCalledWith(
      'https://www.opal.com.au/login/registeredUserUsernameAndPasswordLogin',
      {
        form: {
          attempt: '',
          h_password: 'password',
          h_username: 'user',
          submit: 'Log in',
        },
        jar: request.jar,
      },
      expect.any(Function),
    );
  });

  test('#getRequest()', () => {
    const opaler = new Opaler('user', 'password');
    // tslint:disable-next-line no-string-literal
    opaler['getRequest']('https://www.opal.com.au/some/path', () => null);

    expect(request.get).toBeCalledWith(
      'https://www.opal.com.au/some/path',
      { jar: request.jar },
      expect.any(Function),
    );
  });

  test('#getTransactionsSinglePage()', () => {
    const opaler = new Opaler('user', 'password');
    // tslint:disable-next-line no-string-literal
    opaler['getTransactionsSinglePage'](
      {
        month: 1,
        year: 2018,
        pageIndex: 1,
        cardIndex: 1,
        ts: 1234,
      },
      () => null,
    );

    expect(request.get).toBeCalledWith(
      'https://www.opal.com.au/some/path',
      { jar: request.jar },
      expect.any(Function),
    );
  });
});
