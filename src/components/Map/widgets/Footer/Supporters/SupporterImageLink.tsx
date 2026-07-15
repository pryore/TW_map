import styled from '@emotion/styled';
import { Flex, Text } from '@radix-ui/themes';

import { useTheme } from '@/components/Theme/hooks/useTheme';

const Wrapper = styled(Flex)`
  @media (max-width: 640px) {
    flex-direction: row;
    align-items: center;
  }
`;

const Link = styled.a`
  pointer-events: all;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const SupporterText = styled(Text)`
  font-size: 11px;
  @media (max-width: 640px) {
    font-size: 10px;
  }
`;

export function SupporterImageLink() {
  const { currentTheme } = useTheme();
  return (
    <Wrapper
      direction="column"
      gap="1"
      px={{
        initial: '1',
        md: '2',
      }}
      pr="3"
      style={{ backgroundColor: currentTheme === 'light' ? 'white' : 'black' }}
    >
      <Link href="https://github.com/JonnyDawe/UK-Sewage-Map/" target="_blank" rel="noopener noreferrer">
        <SupporterText weight="bold" color="blue">
          Built from SewageMap.co.uk
        </SupporterText>
      </Link>
    </Wrapper>
  );
}
