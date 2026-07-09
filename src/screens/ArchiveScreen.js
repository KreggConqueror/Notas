import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ArchiveScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Archivar</Text>
        </View>
    );
};

export default ArchiveScreen;

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