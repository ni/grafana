import { act, render } from '@testing-library/react';

import { SceneGridLayout, SceneTimeRange, VizPanel } from '@grafana/scenes';
import { KioskMode } from 'app/types/dashboard';

import { DefaultGridLayoutManager } from './layout-default/DefaultGridLayoutManager';
import { DashboardGridItem } from './layout-default/DashboardGridItem';
import { DashboardScene } from './DashboardScene';

jest.mock('react-router-dom-v5-compat', () => ({
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
}));

jest.mock('app/types/store', () => ({
  useSelector: (fn: Function) => fn({ navIndex: {} }),
}));

jest.mock('app/core/selectors/navModel', () => ({
  getNavModel: () => ({ main: { children: [] }, node: { id: 'home', text: 'Home', url: '/' } }),
}));

jest.mock('app/core/components/Page/Page', () => ({
  Page: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../edit-pane/DashboardEditPaneSplitter', () => ({
  DashboardEditPaneSplitter: () => null,
}));

jest.mock('./PanelSearchLayout', () => ({
  PanelSearchLayout: () => null,
}));

jest.mock('./SoloPanelContext', () => ({
  useDefineSoloPanelContext: () => null,
  SoloPanelContextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const STYLE_ID = 'kiosk-embed-panel-menu-hide';

function buildTestScene(kioskMode?: KioskMode): DashboardScene {
  return new DashboardScene({
    $timeRange: new SceneTimeRange({ from: 'now-6h', to: 'now' }),
    kioskMode,
    body: new DefaultGridLayoutManager({
      grid: new SceneGridLayout({
        children: [new DashboardGridItem({ body: new VizPanel({ pluginId: 'text' }) })],
      }),
    }),
  });
}

describe('DashboardSceneRenderer', () => {
  describe('embed kiosk mode CSS injection', () => {
    afterEach(() => {
      document.getElementById(STYLE_ID)?.remove();
    });

    it('should inject hide-panel-menu style when kioskMode is Embed', () => {
      const scene = buildTestScene(KioskMode.Embed);

      render(<scene.Component model={scene} />);

      expect(document.getElementById(STYLE_ID)).toBeInTheDocument();
    });

    it('should NOT inject hide-panel-menu style when kioskMode is Full', () => {
      const scene = buildTestScene(KioskMode.Full);

      render(<scene.Component model={scene} />);

      expect(document.getElementById(STYLE_ID)).not.toBeInTheDocument();
    });

    it('should NOT inject hide-panel-menu style when no kiosk mode is set', () => {
      const scene = buildTestScene(undefined);

      render(<scene.Component model={scene} />);

      expect(document.getElementById(STYLE_ID)).not.toBeInTheDocument();
    });

    it('should remove the style when kioskMode changes away from Embed', () => {
      const scene = buildTestScene(KioskMode.Embed);
      render(<scene.Component model={scene} />);

      expect(document.getElementById(STYLE_ID)).toBeInTheDocument();

      act(() => {
        scene.setState({ kioskMode: undefined });
      });

      expect(document.getElementById(STYLE_ID)).not.toBeInTheDocument();
    });
  });
});
