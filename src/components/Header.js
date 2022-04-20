import React from 'react';
import { StyleSheet, Image } from 'react-native';
import { useColorMode, useTheme, Box, Text, Pressable } from 'native-base';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const PlannerHeader = ({ onPress }) => {
    const { colorMode } = useColorMode();
    const { colors } = useTheme();

    return (
        <Box style={styles.headerWrapper}>
            <Pressable style={styles.headerLeft}></Pressable>
            <Box style={styles.headerCenter}>
                <Text style={styles.headerTitle} ccolor={colorMode === 'dark' ? colors.dark[600] : colors.dark[200]}>
                    行程
                </Text>
            </Box>
            <Pressable style={styles.headerRight} onPress={onPress}>
                <Text
                    style={styles.headerRightText}
                    ccolor={colorMode === 'dark' ? colors.dark[600] : colors.dark[200]}
                >
                    編輯
                </Text>
            </Pressable>
        </Box>
    );
};

const PlanDetailHeader = ({ navigation }) => {
    const { colorMode } = useColorMode();
    const { colors } = useTheme();

    return (
        <Box
            style={[
                styles.headerWrapper,
                {
                    borderBottomWidth: 1,
                    borderBottomColor: colorMode === 'dark' ? colors.dark[200] : colors.dark[500],
                },
            ]}
        >
            <Pressable style={styles.headerLeft} onPress={() => navigation.goBack()}>
                {colorMode === 'dark' ? (
                    <Image source={require('../../assets/icons/ic_goback_dark.png')} style={styles.headerLeft} />
                ) : (
                    <Image source={require('../../assets/icons/ic_goback.png')} style={styles.headerLeft} />
                )}
            </Pressable>
            <Box style={styles.headerCenter}>
                <Text style={styles.headerTitle} ccolor={colorMode === 'dark' ? colors.dark[600] : colors.dark[200]}>
                    行程細節
                </Text>
            </Box>
            <Pressable style={styles.headerRight}>
                <MaterialIcon
                    name="more-horiz"
                    size={24}
                    color={colorMode == 'dark' ? colors.dark[600] : colors.dark[200]}
                />
            </Pressable>
        </Box>
    );
};

const GoBackHeader = ({ navigation, title }) => {
    const { colorMode } = useColorMode();
    const { colors } = useTheme();

    return (
        <Box style={styles.headerWrapper}>
            <Pressable style={styles.headerLeft} onPress={() => navigation.goBack()}>
                {colorMode === 'dark' ? (
                    <Image source={require('../../assets/icons/ic_goback_dark.png')} style={styles.headerLeft} />
                ) : (
                    <Image source={require('../../assets/icons/ic_goback.png')} style={styles.headerLeft} />
                )}
            </Pressable>
            <Box style={styles.headerCenter}>
                <Text style={styles.headerTitle} ccolor={colorMode === 'dark' ? colors.dark[600] : colors.dark[200]}>
                    {title}
                </Text>
            </Box>
            <Pressable style={{ width: 24 }}></Pressable>
        </Box>
    );
};

const ProfileEditHeader = ({ navigation, onPressDone }) => {
    const { colorMode } = useColorMode();
    const { colors } = useTheme();

    return (
        <Box
            style={[
                styles.headerWrapper,
                {
                    borderBottomWidth: 1,
                    borderBottomColor: colorMode === 'dark' ? colors.dark[200] : colors.dark[500],
                },
            ]}
        >
            <Pressable onPress={() => navigation.goBack()}>
                <Text style={styles.headerRightText} color={colorMode === 'dark' ? colors.dark[200] : colors.dark[400]}>
                    取消
                </Text>
            </Pressable>
            <Box style={styles.headerCenter}>
                <Text style={styles.headerTitle} ccolor={colorMode === 'dark' ? colors.dark[600] : colors.dark[200]}>
                    編輯個人檔案
                </Text>
            </Box>
            <Pressable style={styles.headerRight} onPress={onPressDone}>
                <Text style={styles.headerRightText} color={colorMode === 'dark' ? colors.dark[600] : colors.dark[200]}>
                    完成
                </Text>
            </Pressable>
        </Box>
    );
};

export { PlannerHeader, PlanDetailHeader, GoBackHeader, ProfileEditHeader };

const styles = StyleSheet.create({
    headerWrapper: {
        width: '100%',
        height: 48,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        marginTop: 44,
    },
    headerLeft: {
        width: 24,
        height: 24,
    },
    headerCenter: {
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    headerTitle: {
        fontSize: 18,
    },
    headerRightText: {
        fontSize: 14,
    },
    headerRightIcon: {},
});
