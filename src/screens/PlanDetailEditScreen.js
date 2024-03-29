import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Image,
    View,
    Modal,
    TouchableOpacity,
    TextInput,
    Platform,
    Dimensions,
    Alert,
    FlatList,
} from 'react-native';
import { useColorMode, useTheme, Box, Text, Pressable } from 'native-base';
import RNModal from 'react-native-modal';
import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import DraggableFlatList from 'react-native-draggable-flatlist';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { TimePicker } from 'react-native-simple-time-picker';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ActionButton } from '../components/ActionButton';
import { AddButton } from '../components/AddButton';
import { EditHeader } from '../components/Header';
import Loading from '../components/Loading';
import { formatDate, formatTime, formatStayTime } from '../utils/formatter';
import { spotImagesData } from '../data/spotImages';

import { useDispatch, useSelector } from 'react-redux';
import { selectToken } from '../redux/accountSlice';
import { updateUserTripDetailAsync, selectUserTrips } from '../redux/tripSlice';

const PlanDetailEditScreen = ({ navigation, route }) => {
    const { colorMode } = useColorMode();
    const { colors } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [spotModalVisible, setSpotModalVisible] = useState(false);
    const [stayTimeModalVisible, setStayTimeModalVisible] = useState(false);
    const [spotId, setSpotId] = useState('');
    const [spotImage, setSpotImage] = useState(spotImagesData[0].image);
    const [spotName, setSpotName] = useState('');
    const [spotNote, setSpotNote] = useState('');
    const [spotLoaction, setSpotLoaction] = useState('');
    const [spotAddress, setSpotAddress] = useState('');
    const [spotOpenTime, setSpotOpenTime] = useState('');
    const [spotPhone, setSpotPhone] = useState('');
    const [spotCity, setSpotCity] = useState('');
    const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
    const [stayTime, setStayTime] = useState({ hours: 0, minutes: 0 });
    const [dayIndex, setDayIndex] = useState(0);
    const [spotIndex, setSpotIndex] = useState(0);
    const [isAddingSpot, setIsAddingSpot] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isSpotFocused, setIsSpotFocused] = useState(false);
    const [isNoteFocused, setIsNoteFocused] = useState(false);

    const { trip } = route.params;
    const [tripData, setTripData] = useState(trip);
    const [startTimeRequired, setStartTimeRequired] = useState(trip.days_start_time[dayIndex] ? true : false);
    const [startTime, setStartTime] = useState(
        trip.days_start_time[dayIndex] ? new Date(trip.days_start_time[dayIndex]) : new Date()
    );

    const dispatch = useDispatch();
    const token = useSelector(selectToken);
    const userTrips = useSelector(selectUserTrips);

    const initialData = tripData.trips[0].map((item, index) => {
        return {
            order: index + 1,
            label: item.spot,
            spot_id: item.spot_id,
            image: item.image,
            type: item.type,
            stay_time: item.stay_time,
            note: item.note,
            location: item.location,
            address: item.address,
            open_time: item.open_time,
            phone: item.phone,
            city: item.city,
        };
    });
    const [dragData, setDragData] = useState(initialData);

    const showStartTimePicker = () => {
        setStartTimePickerVisibility(true);
    };
    const hideStartTimePicker = () => {
        setStartTimePickerVisibility(false);
    };
    const handleStartTimeConfirm = (time) => {
        setStartTime(time);
        hideStartTimePicker();
    };

    const handleDone = () => {
        dispatch(
            updateUserTripDetailAsync({
                token,
                tripId: tripData._id,
                trips: tripData.trips,
                days_start_time: tripData.days_start_time,
            })
        );
        const currentTrip = userTrips.find((el) => el._id === trip._id);
        navigation.navigate('PlanDetailScreen', { trip: currentTrip });
    };

    useEffect(() => {
        let newDragData = tripData.trips[dayIndex].map((item, index) => {
            return {
                order: index + 1,
                label: item.spot,
                spot_id: item.spot_id,
                image: item.image,
                type: item.type,
                stay_time: item.stay_time,
                note: item.note,
                location: item.location,
                address: item.address,
                open_time: item.open_time,
                phone: item.phone,
                city: item.city,
            };
        });
        setDragData(newDragData);
    }, [tripData]);

    const clearState = () => {
        setSpotName('');
        setSpotNote('');
        setStayTime({ hours: 0, minutes: 0 });
        setSpotImage(null);
        setSpotId('');
        setSpotLoaction('');
        setSpotAddress('');
        setSpotOpenTime('');
        setSpotPhone('');
        setSpotCity('');
    };

    const handleAddSpot = () => {
        if (spotName.length === 0) {
            alert('請輸入景點名稱( ˘･з･)');
            return;
        }
        let newData = tripData.trips.map((item, index) => {
            if (index === dayIndex) {
                return [
                    ...item,
                    {
                        spot: spotName,
                        spot_id: '',
                        image: spotImage,
                        stay_time: [stayTime.hours, stayTime.minutes],
                        note: spotNote,
                        location: [],
                        address: '',
                        open_time: '',
                        phone: '',
                        city: '',
                    },
                ];
            } else {
                return item;
            }
        });
        let newStartTime = tripData.days_start_time.map((item, index) => {
            if (index === dayIndex) {
                if (startTimeRequired) {
                    return startTime;
                } else {
                    return '';
                }
            } else {
                return item;
            }
        });
        setTripData({
            ...tripData,
            trips: [...newData],
            days_start_time: [...newStartTime],
        });
        clearState();
        setModalVisible(!modalVisible);
    };

    const handleEditSpot = (index) => {
        setModalVisible(!modalVisible);
        setSpotIndex(index);
        const currentSpot = tripData.trips[dayIndex][index];
        setSpotName(currentSpot.spot);
        setSpotNote(currentSpot.note);
        setStayTime({ hours: currentSpot.stay_time[0], minutes: currentSpot.stay_time[1] });
        setSpotImage(currentSpot.image);
        setSpotId(currentSpot.spot_id);
        setSpotLoaction(currentSpot.location);
        setSpotAddress(currentSpot.address);
        setSpotOpenTime(currentSpot.open_time);
        setSpotPhone(currentSpot.phone);
        setSpotCity(currentSpot.city);
    };

    const checkDeleteSpot = () => {
        Alert.alert('刪除景點', '確定要刪除景點嗎？ (☍﹏⁰)', [
            {
                text: '我再想想...',
                onPress: null,
                style: 'default',
            },
            {
                text: '刪除！',
                onPress: () => handleDeleteSpot(),
                style: 'destructive',
            },
        ]);
    };

    const handleDeleteSpot = () => {
        let newData = tripData.trips.map((item, index) => {
            if (index === dayIndex) {
                return item.filter((val, index) => index !== spotIndex);
            } else {
                return item;
            }
        });
        setTripData({
            ...tripData,
            trips: [...newData],
        });
        setModalVisible(!modalVisible);
    };

    const handleUpdateSpot = () => {
        if (spotName.length === 0) {
            alert('請輸入景點名稱( ˘･з･)');
            return;
        }
        let newData = tripData.trips.map((item, index) => {
            if (index === dayIndex) {
                let updatedSpot = item.map((val, valIndex) => {
                    if (valIndex === spotIndex) {
                        return {
                            ...val,
                            spot: spotName,
                            spot_id: spotId,
                            image: spotImage,
                            stay_time: [stayTime.hours, stayTime.minutes],
                            note: spotNote,
                            location: spotLoaction,
                            address: spotAddress,
                            open_time: spotOpenTime,
                            phone: spotPhone,
                            city: spotCity,
                        };
                    } else {
                        return val;
                    }
                });
                return updatedSpot;
            } else {
                return item;
            }
        });
        let newStartTime = tripData.days_start_time.map((item, index) => {
            if (index === dayIndex) {
                if (startTimeRequired) {
                    return startTime;
                } else {
                    return '';
                }
            } else {
                return item;
            }
        });
        setTripData({
            ...tripData,
            trips: [...newData],
            days_start_time: [...newStartTime],
        });
        clearState();
        setModalVisible(!modalVisible);
    };

    const handleOnDragEnd = (data) => {
        setDragData(data);
        let dragEndData = data.map((item, index) => {
            return {
                spot: item.label,
                spot_id: item.spot_id,
                image: item.image,
                stay_time: item.stay_time,
                note: item.note,
                location: item.location,
                address: item.address,
                open_time: item.open_time,
                phone: item.phone,
                city: item.city,
            };
        });
        let newData = tripData.trips.map((item, index) => {
            if (index === dayIndex) {
                return [...dragEndData];
            } else {
                return item;
            }
        });
        setTripData({
            ...tripData,
            trips: [...newData],
        });
    };

    const onChangeTab = (tabIndex) => {
        setDayIndex(tabIndex);
        setStartTimeRequired(tripData.days_start_time[tabIndex] ? true : false);
        setStartTime(tripData.days_start_time[tabIndex] ? new Date(tripData.days_start_time[tabIndex]) : new Date());
        setDragData(
            tripData.trips[tabIndex].map((item, index) => {
                return {
                    order: index + 1,
                    label: item.spot,
                    spot_id: item.spot_id,
                    image: item.image,
                    type: item.type,
                    stay_time: item.stay_time,
                    note: item.note,
                    location: item.location,
                    address: item.address,
                    open_time: item.open_time,
                    phone: item.phone,
                    city: item.city,
                };
            })
        );
    };

    const renderSpotImageItem = ({ item }) => {
        return (
            <Pressable
                style={styles.coverImageBox}
                _dark={{ bg: colors.dark[200] }}
                _light={{ bg: colors.dark[500] }}
                onPress={() => setSpotImage(item.image)}
            >
                <Box style={styles.spotImageNull}>
                    <MaterialCommunityIcons name="cancel" size={48} color={colors.dark[400]} />
                </Box>
                <Image style={styles.avatar} source={{ uri: item.image }} />
                {item.image === spotImage && (
                    <Box style={styles.avatarMask}>
                        <MaterialIcon name="check-circle-outline" size={45} color="#fff" />
                    </Box>
                )}
            </Pressable>
        );
    };

    const renderTabBar = (props) => (
        <ScrollableTabBar
            {...props}
            style={{
                borderBottomWidth: 0,
                height: 45,
                backgroundColor: colorMode === 'dark' ? colors.dark[100] : '#fff',
            }}
            tabsContainerStyle={{
                justifyContent: 'flex-start',
            }}
        />
    );

    const renderItem = ({ item, index, drag, isActive }) => (
        <Pressable
            style={[styles.planBox, { width: Dimensions.get('window').width - 48 }]}
            _dark={{ bg: colors.dark[100] }}
            _light={{ bg: '#fff' }}
            onLongPress={drag}
            onPress={() => {
                setIsAddingSpot(false);
                handleEditSpot(index);
            }}
        >
            <MaterialCommunityIcons
                name="drag-vertical"
                size={24}
                color={colorMode === 'dark' ? colors.dark[200] : colors.dark[500]}
            />
            <Box style={[styles.planBoxDivider, { backgroundColor: colors.secondary[200] }]}></Box>
            {item.image ? (
                <Image source={{ uri: item.image }} style={styles.planBoxImage} resizeMode="cover" />
            ) : (
                <Box style={styles.planBoxImage} _dark={{ bg: colors.dark[200] }} _light={{ bg: colors.dark[500] }}>
                    <MaterialCommunityIcons name="cancel" size={24} color={colors.dark[400]} />
                </Box>
            )}
            <Box
                style={[
                    styles.planBoxInfo,
                    {
                        width: item.image ? Dimensions.get('window').width - 190 : Dimensions.get('window').width - 160,
                    },
                ]}
            >
                <Text style={styles.planSightName}>{item?.label}</Text>
                <Box style={styles.planStayTime}>
                    <MaterialCommunityIcons
                        name="clock-time-four"
                        size={14}
                        color={colors.dark[400]}
                        style={{ marginRight: 4, lineHeight: 16 }}
                    />
                    <Text color={colors.dark[300]} style={{ lineHeight: 16 }}>
                        {formatStayTime(item.stay_time[0], item.stay_time[1])}
                    </Text>
                </Box>
                {item.note.length !== 0 && (
                    <Box style={styles.planNote}>
                        <MaterialCommunityIcons
                            name="clipboard-text"
                            size={14}
                            color={colors.dark[400]}
                            style={{ marginRight: 4, lineHeight: 16 }}
                        />
                        <Text color={colors.dark[300]} style={{ lineHeight: 16 }}>
                            {item.note}
                        </Text>
                    </Box>
                )}
            </Box>
            <Box style={{ marginLeft: 'auto' }}>
                <MaterialIcon name="edit" size={24} color={colors.dark[400]} />
            </Box>
        </Pressable>
    );

    const renderListFooter = () => (
        <AddButton
            size={'medium'}
            style={styles.addPlanBox}
            onPress={() => {
                setIsAddingSpot(true);
                clearState();
                setModalVisible(!modalVisible);
            }}
        />
    );

    return (
        <Box style={styles.container} _dark={{ bg: colors.dark[50] }} _light={{ bg: colors.dark[600] }}>
            <Box style={styles.topWrapper} _dark={{ bg: colors.dark[100] }} _light={{ bg: '#fff' }}>
                <EditHeader navigation={navigation} title={'編輯行程'} onPressDone={handleDone} />
                <Box style={styles.infoWrapper}>
                    {tripData.cover_image ? (
                        <Image source={{ uri: trip.cover_image }} style={styles.introImage} resizeMode="cover" />
                    ) : (
                        <Box
                            style={styles.introImage}
                            _dark={{ bg: colors.dark[200] }}
                            _light={{ bg: colors.dark[500] }}
                        />
                    )}
                    <Box style={[styles.introBox, { width: Dimensions.get('window').width - 216 }]}>
                        <Text
                            style={styles.introName}
                            color={colorMode === 'dark' ? colors.dark[600] : colors.dark[200]}
                        >
                            {tripData.name}
                        </Text>
                        {tripData.start_date ? (
                            <Text style={styles.introDate} color={colors.dark[300]}>
                                {formatDate(tripData.start_date)}-{formatDate(tripData.end_date)}
                            </Text>
                        ) : (
                            <Text style={styles.introDate} color={colors.dark[300]}>
                                {tripData.duration}天
                            </Text>
                        )}
                        <Box style={styles.groupWrapper}>
                            <Image
                                source={{ uri: tripData.owner.photo }}
                                style={styles.ownerAvatar}
                                resizeMode="cover"
                            />
                            <Box style={styles.usersWrapper}>
                                {tripData.shared_users.length !== 0 &&
                                    tripData.shared_users.map((item, index) => {
                                        return (
                                            <Image
                                                source={{ uri: item.photo }}
                                                style={styles.sharedAvatar}
                                                resizeMode="cover"
                                                key={item._id}
                                            />
                                        );
                                    })}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <ScrollableTabView
                initialPage={0}
                renderTabBar={renderTabBar}
                onChangeTab={({ i, ref }) => onChangeTab(i)}
                tabBarUnderlineStyle={{
                    backgroundColor: colors.secondary[200],
                    position: 'absolute',
                    bottom: 0,
                    height: 3,
                }}
                tabBarTextStyle={{ fontSize: 14 }}
                tabBarActiveTextColor={colorMode === 'dark' ? colors.dark[600] : colors.dark[200]}
                tabBarInactiveTextColor={colorMode === 'dark' ? colors.dark[600] : colors.dark[200]}
            >
                {tripData.trips.map((item, index) => {
                    const firstDate = new Date(tripData.start_date);
                    const currentDate = formatDate(firstDate.setDate(firstDate.getDate() + index)).slice(5, 10);

                    return (
                        <Box style={styles.detailWrapper} tabLabel={`Day ${index + 1}`} key={index}>
                            <Box style={styles.detailHeader}>
                                <Text
                                    style={styles.dayText}
                                    color={colorMode === 'dark' ? colors.dark[600] : colors.dark[200]}
                                >
                                    {`Day ${index + 1}`}
                                </Text>
                                {tripData.start_date && (
                                    <Text style={styles.dateText} color={colors.dark[400]}>
                                        {currentDate}
                                    </Text>
                                )}
                            </Box>
                            <DraggableFlatList
                                data={dragData}
                                renderItem={renderItem}
                                keyExtractor={(item, index) => index.toString()}
                                showsVerticalScrollIndicator={false}
                                onDragEnd={({ data }) => handleOnDragEnd(data)}
                                ListFooterComponent={renderListFooter}
                            />
                        </Box>
                    );
                })}
            </ScrollableTabView>
            {modalVisible && (
                <Box
                    style={{
                        backgroundColor: colorMode === 'dark' ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.25)',
                        position: 'absolute',
                        width: Dimensions.get('window').width,
                        height: Dimensions.get('window').height,
                    }}
                ></Box>
            )}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View
                    style={[
                        styles.modalView,
                        {
                            backgroundColor: colorMode === 'dark' ? colors.dark[100] : '#fff',
                        },
                    ]}
                >
                    <Box
                        style={[
                            styles.modalHeader,
                            {
                                borderBottomColor: colorMode === 'dark' ? colors.dark[200] : colors.dark[500],
                            },
                        ]}
                    >
                        <Text style={styles.modalHeaderText}>{isAddingSpot ? '新增景點' : '編輯景點'}</Text>
                        <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(!modalVisible)}>
                            <MaterialIcon name="close" size={24} color={colorMode === 'dark' ? '#fff' : '#484848'} />
                        </TouchableOpacity>
                    </Box>
                    <Box style={styles.imageWrapper} _dark={{ bg: colors.dark[200] }} _light={{ bg: colors.dark[500] }}>
                        {spotImage !== '' && <Image source={{ uri: spotImage }} style={styles.image} />}
                        {spotId === '' && (
                            <Pressable style={styles.imageMask} onPress={() => setSpotModalVisible(!spotModalVisible)}>
                                <MaterialIcon name="edit" size={60} color={colors.dark[600]} />
                            </Pressable>
                        )}
                    </Box>
                    <Box style={styles.modalContent}>
                        <Box style={styles.optionWrapper}>
                            <Text
                                style={styles.modalLabel}
                                color={colorMode === 'dark' ? colors.dark[600] : colors.dark[200]}
                            >
                                行程名稱
                            </Text>
                            <Box
                                style={{
                                    width: Dimensions.get('window').width - 130,
                                    borderBottomWidth: 1,
                                    borderBottomColor: colorMode === 'dark' ? colors.dark[300] : colors.dark[500],
                                }}
                            >
                                <Text color={colors.dark[300]}>{tripData.name}</Text>
                            </Box>
                        </Box>
                        <Box style={styles.optionWrapper}>
                            <Text
                                style={styles.modalLabel}
                                color={colorMode === 'dark' ? colors.dark[600] : colors.dark[200]}
                            >
                                景點名稱
                            </Text>
                            <Box
                                style={{
                                    width: Dimensions.get('window').width - 130,
                                    borderBottomWidth: isSpotFocused ? 1.2 : 1,
                                    borderBottomColor: isSpotFocused
                                        ? colors.primary[100]
                                        : colorMode === 'dark'
                                        ? colors.dark[300]
                                        : colors.dark[500],
                                }}
                            >
                                <TextInput
                                    placeholder="輸入景點名稱"
                                    placeholderTextColor={colorMode === 'dark' ? colors.dark[200] : colors.dark[400]}
                                    style={[
                                        { color: colorMode === 'dark' ? colors.dark[600] : colors.dark[200] },
                                        spotId && { color: colors.dark[300] },
                                    ]}
                                    value={spotName}
                                    onChangeText={(text) => setSpotName(text)}
                                    returnKeyType="done"
                                    maxLength={20}
                                    onBlur={() => setIsSpotFocused(false)}
                                    onFocus={() => setIsSpotFocused(true)}
                                    editable={spotId ? false : true}
                                />
                            </Box>
                        </Box>
                        <Box style={styles.optionWrapper}>
                            <Text
                                style={styles.modalLabel}
                                color={colorMode === 'dark' ? colors.dark[600] : colors.dark[200]}
                            >
                                備註(選填)
                            </Text>
                            <Box
                                style={{
                                    width: Dimensions.get('window').width - 140,
                                    borderBottomWidth: isNoteFocused ? 1.2 : 1,
                                    borderBottomColor: isNoteFocused
                                        ? colors.primary[100]
                                        : colorMode === 'dark'
                                        ? colors.dark[300]
                                        : colors.dark[500],
                                }}
                            >
                                <TextInput
                                    placeholder="輸入備註"
                                    placeholderTextColor={colorMode === 'dark' ? colors.dark[200] : colors.dark[400]}
                                    style={{ color: colorMode === 'dark' ? colors.dark[600] : colors.dark[200] }}
                                    value={spotNote}
                                    onChangeText={(text) => setSpotNote(text)}
                                    returnKeyType="done"
                                    onBlur={() => setIsNoteFocused(false)}
                                    onFocus={() => setIsNoteFocused(true)}
                                />
                            </Box>
                        </Box>
                        <Box style={styles.optionWrapper}>
                            <Pressable
                                style={{ marginRight: 15 }}
                                onPress={() => setStartTimeRequired(!startTimeRequired)}
                            >
                                {startTimeRequired ? (
                                    <MaterialCommunityIcons
                                        name="checkbox-marked"
                                        size={24}
                                        color={colors.primary[200]}
                                    />
                                ) : (
                                    <MaterialCommunityIcons
                                        name="checkbox-blank"
                                        size={24}
                                        color={colorMode === 'dark' ? colors.dark[200] : colors.dark[500]}
                                    />
                                )}
                            </Pressable>
                            <Box>
                                <Text
                                    style={styles.modalLabel}
                                    color={colorMode === 'dark' ? colors.dark[600] : colors.dark[200]}
                                >
                                    第一個行程開始時間
                                </Text>
                                <Text style={{ fontSize: 11 }} color={colors.dark[300]}>
                                    （顯示各項行程時間點）
                                </Text>
                            </Box>
                            <Pressable
                                _dark={{ bg: colors.dark[200] }}
                                _light={{ bg: colors.secondary[50] }}
                                style={styles.optionSelectBox}
                                onPress={() => showStartTimePicker()}
                            >
                                <Text color={colorMode === 'dark' ? colors.dark[600] : colors.dark[200]}>
                                    {formatTime(startTime)}
                                </Text>
                            </Pressable>
                        </Box>
                        <Box style={styles.optionWrapper}>
                            <Text
                                style={styles.modalLabel}
                                color={colorMode === 'dark' ? colors.dark[600] : colors.dark[200]}
                            >
                                加入天數
                            </Text>
                            <Pressable
                                _dark={{ bg: colors.dark[200] }}
                                _light={{ bg: colors.secondary[50] }}
                                style={styles.optionSelectBox}
                                onPress={null}
                            >
                                <Text style={{ color: '#969696' }}>Day {dayIndex + 1}</Text>
                            </Pressable>
                        </Box>
                        <Box style={styles.optionWrapper}>
                            <Text
                                style={styles.modalLabel}
                                color={colorMode === 'dark' ? colors.dark[600] : colors.dark[200]}
                            >
                                停留時間
                            </Text>
                            <Pressable
                                _dark={{ bg: colors.dark[200] }}
                                _light={{ bg: colors.secondary[50] }}
                                style={styles.optionSelectBox}
                                onPress={() => SheetManager.show('stayTime_sheet')}
                            >
                                <Text color={colorMode === 'dark' ? colors.dark[600] : colors.dark[200]}>
                                    {stayTime.hours}時{stayTime.minutes}分
                                </Text>
                            </Pressable>
                        </Box>
                    </Box>
                    <ActionButton
                        text={isAddingSpot ? '新增' : '更新'}
                        style={{ marginTop: Platform.OS === 'ios' ? 60 : 40 }}
                        onPress={() => (isAddingSpot ? handleAddSpot() : handleUpdateSpot())}
                    />
                    {!isAddingSpot && (
                        <Pressable
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 20,
                                paddingRight: 5,
                            }}
                            onPress={() => checkDeleteSpot()}
                        >
                            <MaterialCommunityIcons name="delete-outline" size={24} color={'#DD9193'} />
                            <Text style={{ marginLeft: 5, fontSize: 16 }} color={'#DD9193'}>
                                刪除
                            </Text>
                        </Pressable>
                    )}
                </View>
                <DateTimePickerModal
                    date={startTime}
                    isVisible={isStartTimePickerVisible}
                    mode="time"
                    onConfirm={handleStartTimeConfirm}
                    onCancel={hideStartTimePicker}
                />
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={stayTimeModalVisible}
                    onRequestClose={() => {
                        setStayTimeModalVisible(!stayTimeModalVisible);
                    }}
                ></Modal>
                <ActionSheet id="stayTime_sheet">
                    <Box
                        style={styles.stayTimeSheet}
                        _dark={{ bg: colors.dark[100] }}
                        _light={{ bg: colors.dark[600] }}
                    >
                        <TimePicker
                            hoursUnit="時"
                            minutesUnit="分"
                            value={stayTime}
                            onChange={(value) => setStayTime(value)}
                            textColor={colorMode === 'dark' ? colors.dark[600] : colors.dark[200]}
                        />
                    </Box>
                </ActionSheet>
                <RNModal
                    isVisible={spotModalVisible}
                    style={{ alignItems: 'center' }}
                    onBackdropPress={() => setSpotModalVisible(!spotModalVisible)}
                >
                    <Box style={styles.coverModalView} _dark={{ bg: colors.dark[100] }} _light={{ bg: '#fff' }}>
                        <Text
                            style={{ fontSize: 16, fontWeight: '500', paddingBottom: 10 }}
                            color={colorMode === 'dark' ? colors.dark[600] : colors.dark[200]}
                        >
                            - 請從下列選項選擇 -
                        </Text>
                        <FlatList
                            data={spotImagesData}
                            renderItem={renderSpotImageItem}
                            keyExtractor={(item, index) => index}
                            horizontal={false}
                            numColumns={2}
                            columnWrapperStyle={{ justifyContent: 'space-between' }}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 60 }}
                        />
                        <Box style={styles.coverModalActionWrapper}>
                            <Pressable onPress={() => setSpotModalVisible(!spotModalVisible)}>
                                <Text
                                    style={styles.coverModalActionText}
                                    color={colorMode === 'dark' ? colors.dark[400] : colors.dark[300]}
                                >
                                    取消
                                </Text>
                            </Pressable>
                            <Pressable onPress={() => setSpotModalVisible(!spotModalVisible)}>
                                <Text style={styles.coverModalActionText} color={colors.primary[200]}>
                                    完成
                                </Text>
                            </Pressable>
                        </Box>
                    </Box>
                </RNModal>
            </Modal>
            {loading && <Loading />}
        </Box>
    );
};

export default PlanDetailEditScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    infoWrapper: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        paddingTop: 12,
        paddingHorizontal: 16,
    },
    introBox: {
        marginLeft: 12,
    },
    introImage: {
        width: 172,
        height: 95,
        borderRadius: 5,
    },
    introName: {
        fontSize: 16,
        fontWeight: '500',
    },
    introDate: {
        fontSize: Platform.OS === 'ios' ? 14 : 12,
        color: '#969696',
    },
    groupWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    usersWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 13,
    },
    ownerAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#fff',
    },
    sharedAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        marginLeft: -10,
    },
    addDayBtn: {
        width: 36,
        height: 20,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 9,
    },
    detailWrapper: {
        paddingHorizontal: 16,
        alignItems: 'center',
        paddingBottom: 80,
    },
    detailHeader: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        paddingTop: 20,
        marginBottom: 20,
    },
    dayText: {
        fontSize: 16,
        fontWeight: '500',
    },
    dateText: {
        fontSize: 11,
        color: '#969696',
        marginLeft: 10,
    },
    planBox: {
        paddingVertical: 12,
        paddingLeft: 6,
        paddingRight: 16,
        borderRadius: 5,
        marginBottom: 10,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    planBoxDivider: {
        width: 3,
        height: 44,
        marginRight: 10,
    },
    planBoxImage: {
        width: 36,
        height: 36,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    planBoxInfo: {
        marginLeft: 10,
    },
    addPlanBox: {
        marginTop: 20,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: 200,
    },
    planSightName: {
        fontSize: 16,
        fontWeight: '500',
    },
    planStayTime: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    planNote: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 4,
    },
    modalView: {
        width: '100%',
        height: Platform.OS === 'ios' ? '95%' : '99%',
        marginTop: 'auto',
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    modalHeader: {
        width: '100%',
        height: 45,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    modalHeaderText: {
        fontSize: 18,
        fontWeight: '500',
    },
    modalClose: {
        position: 'absolute',
        right: 0,
    },
    modalContent: {
        marginTop: 10,
    },
    imageWrapper: {
        width: 340,
        height: 190,
        borderRadius: 5,
        marginTop: 10,
    },
    image: {
        width: 340,
        height: 190,
        borderRadius: 5,
    },
    imageMask: {
        position: 'absolute',
        width: 340,
        height: 190,
        borderRadius: 5,
        backgroundColor: 'rgba(72, 72, 72, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionWrapper: {
        height: 30,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 18,
    },
    optionSelectBox: {
        width: 120,
        height: 30,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 'auto',
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginRight: 20,
    },
    stayTimeSheet: {
        width: '100%',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 40,
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
    },
    timePickerBox: {
        width: '100%',
        height: '45%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: 'auto',
    },
    timePickerConfirmBtn: {
        width: '100%',
        height: 50,
        fontSize: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    timePickerCancelBtn: {
        width: '100%',
        height: 50,
        fontSize: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    coverModalView: {
        width: 340,
        height: 395,
        borderRadius: 10,
        paddingVertical: 30,
        alignItems: 'center',
    },
    coverModalActionWrapper: {
        width: 220,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 'auto',
        paddingTop: 10,
    },
    coverModalActionText: {
        fontSize: 16,
        fontWeight: '500',
    },
    coverImageBox: {
        margin: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    spotImageNull: {
        position: 'absolute',
        width: 145,
        height: 92,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 145,
        height: 92,
        borderRadius: 5,
    },
    avatarMask: {
        position: 'absolute',
        width: 145,
        height: 92,
        borderRadius: 5,
        backgroundColor: 'rgba(72, 72, 72, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
