import { css } from '@emotion/css';
import { PropsWithChildren } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Components } from '@grafana/e2e-selectors';
import { Stack, useStyles2 } from '@grafana/ui';

import { TOP_BAR_LEVEL_HEIGHT } from '../types';

export function SingleTopBarActions({ children }: PropsWithChildren) {
  const styles = useStyles2(getStyles);

  return (
    <div data-testid={Components.NavToolbar.container} className={styles.actionsBar}>
      <Stack alignItems="center" justifyContent="flex-end" flex={1} wrap="nowrap" minWidth={0}>
        {children}
      </Stack>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    actionsBar: css({
      alignItems: 'center',
      backgroundColor: 'rgb(244, 245, 245)', // NI fork: do not want header to be white, but share same color as page content
      borderBottom: `1px solid ${theme.colors.border.weak}`,
      display: 'flex',
      height: TOP_BAR_LEVEL_HEIGHT,
      padding: theme.spacing(0, 1, 0, 2),
    }),
  };
};
