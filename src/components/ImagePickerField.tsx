import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImagePickerFieldProps {
  image?: {
    uri: string;
    name: string;
    type: string;
  };
  onImageSelected: (image: { uri: string; name: string; type: string }) => void;
  onImageRemoved: () => void;
}

export function ImagePickerField({
  image,
  onImageSelected,
  onImageRemoved,
}: ImagePickerFieldProps) {
  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to select an image.'
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      onImageSelected({
        uri: asset.uri,
        name: asset.fileName || `image-${Date.now()}.jpg`,
        type: 'image/jpeg',
      });
    }
  };

  const removeImage = () => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: onImageRemoved },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Image (Optional)</Text>
      
      {image ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image.uri }} style={styles.image} />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={removeImage}
            accessibilityLabel="Remove image"
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={pickImage}
          accessibilityLabel="Select image"
        >
          <Text style={styles.pickerButtonText}>Select Image</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  pickerButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  pickerButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
