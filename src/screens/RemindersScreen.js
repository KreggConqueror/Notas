import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RemindersScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Recordatorios</Text>
        </View>
    );
};

export default RemindersScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        color: '#333',
    },
});