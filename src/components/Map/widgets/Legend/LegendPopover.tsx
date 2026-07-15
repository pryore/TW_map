import styled from '@emotion/styled';
import { Flex, Heading, Text } from '@radix-ui/themes';
import { useAtom } from 'jotai';
import React from 'react';


import useIsMobile from '@/lib/hooks/useIsMobile';

import { legendOpen } from '../../../../lib/atoms';
import MapButton from '../../../common/Buttons/MapButton';
import Popover from '../../../common/Popover/Popover';
import SvgIcon from '../../../common/SvgIcon/SvgIcon';
import { AppTheme } from '../../../Theme/AppTheme';


const DashedLine = styled.div`
  width: 24px;
  height: 6px;
  background-color: #aa5d44;
  border-top: 2px dashed #733f2e;
  flex-shrink: 0;
  border-radius: 2px;
`;

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <Flex direction={'row'} gap={'2'} align={'center'}>
      <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: color, flexShrink: 0, border: '1px solid rgba(255,255,255,0.8)' }} />
      <Text>{label}</Text>
    </Flex>
  );
}

function LegendLineItem({ label }: { label: string }) {
  return (
    <Flex direction={'row'} gap={'2'} align={'center'}>
      <DashedLine aria-hidden="true" />
      <Text>{label}</Text>
    </Flex>
  );
}

const useLegendDefaultOpen = (isMobile: boolean | undefined, isLegendOpen: boolean) => {
  return React.useMemo(() => {
    if (isMobile === undefined) {
      return undefined;
    }
    return isMobile ? false : isLegendOpen;
  }, [isMobile, isLegendOpen]);
};

const LegendPopover = () => {
  const [isLegendOpen, setIsLegendOpen] = useAtom(legendOpen);
  const isMobile = useIsMobile();
  const defaultOpen = useLegendDefaultOpen(isMobile, isLegendOpen);

  if (isMobile === undefined) {
    return null;
  }
  return (
    <Popover.Root defaultOpen={defaultOpen} onOpenChange={setIsLegendOpen}>
      <Popover.Trigger asChild>
        <MapButton aria-label="Legend" tooltipPosition="right">
          <SvgIcon name="icon-legend" size={20}></SvgIcon>
        </MapButton>
      </Popover.Trigger>
      <Popover.Portal>
        <AppTheme>
          <Popover.Content
            className="PopoverContent"
            sideOffset={5}
            collisionPadding={{ top: 16 }}
            side={'right'}
            onInteractOutside={(ev) => {
              ev.preventDefault();
            }}
          >
            <Flex direction={'column'} gap={'4'}>
              <Heading as="h3" size={'4'}>
                Legend
              </Heading>
              <Flex direction={'column'} gap={'2'}>
                <LegendItem color="#ef4444" label="Discharging" />
                <LegendItem color="#f59e0b" label="Recent Discharge" />
                <LegendItem color="#22c55e" label="Not Discharging" />
                <LegendItem color="#9ca3af" label="Offline" />
                <LegendLineItem label="Downstream of Spill" />
              </Flex>
              <Text size={'1'} color={'gray'} as={'p'} style={{ fontStyle: 'italic' }}>
                Click any feature for more info
              </Text>
            </Flex>
            <Popover.CloseCornerButton aria-label="Close">
              <SvgIcon name="icon-x" size={24}></SvgIcon>
            </Popover.CloseCornerButton>
            <Popover.Arrow />
          </Popover.Content>
        </AppTheme>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default LegendPopover;
