import {APP_VERSION} from '@/utils/appVersion';
import reducer, {setWSMaintenance, setWSServerVersion} from './wsSlice';

describe('wsSlice reducer', () => {
  it('should return the initial state when passed an empty action', () => {
    const result = reducer(undefined, {type: ''});
    expect(result).toEqual({
      maintenance: false,
      localVersion: APP_VERSION,
      serverVersion: null,
    });
  });

  it('should handle setWSMaintenance', () => {
    const result = reducer(undefined, setWSMaintenance(true));
    expect(result).toEqual({
      maintenance: true,
      localVersion: APP_VERSION,
      serverVersion: null,
    });
  });
});

it('keeps the loaded bundle version separate from announcements and ignores malformed versions', () => {
  const announced = reducer(undefined, setWSServerVersion('3.10.0'));
  expect(announced.localVersion).toBe(APP_VERSION);
  expect(announced.serverVersion).toBe('3.10.0');
  for (const invalid of ['v3.0.0', '03.0.0', '3.0', '', null, 3]) {
    expect(reducer(announced, setWSServerVersion(invalid))).toEqual(announced);
  }
});
