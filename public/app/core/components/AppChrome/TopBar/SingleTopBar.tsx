import { css } from '@emotion/css';
import { cloneDeep } from 'lodash';
import { memo } from 'react';

import { GrafanaTheme2, NavModelItem } from '@grafana/data';
import { Dropdown, IconButton, Stack, ToolbarButton, useStyles2 } from '@grafana/ui';
import { config } from 'app/core/config';
import { useGrafana } from 'app/core/context/GrafanaContext';
import { contextSrv } from 'app/core/core';
import { t } from 'app/core/internationalization';
import { HOME_NAV_ID } from 'app/core/reducers/navModel';
import { useSelector } from 'app/types';

import { Breadcrumbs } from '../../Breadcrumbs/Breadcrumbs';
import { buildBreadcrumbs } from '../../Breadcrumbs/utils';
import { HistoryContainer } from '../History/HistoryContainer';
import { enrichHelpItem } from '../MegaMenu/utils';
import { QuickAdd } from '../QuickAdd/QuickAdd';
import { TOP_BAR_LEVEL_HEIGHT } from '../types';

import { InviteUserButton } from './InviteUserButton';
import { ProfileButton } from './ProfileButton';
import { SignInLink } from './SignInLink';
import { TopNavBarMenu } from './TopNavBarMenu';
import { TopSearchBarCommandPaletteTrigger } from './TopSearchBarCommandPaletteTrigger';

export const MEGA_MENU_TOGGLE_ID = 'mega-menu-toggle';

interface Props {
  sectionNav: NavModelItem;
  pageNav?: NavModelItem;
  onToggleMegaMenu(): void;
  onToggleKioskMode(): void;
}

export const SingleTopBar = memo(function SingleTopBar({
  onToggleMegaMenu,
  onToggleKioskMode,
  pageNav,
  sectionNav,
}: Props) {
  const { chrome } = useGrafana();
  const state = chrome.useState();
  const menuDockedAndOpen = !state.chromeless && state.megaMenuDocked && state.megaMenuOpen;
  const styles = useStyles2(getStyles, menuDockedAndOpen);
  const navIndex = useSelector((state) => state.navIndex);

  const helpNode = cloneDeep(navIndex['help']);
  const enrichedHelpNode = helpNode ? enrichHelpItem(helpNode) : undefined;
  const profileNode = navIndex['profile'];
  const homeNav = useSelector((state) => state.navIndex)[HOME_NAV_ID];
  const breadcrumbs = buildBreadcrumbs(sectionNav, pageNav, homeNav);
  const unifiedHistoryEnabled = config.featureToggles.unifiedHistory;
  // NI fork: hide the top bar when not in root view
  const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1].href;
  const niHideBarStyle: React.CSSProperties = lastBreadcrumb.split('/dashboards')[1] !== '' ? { display: 'none' } : {};

  return (
    <div className={styles.layout} style={niHideBarStyle}>
      <Stack minWidth={0} gap={0.5} alignItems="center">
        {!menuDockedAndOpen && (
          // NI fork: Simple icon button is preferred over ToolbarButton, and removes branding logo
          <IconButton
            id={MEGA_MENU_TOGGLE_ID}
            onClick={onToggleMegaMenu}
            tooltip={t('navigation.megamenu.open', 'Open menu')}
            name='arrow-from-right'
          >
        </IconButton>
        // <ToolbarButton
        //     narrow
        //     id={MEGA_MENU_TOGGLE_ID}
        //     onClick={onToggleMegaMenu}
        //     tooltip={t('navigation.megamenu.open', 'Open menu')}
        //   >
        //     <Stack gap={0} alignItems="center">
        //       <Branding.MenuLogo className={styles.img} />
        //       <Icon size="sm" name="angle-down" />
        //     </Stack>
        //   </ToolbarButton>
        // end NI fork changes
      )}
        <Breadcrumbs breadcrumbs={breadcrumbs} className={styles.breadcrumbsWrapper} />
      </Stack>

      <Stack gap={0.5} alignItems="center" style={{ display: 'none'}}>
        <TopSearchBarCommandPaletteTrigger />
        {unifiedHistoryEnabled && <HistoryContainer />}
        <QuickAdd />
        {enrichedHelpNode && (
          <Dropdown overlay={() => <TopNavBarMenu node={enrichedHelpNode} />} placement="bottom-end">
            <ToolbarButton iconOnly icon="question-circle" aria-label="Help" />
          </Dropdown>
        )}
        <ToolbarButton
          icon="monitor"
          className={styles.kioskToggle}
          onClick={onToggleKioskMode}
          tooltip="Enable kiosk mode"
        />
        {!contextSrv.user.isSignedIn && <SignInLink />}
        {config.featureToggles.inviteUserExperimental && <InviteUserButton />}
        {profileNode && <ProfileButton profileNode={profileNode} />}
      </Stack>
    </div>
  );
});

const getStyles = (theme: GrafanaTheme2, menuDockedAndOpen: boolean) => ({
  layout: css({
    height: TOP_BAR_LEVEL_HEIGHT,
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    paddingLeft: menuDockedAndOpen ? theme.spacing(3.5) : theme.spacing(0.75),
    borderBottom: `1px solid ${theme.colors.border.weak}`,
    justifyContent: 'space-between',

    [theme.breakpoints.up('lg')]: {
      gridTemplateColumns: '2fr minmax(550px, 1fr)',
      display: 'grid',
      justifyContent: 'flex-start',
    },
  }),
  breadcrumbsWrapper: css({
    display: 'flex',
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
      minWidth: '40%',
    },
  }),
  img: css({
    alignSelf: 'center',
    height: theme.spacing(3),
    width: theme.spacing(3),
  }),
  kioskToggle: css({
    [theme.breakpoints.down('lg')]: {
      display: 'none',
    },
  }),
});
