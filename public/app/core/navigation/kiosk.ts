import { UrlQueryMap } from '@grafana/data';

import { KioskMode } from '../../types';

// TODO Remove after topnav feature toggle is permanent and old NavBar is removed
export function getKioskMode(queryParams: UrlQueryMap): KioskMode | null {
  switch (queryParams.kiosk) {
    case 'tv':
    case '1':
    case true:
      return KioskMode.TV;
    default:
      return null;
  }
}
