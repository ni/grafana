import { locationService } from '@grafana/runtime';
import { KioskMode } from '../../types';

export function toggleKioskMode() {
  let kiosk = locationService.getSearchObject().kiosk;

  switch (kiosk) {
    case 'tv':
    case '1':
    case true:
      kiosk = null;
      break;
    default:
      kiosk = 'tv';
  }

  locationService.partial({ kiosk });
}

export function getKioskMode(): KioskMode {
  const kiosk = locationService.getSearchObject().kiosk;

  switch (kiosk) {
    case 'tv':
      return KioskMode.TV;
    //  legacy support
    case '1':
    case true:
      return KioskMode.Full;
    default:
      return KioskMode.Off;
  }
}

export function exitKioskMode() {
  locationService.partial({ kiosk: null });
}
