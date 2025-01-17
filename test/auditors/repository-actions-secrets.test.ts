import fetchMock from 'fetch-mock';

import { buildAuditorArguments } from '../helpers/auditors';
import { auditor } from '../../src/auditors/repository-actions-secrets';

describe('repositoryActionSecrets', () => {
  it('returns a warning if there are actions secrets', async () => {
    const fetch = fetchMock
      .sandbox()
      .getOnce('https://api.github.com/repos/test/test/actions/secrets?per_page=1', {
        total_count: 3,
        secrets: [
          {
            name: 'MYSECRET',
            created_at: '2023-01-01T16:21:27Z',
            updated_at: '2023-01-01T16:21:27Z',
          },
        ],
      });

    const auditorArguments = buildAuditorArguments({ fetchMock: fetch });
    const warnings = await auditor(auditorArguments);

    expect(warnings).toEqual([
      {
        message:
          'This repository has 3 GitHub Actions secrets, which will not be migrated',
      },
    ]);
  });

  it("returns no warnings if there aren't any repository action secrets", async () => {
    const fetch = fetchMock
      .sandbox()
      .getOnce('https://api.github.com/repos/test/test/actions/secrets?per_page=1', {
        total_count: 0,
        secrets: [],
      });

    const auditorArguments = buildAuditorArguments({ fetchMock: fetch });
    const warnings = await auditor(auditorArguments);

    expect(warnings).toEqual([]);
  });
});
