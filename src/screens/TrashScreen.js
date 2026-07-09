import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect, DrawerActions } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const TrashScreen = () => {
    const [deletedNotes, setDeletedNotes] = useState([]);
    const [selectedNotes, setSelectedNotes] = useState([]);
    const navigation = useNavigation();

    useFocusEffect(
        useCallback(() => {
            loadDeletedNotes();
        }, [])
    );

    const loadDeletedNotes = async () => {
        try {
            const storedNotes = await AsyncStorage.getItem('notes');
            const notes = storedNotes ? JSON.parse(storedNotes) : [];
            const trash = notes.filter(note => note.deleted);
            setDeletedNotes(trash);
        } catch (error) {
            console.error('Error al cargar notas eliminadas:', error);
        }
    };

    const updateNotes = async (updatedList) => {
        await AsyncStorage.setItem('notes', JSON.stringify(updatedList));
        setDeletedNotes(updatedList.filter(note => note.deleted));
        setSelectedNotes([]);
    };

    const handleRestore = async () => {
        const storedNotes = await AsyncStorage.getItem('notes');
        let notes = storedNotes ? JSON.parse(storedNotes) : [];
        notes = notes.map(note =>
            selectedNotes.includes(note.id) ? { ...note, deleted: false } : note
        );
        await updateNotes(notes);
    };

    const handleDelete = async () => {
        Alert.alert(
            "",
            "¿Quieres borrar la nota definitivamente?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        const storedNotes = await AsyncStorage.getItem('notes');
                        let notes = storedNotes ? JSON.parse(storedNotes) : [];
                        notes = notes.filter(note => !selectedNotes.includes(note.id));
                        await updateNotes(notes);
                    },
                },
            ]
        );
    };

    const handleEmptyTrash = async () => {
        Alert.alert(
            "¿Vaciar papelera?",
            "Esto eliminará todas las notas de la papelera.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Vaciar",
                    style: "destructive",
                    onPress: async () => {
                        const storedNotes = await AsyncStorage.getItem('notes');
                        let notes = storedNotes ? JSON.parse(storedNotes) : [];
                        notes = notes.filter(note => !note.deleted);
                        await updateNotes(notes);
                    },
                },
            ]
        );
    };

    const toggleSelection = (id) => {
        if (selectedNotes.includes(id)) {
            setSelectedNotes(selectedNotes.filter(item => item !== id));
        } else {
            setSelectedNotes([...selectedNotes, id]);
        }
    };

    const cancelSelection = () => {
        setSelectedNotes([]);
    };

    const renderItem = ({ item }) => {
        const isSelected = selectedNotes.includes(item.id);
        return (
            <TouchableOpacity
                style={[
                    styles.noteItem,
                    isSelected && { backgroundColor: '#cce5ff' }
                ]}
                onLongPress={() => toggleSelection(item.id)}
                onPress={() => selectedNotes.length > 0 && toggleSelection(item.id)}
            >
                <Text style={styles.noteText}>{item.text}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            {/* Appbar personalizada */}
            <View style={styles.searchBar}>
                <TouchableOpacity onPress={() =>
                    selectedNotes.length > 0
                        ? cancelSelection()
                        : navigation.dispatch(DrawerActions.openDrawer())
                }>
                    <MaterialIcons name={selectedNotes.length > 0 ? "close" : "menu"} size={24} color="black" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Papelera</Text>

                {selectedNotes.length > 0 && (
                    <TouchableOpacity onPress={handleRestore} style={styles.iconButton}>
                        <MaterialIcons name="history" size={24} color="black" />
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={() =>
                        selectedNotes.length > 0 ? handleDelete() : handleEmptyTrash()
                    }
                    style={styles.iconButton}
                >
                    <MaterialIcons name="more-vert" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                {deletedNotes.length === 0 ? (
                    <Text style={styles.title}>La papelera está vacía</Text>
                ) : (
                    <FlatList
                        data={deletedNotes}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={{ padding: 16 }}
                    />
                )}
            </View>
        </View>
    );
};

export default TrashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 55,
        paddingBottom: 15,
        backgroundColor: '#f8f8f8',
        elevation: 4,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
    },
    iconButton: {
        marginLeft: 12,
    },
    title: {
        fontSize: 20,
        marginTop: 250,
        textAlign: 'center',
        color: '#555',
    },
    noteItem: {
        padding: 16,
        marginBottom: 12,
        backgroundColor: '#f2f2f2',
        borderRadius: 8,
        marginHorizontal: 16,
    },
    noteText: {
        fontSize: 16,
        color: '#333',
    },
});
