import { Flex, Text, Heading, Badge } from '@radix-ui/themes';
import React from 'react';

// Using non-type import since Vite easily imports JSON
import windrushData from '@/data/windrush_upgrades.json';

interface WindrushUpgradeInfoProps {
    company: string;
    locationName: string;
}

export function WindrushUpgradeInfo({ company, locationName }: WindrushUpgradeInfoProps) {
    const isThamesWater = company.toLowerCase().includes('thames');

    const upgradeRecord = React.useMemo(() => {
        if (!isThamesWater || !locationName) return null;
        const normalize = (s: string) => s.toLowerCase().replace(/[-\s]/g, '');
        const lowerLocation = normalize(locationName);

        // Find the record where the location name contains the STW name from the spreadsheet
        return windrushData.find(record => {
            const stw = normalize(String(record.STW));
            return stw && lowerLocation.includes(stw);
        });
    }, [locationName, isThamesWater]);

    if (!isThamesWater) return <Flex p="3" align="center" justify="center"><Text color="gray">Upgrade data not available.</Text></Flex>;

    if (!upgradeRecord) return (
        <Flex p="3" direction="column" gap="2" align="center" justify="center">
            <Text color="gray" size="2">No proposed upgrades found for this specific site.</Text>
        </Flex>
    );

    return (
        <Flex direction="column" gap="3" p="2">
            <Heading size="3" mb="1" color="orange">{upgradeRecord.STW} - Proposed Upgrade</Heading>

            {upgradeRecord.Upgrade_type && upgradeRecord.Upgrade_type !== 'NaN' && (
                <Text size="2"><b>Upgrade:</b> {upgradeRecord.Upgrade_type}</Text>
            )}

            <Flex gap="3">
                <Box>
                    <Text size="2" color="gray" as="div">Original Deadline</Text>
                    <Text size="2" weight="bold">{upgradeRecord.Original_date ?? 'Unknown'}</Text>
                </Box>
                <Box>
                    <Text size="2" color="gray" as="div">Revised Deadline</Text>
                    <Text size="2" weight="bold">{upgradeRecord.Revised_date ?? 'Unknown'}</Text>
                </Box>
            </Flex>

            {upgradeRecord.Status === 'Delay' && (
                <Badge color="red" variant="soft" mt="1" style={{ alignSelf: 'flex-start' }}>
                    Delayed by {upgradeRecord.Delay_length} years
                </Badge>
            )}

            {((upgradeRecord['Spill Events 2024-2025'] || 0) > 0 || (upgradeRecord['Spill Hours 2024-2025'] || 0) > 0) && (
                <Flex direction="column" mt="2" p="2" style={{ backgroundColor: 'var(--amber-3)', borderRadius: '4px' }}>
                    <Text size="2" weight="bold" color="amber">Since Original Deadline:</Text>
                    <Text size="2">{upgradeRecord['Spill Events 2024-2025'] || 0} Spill Events</Text>
                    <Text size="2">{upgradeRecord['Spill Hours 2024-2025'] || 0} Total Hours</Text>
                </Flex>
            )}

            {upgradeRecord.Notes && upgradeRecord.Notes !== 'NaN' && (
                <Text size="2" mt="1" color="gray" style={{ fontStyle: 'italic' }}>
                    "{upgradeRecord.Notes}"
                </Text>
            )}
        </Flex>
    );
}

// Ensure Box is imported correctly from radix above! We used it in Flex.
const Box = ({ children, ...props }: any) => <div {...props}>{children}</div>;

export function StormOverflowReductionPlan({ company, locationName }: WindrushUpgradeInfoProps) {
    const isThamesWater = company.toLowerCase().includes('thames');

    const upgradeRecord = React.useMemo(() => {
        if (!isThamesWater || !locationName) return null;
        const normalize = (s: string) => s.toLowerCase().replace(/[-\s]/g, '');
        const lowerLocation = normalize(locationName);
        return windrushData.find(record => {
            const stw = normalize(String(record.STW));
            return stw && lowerLocation.includes(stw);
        });
    }, [locationName, isThamesWater]);

    if (!isThamesWater || !upgradeRecord || !upgradeRecord['Storm overflow reduction plan?']) {
        return (
            <Flex p="3" direction="column" gap="2" align="center" justify="center">
                <Text color="gray" size="2">No reduction plan data available for this site.</Text>
            </Flex>
        );
    }

    return (
        <Flex direction="column" gap="3" p="3">
            <Heading size="3" mb="1" color="blue">Storm Overflow Reduction Plan</Heading>
            <Text size="2" style={{ whiteSpace: 'pre-wrap' }}>
                {upgradeRecord['Storm overflow reduction plan?']}
            </Text>
        </Flex>
    );
}
