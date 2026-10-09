import { fireEvent, render, screen } from '@testing-library/react';

import { createTheme } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';
import { locationService } from '@grafana/runtime';
import { InspectTab } from 'app/features/inspector/types';

import { PanelModel } from '../../state/PanelModel';

import { PanelHeaderCorner, Props } from './PanelHeaderCorner';

const setup = (error?: string) => {
  const testPanel = new PanelModel({ id: 123, title: 'test', description: 'test panel' });
  const props: Props = {
    panel: testPanel,
    theme: createTheme(),
    error,
  };
  return render(<PanelHeaderCorner {...props} />);
};

describe('Panel header corner test', () => {
  afterEach(() => {
    locationService.push('/');
  });

  it.each([
    { kiosk: 'embed', shouldInspect: false },
    { kiosk: undefined, shouldInspect: true },
    { kiosk: 'true', shouldInspect: true },
    { kiosk: '1', shouldInspect: true },
  ])('only blocks error inspection in embed mode (kiosk=$kiosk)', async ({ kiosk, shouldInspect }) => {
    locationService.push(kiosk ? `/d/test/dashboard?kiosk=${kiosk}` : '/d/test/dashboard');
    setup('boom!');

    const button = screen.getByRole('button', {
      name: selectors.components.Panels.Panel.headerCornerInfo('error'),
    });
    fireEvent.click(button);

    if (shouldInspect) {
      expect(locationService.getSearchObject()).toMatchObject({ inspect: '123', inspectTab: InspectTab.Error });
    } else {
      expect(locationService.getSearchObject()).not.toHaveProperty('inspect');
      expect(locationService.getSearchObject()).not.toHaveProperty('inspectTab');
    }

    fireEvent.focus(button);
    expect(await screen.findByText('boom!')).toBeInTheDocument();
  });

  it('should render component', () => {
    setup();

    expect(
      screen.getByRole('button', { name: selectors.components.Panels.Panel.headerCornerInfo('info') })
    ).toBeInTheDocument();
  });
});
