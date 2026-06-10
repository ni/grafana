import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom-v5-compat';
import { getGrafanaContextMock } from 'test/mocks/getGrafanaContextMock';

import { GrafanaContext } from 'app/core/context/GrafanaContext';
import { KioskMode } from 'app/types/dashboard';

import { DashboardModel } from '../../state/DashboardModel';
import { createDashboardModelFixture } from '../../state/__fixtures__/dashboardFixtures';

import { DashNav } from './DashNav';

// DashNav renders via AppChromeUpdate which injects actions into the chrome.
// We mock AppChromeUpdate to directly render the actions prop so we can test what DashNav produces.
jest.mock('app/core/components/AppChrome/AppChromeUpdate', () => ({
  AppChromeUpdate: ({ actions }: { actions: React.ReactNode }) => <div data-testid="dashnav-actions">{actions}</div>,
}));

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  locationService: {
    ...jest.requireActual('@grafana/runtime').locationService,
    getLocation: () => ({ pathname: '/d/test', search: '', hash: '' }),
    partial: jest.fn(),
    getHistory: jest.requireActual('@grafana/runtime').locationService.getHistory,
  },
}));

function setup(dashboard: DashboardModel, kioskMode?: KioskMode | null) {
  const store = {
    getState: () => ({
      navIndex: {},
    }),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
    [Symbol.observable]: jest.fn(),
  };
  const context = getGrafanaContextMock();

  return render(
    <GrafanaContext.Provider value={context}>
      <Provider store={store as any}>
        <MemoryRouter>
          <DashNav
            dashboard={dashboard}
            title={dashboard.title}
            isFullscreen={false}
            kioskMode={kioskMode}
            hideTimePicker={false}
            folderTitle=""
          />
        </MemoryRouter>
      </Provider>
    </GrafanaContext.Provider>
  );
}

describe('DashNav', () => {
  let dashboard: DashboardModel;

  beforeEach(() => {
    dashboard = createDashboardModelFixture({
      title: 'Test Dashboard',
      uid: 'test-uid',
    });
    dashboard.meta = {
      ...dashboard.meta,
      canStar: true,
      canSave: true,
      canEdit: true,
      canShare: true,
      showSettings: true,
    };
  });

  describe('in embed kiosk mode', () => {
    it('should only render time controls and hide other actions', () => {
      setup(dashboard, KioskMode.Embed);
      // Star, save, settings, share buttons should NOT be rendered
      expect(screen.queryByRole('button', { name: /mark as favorite/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /save dashboard/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /dashboard settings/i })).not.toBeInTheDocument();
    });

    it('should not render left actions', () => {
      setup(dashboard, KioskMode.Embed);
      expect(screen.queryByRole('button', { name: /mark as favorite/i })).not.toBeInTheDocument();
    });
  });
});
