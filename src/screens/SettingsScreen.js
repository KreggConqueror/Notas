import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Switch, TouchableOpacity, StyleSheet, Platform, }
    from 'react-native';
import { Appbar, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const SettingsScreen = ({ navigation }) => {
    const [addToEnd, setAddToEnd] = useState(false);
    const [reminderTimes, setReminderTimes] = useState({
        morning: '8:00 a.m.',
        afternoon: '1:00 p.m.',
        evening: '6:00 p.m.',
    });

    const [timePickerVisible, setTimePickerVisible] = useState(false);
    const [timePickerTarget, setTimePickerTarget] = useState(null);
    const [tempTime, setTempTime] = useState(new Date());

    useEffect(() => {
        const loadSettings = async () => {
            const savedAddToEnd = await AsyncStorage.getItem('addToEnd');
            const savedReminderTimes = await AsyncStorage.getItem('reminderTimes');

            if (savedAddToEnd !== null) setAddToEnd(JSON.parse(savedAddToEnd));
            if (savedReminderTimes !== null) setReminderTimes(JSON.parse(savedReminderTimes));
        };

        loadSettings();
    }, []);

    const updateSetting = async (key, value) => {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    };

    const openTimePicker = (key) => {
        setTimePickerTarget(key);
        const [h, m, ampm] = reminderTimes[key].split(/[:\s]/);
        const hour = ampm === 'p.m.' ? (parseInt(h) % 12) + 12 : parseInt(h);
        setTempTime(new Date(0, 0, 0, hour, parseInt(m)));
        setTimePickerVisible(true);
    };

    const handleTimeChange = (event, selectedDate) => {
        if (event?.type === 'set') {
            const newTime = selectedDate || tempTime;
            const h = newTime.getHours();
            const m = newTime.getMinutes().toString().padStart(2, '0');
            const ampm = h >= 12 ? 'p.m.' : 'a.m.';
            const hourFormatted = ((h + 11) % 12 + 1).toString();
            const finalTime = `${hourFormatted}:${m} ${ampm}`;

            const updatedTimes = {
                ...reminderTimes,
                [timePickerTarget]: finalTime,
            };

            setReminderTimes(updatedTimes);
            updateSetting('reminderTimes', updatedTimes);
        }

        setTimePickerVisible(false);
    };

    return (
        <>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Configuración" />
            </Appbar.Header>

            <ScrollView style={styles.container}>
                <Text style={styles.sectionTitle}>Opciones de visualización</Text>

                <OptionSwitch
                    label="Agregar los nuevos elementos al final"
                    value={addToEnd}
                    onValueChange={(v) => {
                        setAddToEnd(v);
                        updateSetting('addToEnd', v);
                    }}
                />

                {/*Comentario*/}


                {/*<Divider style={styles.divider} />
                <Text style={styles.sectionTitle}>Ajustes predet. de recordatorios</Text>
                {Object.keys(reminderTimes).map((key) => (
                    <OptionWithValue
                        key={key}
                        label={
                            key === 'morning'
                                ? 'Por la mañana'
                                : key === 'afternoon'
                                    ? 'Por la tarde'
                                    : 'Por la noche'
                        }
                        value={reminderTimes[key]}
                        onPress={() => openTimePicker(key)}
                    />
                ))}*/}
            </ScrollView>

            {timePickerVisible && (
                <DateTimePicker
                    value={tempTime}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                />
            )}
        </>
    );
};

const OptionSwitch = ({ label, value, onValueChange }) => (
    <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Switch value={value} onValueChange={onValueChange} />
    </View>
);

const OptionWithValue = ({ label, value, onPress }) => (
    <TouchableOpacity style={styles.row} onPress={onPress}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    label: {
        fontSize: 15,
        flex: 1,
    },
    value: {
        fontSize: 15,
        color: '#666',
    },
    divider: {
        marginVertical: 12,
    },
});

export default SettingsScreen;
