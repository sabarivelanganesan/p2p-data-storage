import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
// import { createTable } from '../Sqlite';

const Settings = () => {

    const [isUpgradePage, setIsUpgradePage] = useState(false);
    const [count, setCount] = useState(0);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
//         createTable();

    })

    const handleIncrement = () => {
          let tempCount = count+1;
          setCount(tempCount);
          setInputValue(tempCount.toString());
    };

    const handleDecrement = () => {
        if (count > 0) {
          let tempCount = count-1;
          setCount(tempCount);
          setInputValue(tempCount.toString());
        }
    };

    const handleInputChange = (value) => {
        if (value === '') {
            setInputValue('');
        } else {
            const parsedValue = parseInt(value, 10);
            setInputValue(value);
            if (!isNaN(parsedValue)) {
                setCount(parsedValue);
            }
        }
    };

    const saveUpdateStorageSpace = () => {
//         let value = parseInt(inputValue);
//         console.log(value);
//         insertTable(value);
        setIsUpgradePage(false);
    }

    return (
        <View style={styles.settingContainer}>
          {isUpgradePage ?
            (<View>
                <Text style={{fontSize: 22, fontWeight: 'bold', color: '#000000', marginBottom: 20}}>Storage Amount (MB)</Text>
                <View style={styles.upgradeStorageContainer}>
                    <TouchableOpacity onPress={handleDecrement} style={styles.buttonDecrement}>
                        <Text style={styles.buttonText}>-</Text>
                    </TouchableOpacity>
                    <TextInput
                        value={inputValue}
                        onChangeText={handleInputChange}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                    <TouchableOpacity onPress={handleIncrement} style={styles.buttonIncrement}>
                        <Text style={styles.buttonText}>+</Text>
                    </TouchableOpacity>
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 30}}>
                     <TouchableOpacity
                       style={styles.saveChanges}
                       onPress={() => saveUpdateStorageSpace()}
                     >
                           <Text style={{color: '#fff', fontSize: 20}}>Save</Text>
                     </TouchableOpacity>
                     <TouchableOpacity
                       style={styles.backToSettings}
                       onPress={() => setIsUpgradePage(false)}
                     >
                           <Text style={{color: '#fff', fontSize: 20}}>Cancel</Text>
                     </TouchableOpacity>
                 </View>
            </View>) :
            (<View style={styles.storageContainer}>
                <Text style={styles.storageSizeText}>300MB</Text>
                 <Text style={styles.availabeStorageText}>Available Storage</Text>
                 <TouchableOpacity
                   style={styles.upgradeStorage}
                   onPress={() => setIsUpgradePage(true)}
                 >
                       <Text style={{color: '#fff', fontSize: 20}}>Upgrade Storage</Text>
                 </TouchableOpacity>
             </View>)
          }
        </View>
    )
}

const styles = StyleSheet.create({
    settingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '20%'
    },
    storageContainer : {
        alignItems: 'center',
        justifyContent: 'center'
    },
    storageSizeText: {
        fontSize: 70,
        color: '#08F044'
    },
    availabeStorageText: {
        fontSize: 18,
        color: '#0B011F'
    },
    upgradeStorage: {
        backgroundColor: '#1063EA',
        padding: 10,
        borderRadius: 5,
        marginTop: 25
    },
    upgradeStorageContainer: {
        flexDirection: 'row'
    },
    buttonDecrement: {
        backgroundColor: '#F5011F',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
        marginHorizontal: 8,
      },
    buttonIncrement: {
        backgroundColor: '#1063EA',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
        marginHorizontal: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    input: {
        height: 50,
        width: 100,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 4,
        textAlign: 'center',
        marginHorizontal: 8,
        fontSize: 20,
    },
    saveChanges: {
        backgroundColor: '#22EE6C',
        padding: 6,
        borderRadius: 7
    },
    backToSettings: {
        backgroundColor: '#66646A',
        padding: 6,
        borderRadius: 7,
        marginLeft: 10
    }
})

export default Settings;