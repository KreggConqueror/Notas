import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import HomeScreen from '../screens/HomeScreen';
import TrashScreen from '../screens/TrashScreen';
import ArchiveScreen from '../screens/ArchiveScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
    return (
        <Drawer.Navigator
            screenOptions={{
                drawerStyle: {
                    width: '78%',
                },
                headerShown: false,
                drawerActiveTintColor: '#005dbb',
                drawerLabelStyle: {
                    fontSize: 16,
                },
            }}
        >
            <Drawer.Screen name="Notas" component={HomeScreen} />
            <Drawer.Screen name="Papelera" component={TrashScreen} />
            <Drawer.Screen name="Archivar" component={ArchiveScreen} />
            <Drawer.Screen name="Configuración" component={SettingsScreen} />
        </Drawer.Navigator>
    );
}
