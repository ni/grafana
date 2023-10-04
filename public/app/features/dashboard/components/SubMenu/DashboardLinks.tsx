import React from 'react';
import { useEffectOnce } from 'react-use';

import { sanitizeUrl } from '@grafana/data/src/text/sanitize';
import { selectors } from '@grafana/e2e-selectors';
import { TimeRangeUpdatedEvent } from '@grafana/runtime';
import { DashboardLink } from '@grafana/schema';
import { Tooltip, useForceUpdate } from '@grafana/ui';

import { getLinkSrv } from '../../../panel/panellinks/link_srv';
import { DashboardModel } from '../../state';
import { linkIconMap } from '../LinksSettings/LinkSettingsEdit';

import { DashboardLinkButton, DashboardLinksDashboard } from './DashboardLinksDashboard';

export interface Props {
  dashboard: DashboardModel;
  links: DashboardLink[];
}

export const DashboardLinks = ({ dashboard, links }: Props) => {
  const forceUpdate = useForceUpdate();

  useEffectOnce(() => {
    const sub = dashboard.events.subscribe(TimeRangeUpdatedEvent, forceUpdate);
    return () => sub.unsubscribe();
  });

  if (!links.length) {
    return null;
  }

  // NI fork: Use iframe location for links
  const getCorrectedHref = function (href: string) {
    try {
      // If absolute URL, return
      new URL(href);
      return href;
    } catch {
      // If relative URL, build in context of iframe location
      const split = window.parent.location.href.split('/d/');
      return `${split[0]}/${href}`;
    }
  };

  return (
    <>
      {links.map((link: DashboardLink, index: number) => {
        const linkInfo = getLinkSrv().getAnchorInfo(link);
        const key = `${link.title}-$${index}`;

        if (link.type === 'dashboards') {
          return <DashboardLinksDashboard key={key} link={link} linkInfo={linkInfo} dashboardUID={dashboard.uid} />;
        }

        const icon = linkIconMap[link.icon];

        const linkElement = (
          <DashboardLinkButton
            href={getCorrectedHref(sanitizeUrl(linkInfo.href))}
            target={link.targetBlank ? '_blank' : undefined}
            rel="noreferrer"
            data-testid={selectors.components.DashboardLinks.link}
            icon={icon}
          >
            {linkInfo.title}
          </DashboardLinkButton>
        );

        return (
          <div key={key} className="gf-form" data-testid={selectors.components.DashboardLinks.container}>
            {link.tooltip ? <Tooltip content={linkInfo.tooltip}>{linkElement}</Tooltip> : linkElement}
          </div>
        );
      })}
    </>
  );
};
