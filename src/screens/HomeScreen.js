import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, FlatList, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
    const navigation = useNavigation();
    const [notes, setNotes] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [addToEnd, setAddToEnd] = useState(false);
    const [selectedNotes, setSelectedNotes] = useState([]);
    const [isGridView, setIsGridView] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadSettingsAndNotes();
        }, [])
    );

    const loadSettingsAndNotes = async () => {
        try {
            const savedNotes = await AsyncStorage.getItem('notes');
            const savedAddToEnd = await AsyncStorage.getItem('addToEnd');

            if (savedNotes !== null) {
                setNotes(JSON.parse(savedNotes).filter(note => !note.deleted));
            }

            if (savedAddToEnd !== null) {
                setAddToEnd(JSON.parse(savedAddToEnd));
            }
        } catch (error) {
            console.log('Error al cargar notas:', error);
        }
    };

    const saveNotes = async (newNotes) => {
        try {
            await AsyncStorage.setItem('notes', JSON.stringify(newNotes));
        } catch (error) {
            console.log('Error al guardar notas:', error);
        }
    };

    const addNote = () => {
        if (noteText.trim() === '') return;
        const newNote = {
            id: Date.now().toString(),
            text: noteText,
            pinned: false,
            archived: false,
            deleted: false,
        };
        const updatedNotes = addToEnd ? [...notes, newNote] : [newNote, ...notes];
        setNotes(updatedNotes);
        saveNotes(updatedNotes);
        setNoteText('');
        setModalVisible(false);
    };

    const toggleSelectNote = (id) => {
        setSelectedNotes(prev =>
            prev.includes(id)
                ? prev.filter(noteId => noteId !== id)
                : [...prev, id]
        );
    };

    const handlePin = () => {
        const updated = notes.map(note =>
            selectedNotes.includes(note.id)
                ? { ...note, pinned: !note.pinned }
                : note
        );
        setNotes(updated);
        saveNotes(updated);
        setSelectedNotes([]);
    };

    const handleDelete = () => {
        const updated = notes.map(note =>
            selectedNotes.includes(note.id)
                ? { ...note, deleted: true }
                : note
        );
        setNotes(updated.filter(n => !n.deleted));
        saveNotes(updated);
        setSelectedNotes([]);
    };

    const handleArchive = () => {
        const updated = notes.map(note =>
            selectedNotes.includes(note.id)
                ? { ...note, archived: true }
                : note
        );
        setNotes(updated.filter(n => !n.archived));
        saveNotes(updated);
        setSelectedNotes([]);
    };

    const toggleViewMode = () => {
        setIsGridView(prev => !prev);
    };

    const pinnedNotes = notes.filter(n => n.pinned);
    const otherNotes = notes.filter(n => !n.pinned);

    const renderNoteItem = ({ item }) => {
        const isSelected = selectedNotes.includes(item.id);
        return (
            <TouchableOpacity
                style={[
                    styles.noteItem,
                    isSelected && styles.selectedNote,
                    isGridView && styles.gridItem
                ]}
                onLongPress={() => toggleSelectNote(item.id)}
                onPress={() =>
                    selectedNotes.length > 0
                        ? toggleSelectNote(item.id)
                        : navigation.navigate('NoteDetail', { note: item })
                }
            >
                <Text style={styles.noteText}>{item.text}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                {selectedNotes.length > 0 ? (
                    <>
                        <TouchableOpacity onPress={handlePin}>
                            <MaterialIcons name="push-pin" size={24} color="black" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() =>
                                Alert.alert(
                                    'Opciones',
                                    '',
                                    [
                                        { text: 'Archivar', onPress: handleArchive },
                                        { text: 'Borrar', onPress: handleDelete },
                                        { text: 'Cancelar', style: 'cancel' },
                                    ]
                                )
                            }
                        >
                            <MaterialIcons name="more-vert" size={24} color="black" />
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                            <MaterialIcons name="menu" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={styles.searchText}>Buscar tus notas</Text>
                        <TouchableOpacity onPress={toggleViewMode}>
                            <MaterialIcons
                                name={isGridView ? 'grid-view' : 'view-agenda'}
                                size={24}
                                color="black"
                            />
                        </TouchableOpacity>
                    </>
                )}
            </View>

            <View style={styles.centerContent}>
                {notes.length === 0 ? (
                    <Text style={styles.message}>No tienes notas</Text>
                ) : (
                    <>
                        {pinnedNotes.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Fijadas</Text>
                                <FlatList
                                    data={pinnedNotes}
                                    key={isGridView ? 'g1' : 'l1'}
                                    keyExtractor={(item) => item.id}
                                    renderItem={renderNoteItem}
                                    numColumns={isGridView ? 2 : 1}
                                />
                                <Text style={styles.sectionTitle}>Otras</Text>
                            </>
                        )}
                        <FlatList
                            data={otherNotes}
                            key={isGridView ? 'g2' : 'l2'}
                            keyExtractor={(item) => item.id}
                            renderItem={renderNoteItem}
                            numColumns={isGridView ? 2 : 1}
                        />
                    </>
                )}
            </View>

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <MaterialIcons name="add" size={30} color="white" />
            </TouchableOpacity>

            {/* Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Nueva nota</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Escribe tu nota..."
                            multiline
                            value={noteText}
                            onChangeText={setNoteText}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButton}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={addNote}>
                                <Text style={styles.saveButton}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fefcff',
    },
    topBar: {
        marginTop: 50,
        backgroundColor: '#e8edf3',
        marginHorizontal: 15,
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    searchText: {
        flex: 1,
        marginHorizontal: 10,
        color: '#555',
        fontSize: 16,
    },
    centerContent: {
        flex: 1,
        padding: 16,
    },
    message: {
        marginTop: 400,
        fontSize: 16,
        textAlign: 'center',
        color: '#333',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#005dbb',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 15,
    },
    cancelButton: {
        marginRight: 20,
        fontSize: 16,
        color: 'red',
    },
    saveButton: {
        fontSize: 16,
        color: '#005dbb',
    },
    noteItem: {
        flex: 1,
        padding: 12,
        margin: 5,
        backgroundColor: '#e8edf3',
        borderRadius: 8,
    },
    selectedNote: {
        backgroundColor: '#c2d9f0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 8,
        marginLeft: 5,
        color: '#333',
    },
    gridItem: {
        flexBasis: '47%',
    },
    noteText: {
        fontSize: 15,
        color: '#333',
    },
});