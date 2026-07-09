import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, Pressable, Alert, } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NoteDetailScreen = ({ route, navigation }) => {
    const { note } = route.params;
    const [title, setTitle] = useState(note?.title || '');
    const [content, setContent] = useState(note?.text || '');
    const [editedAt, setEditedAt] = useState('');
    const [moreOptionsVisible, setMoreOptionsVisible] = useState(false);
    const [addMenuVisible, setAddMenuVisible] = useState(false);

    useEffect(() => {
        const now = new Date();
        const time = now.toLocaleTimeString('es-MX', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        });
        setEditedAt(`Editado a la(s) ${time}`);

        const saveNote = async () => {
            try {
                const storedNotes = await AsyncStorage.getItem('notes');
                let notes = storedNotes ? JSON.parse(storedNotes) : [];

                const updatedNotes = notes.map(n =>
                    n.id === note.id
                        ? { ...n, title, text: content, updatedAt: new Date().toISOString() }
                        : n
                );

                await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
                console.log('Nota actualizada y guardada con AsyncStorage');
            } catch (error) {
                console.error('Error al guardar nota:', error);
            }
        };

        saveNote();
    }, [title, content]);

    const moveToTrash = async () => {
        Alert.alert('Mover a la papelera', '¿Deseas mover esta nota a la papelera?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Sí',
                onPress: async () => {
                    try {
                        const storedNotes = await AsyncStorage.getItem('notes');
                        let notes = storedNotes ? JSON.parse(storedNotes) : [];

                        const updatedNotes = notes.map(n =>
                            n.id === note.id
                                ? { ...n, deleted: true }
                                : n
                        );

                        await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
                        console.log(`Nota ${note.id} movida a la papelera`);
                        navigation.goBack();
                    } catch (error) {
                        console.error('Error al mover a papelera:', error);
                    }
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            {/* Barra superior */}
            <View style={styles.topBar}>
                <View style={styles.topActions}>
                    <TouchableOpacity onPress={() => console.log('Fijar nota')}>
                        <MaterialIcons name="push-pin" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => console.log('Agregar recordatorio')}>
                        <MaterialIcons name="add-alert" size={24} color="black" style={styles.iconSpacing} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => console.log('Archivar nota')}>
                        <MaterialIcons name="archive" size={24} color="black" style={styles.iconSpacing} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Título y contenido */}
            <TextInput
                style={styles.title}
                placeholder="Título"
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={styles.content}
                placeholder="Escribe algo..."
                multiline
                value={content}
                onChangeText={setContent}
            />

            {/* Barra inferior */}
            <View style={styles.bottomBar}>
                <TouchableOpacity onPress={() => setAddMenuVisible(!addMenuVisible)}>
                    <MaterialIcons name="add" size={24} color="black" />
                </TouchableOpacity>

                <Text style={styles.editedText}>{editedAt}</Text>

                <TouchableOpacity onPress={() => setMoreOptionsVisible(true)}>
                    <MaterialIcons name="more-vert" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <Modal
                visible={moreOptionsVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMoreOptionsVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setMoreOptionsVisible(false)}
                >
                    <View style={styles.modalMenu}>
                        <TouchableOpacity onPress={moveToTrash}>
                            <Text style={styles.menuOption}>Mover a la papelera</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            <Modal
                visible={addMenuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setAddMenuVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setAddMenuVisible(false)}
                >
                    <View style={styles.modalMenu}>
                        <TouchableOpacity onPress={() => console.log('Tomar foto')}>
                            <Text style={styles.menuOption}>Tomar foto</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => console.log('Agregar imagen')}>
                            <Text style={styles.menuOption}>Agregar imagen</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => console.log('Dibujo')}>
                            <Text style={styles.menuOption}>Dibujo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => console.log('Casillas')}>
                            <Text style={styles.menuOption}>Casillas de verificación</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

export default NoteDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 9,
        paddingHorizontal: 15,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconSpacing: {
        marginLeft: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    content: {
        fontSize: 16,
        flex: 10,
        textAlignVertical: 'top',
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 38,
    },
    editedText: {
        color: '#555',
        fontSize: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    modalMenu: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    menuOption: {
        fontSize: 16,
        paddingVertical: 10,
    },
});