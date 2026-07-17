import styled from '@emotion/styled';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Box, Button, Flex, Heading, Text } from '@radix-ui/themes';
import React from 'react';
import Wave from 'react-wavify';

import { useOnFirstVisit } from '../../lib/hooks/useOnUserFirstVisit';
import { usePrefersReducedMotion } from '../../lib/hooks/usePrefersReducedMotion';
import MapButton from '../common/Buttons/MapButton';
import Dialog from '../common/Dialog/Dialog';
import { ModalHeader } from '../common/Dialog/DialogTitle';
import SvgIcon from '../common/SvgIcon/SvgIcon';
import { Link } from '../common/Text';
import TextInfoList from '../TextInfoList/TextInfoList';
import { AppTheme } from '../Theme/AppTheme';

const BackgroundWave = styled(Wave)`
  position: absolute;
  width: 600px;
  bottom: -40px;
  right: 0;
`;

const InformationModal = () => {
  const [open, setOpen] = React.useState(false);

  const handleOpenOnFirstVisit = React.useCallback(() => {
    setOpen(true);
  }, []);
  useOnFirstVisit(handleOpenOnFirstVisit);

  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <MapButton aria-label="Information" tooltipPosition="left">
          <SvgIcon name="icon-info" size={24}></SvgIcon>
        </MapButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <AppTheme>
          <Dialog.Overlay />
          <Dialog.Content>
            <Dialog.Title>
              <VisuallyHidden>Information about this application</VisuallyHidden>
            </Dialog.Title>
            <Dialog.Description>
              <VisuallyHidden>
                Information and a description of the methodology for this map application that
                displays sewage discharge into rivers. It also includes an overview of the model for
                tracing waste downstream.
              </VisuallyHidden>
            </Dialog.Description>

            <Box position={'relative'} p={'5'} style={{ overflow: 'hidden' }}>
              <BackgroundWave
                fill="var(--wave-blue)"
                paused={prefersReducedMotion}
                options={{
                  height: 25,
                  amplitude: 25,
                  speed: 0.175,
                  points: 5,
                }}
              />
              <Box position={'relative'}>
                <ModalHeader title="Information" subTitle="Windrush Catchment Sewage Map" level={2}></ModalHeader>

                <Flex direction={'column'} gap={'4'} mb="4">
                  <Text>
                    This map focuses on the <strong>Windrush Catchment</strong> and the performance of Thames Water's Sewage Treatment Works (STWs) within this region.
                  </Text>
                  
                  <TextInfoList icon={<SvgIcon name="icon-water-info" size={48}></SvgIcon>}>
                    <Heading as={'h3'} size={'4'}>
                      Tracking Upgrades & Delays
                    </Heading>
                    <Text>
                      We are closely tracking Thames Water's promised infrastructure upgrades, specifically their <strong>Flow to Full Treatment (FFT) compliance</strong> targets and their <strong>Storm Overflow Reduction Plans</strong>. Crucially, this map visualizes the alarming delays to these vital upgrades, making it clear exactly how far behind schedule the water company is operating.
                    </Text>
                  </TextInfoList>

                  <TextInfoList icon={<SvgIcon name="icon-waste-water" size={48}></SvgIcon>}>
                    <Heading as={'h3'} size={'4'}>
                      The Impact of Delays
                    </Heading>
                    <Text>
                      The environmental cost of these missed deadlines is severe. By clicking on the individual treatment works, you can see exactly <strong>how many spill events and total hours of untreated sewage discharges</strong> have occurred since their original upgrade deadlines passed. The data reveals a concerning trend of continued pollution while essential infrastructure improvements are pushed back to future planning periods (AMP8 and beyond).
                    </Text>
                  </TextInfoList>

                  <Text mt={'2'}>
                    This specific Windrush Catchment view was adapted from the national <Link href={'https://github.com/JonnyDawe/UK-Sewage-Map/'}>SewageMap.co.uk</Link> project (created by Alex Lipp & Jonny Dawe) to provide focused, regional accountability for the Windrush river system.
                  </Text>
                </Flex>
                <Flex justify={'end'} direction={'row'} pt={'2'}>
                  <Dialog.Close asChild>
                    <Button size="3" variant="solid">
                      Lets Go!
                    </Button>
                  </Dialog.Close>
                </Flex>
              </Box>
            </Box>

            <Dialog.CloseCornerButton aria-label="Close">
              <SvgIcon name="icon-x" size={24}></SvgIcon>
            </Dialog.CloseCornerButton>
          </Dialog.Content>
        </AppTheme>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default InformationModal;
