import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, Href } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';


export default function UserProfile() {
	const router = useRouter();
	const tint = useThemeColor({}, 'tint');

	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	// const [showPhotoModal, setShowPhotoModal] = useState(false);
	const [name, setName] = useState('');
	const [age, setAge] = useState('');
	const [birthday, setBirthday] = useState('');
	const [gender, setGender] = useState('');
	const [height, setHeight] = useState('');
	const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
	const [weight, setWeight] = useState('');

	async function pickImage() {
		// Ask for permission if needed (although expo-image-picker handles this)
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		});

		if (!result.canceled && result.assets && result.assets.length > 0) {
			setAvatarUrl(result.assets[0].uri);
		}
	}

	function handleDone() {
		router.push('/choices' as Href);
	}

	return (
		<ThemedView style={styles.container}>
			<View style={styles.header}>
				<Pressable onPress={pickImage} style={[styles.avatarWrap, !avatarUrl && { borderColor: tint, borderWidth: 1 }]}>
					<Image 
                        source={avatarUrl ? { uri: avatarUrl } : require('@/assets/images/user-logo.png')} 
                        style={styles.avatar} 
                        contentFit={avatarUrl ? 'cover' : 'contain'} 
                        transition={500}
                    />
				</Pressable>
					
				<TouchableOpacity onPress={pickImage} style={[styles.photoButton, styles.photoButtonColored] }>
					<ThemedText style={{ color: '#fff' }}>{avatarUrl ? 'Change photo' : 'Add photo'}</ThemedText>
				</TouchableOpacity>
			</View>

			<View style={styles.form}>
				<ThemedText style={styles.label}>Name</ThemedText>
				<TextInput value={name} onChangeText={setName} placeholder="Name" style={styles.input} />

				<ThemedText style={styles.label}>Age</ThemedText>
				<TextInput value={age} onChangeText={setAge} placeholder="e.g. 29" keyboardType="numeric" style={styles.input} />

				<ThemedText style={styles.label}>Birthday</ThemedText>
				<TextInput value={birthday} onChangeText={setBirthday} placeholder="Month-Date-Year" style={styles.input} />

				<ThemedText style={styles.label}>Gender</ThemedText>
				<TextInput value={gender} onChangeText={setGender} placeholder="Male / Female / Other" style={styles.input} />

				<ThemedText style={styles.label}>Height (In cm)</ThemedText>
				<View style={styles.rowSmall}>
					<TextInput value={height} onChangeText={setHeight} placeholder={`Number (${heightUnit})`} keyboardType="numeric" style={[styles.input, { flex: 1 }]} />
					<TouchableOpacity onPress={() => setHeightUnit(v => v === 'cm' ? 'ft' : 'cm')} style={[styles.unitButton, { borderColor: tint }]}>
						<ThemedText style={{ color: tint }}>{heightUnit}</ThemedText>
					</TouchableOpacity>
				</View>

				<ThemedText style={styles.label}>Weight (kg)</ThemedText>
				<TextInput value={weight} onChangeText={setWeight} placeholder="e.g. 70" keyboardType="numeric" style={styles.input} />

				<TouchableOpacity onPress={handleDone} style={[styles.doneButton, styles.doneButtonColored]} activeOpacity={0.9}>
					<ThemedText type="defaultSemiBold" style={styles.doneText}>Done</ThemedText>
				</TouchableOpacity>
			</View>

			{/* <Modal visible={showPhotoModal} animationType="slide" onRequestClose={() => setShowPhotoModal(false)}>
				<ThemedView style={styles.modalContainer}>
					<ThemedText type="title" style={styles.modalTitle}>Add Photo</ThemedText>

					<ThemedText style={styles.label}>Image URL</ThemedText>
					<TextInput placeholder="https://..." style={styles.input} value={avatarUrl ?? ''} onChangeText={t => setAvatarUrl(t || null)} />

					<TouchableOpacity onPress={() => { setAvatarUrl(null); setShowPhotoModal(false); }} style={[styles.removeButton, styles.removeButtonColored] }>
						<ThemedText style={{ color: '#28a745' }}>Remove photo</ThemedText>
					</TouchableOpacity>

					<TouchableOpacity onPress={() => setShowPhotoModal(false)} style={[styles.closeButton]}>
						<ThemedText type="defaultSemiBold" style={styles.doneText}>Close</ThemedText>
					</TouchableOpacity>
				</ThemedView>
			</Modal> */}
		</ThemedView>
	);
}












const styles = StyleSheet.create({
	container: { flex: 1, padding: 20, backgroundColor: '#fff' },
	header: { alignItems: 'center', justifyContent: 'center', marginBottom: 24, paddingTop: 12 },
	avatarWrap: { 
		marginBottom: 12, 
		width: 120, 
		height: 120, 
		borderRadius: 60,
		alignItems: 'center', 
		justifyContent: 'center',
		backgroundColor: '#f0f0f0',
	},
	avatar: { width: 120, height: 120, borderRadius: 60 },
	avatarPlaceholder: { width: 120, height: 30, borderRadius: 60, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
	photoButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, elevation: 2 },
	userLogo: { width: 64, height: 64, alignSelf: 'center', marginBottom: 8, borderRadius: 32, borderWidth: 2 },
	form: { gap: 12 },
	label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#11181C' },
	input: { borderWidth: 1, borderColor: '#e6e6e6', padding: 12, borderRadius: 8, backgroundColor: '#fff', fontSize: 16 },
	rowSmall: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	unitButton: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, marginLeft: 8 },
	doneButton: { marginTop: 12, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
	doneText: { color: '#fff', fontSize: 16 },
	modalContainer: { flex: 1, padding: 20, justifyContent: 'center' },
	modalTitle: { textAlign: 'center', marginBottom: 12 },
	removeButton: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center', marginVertical: 8 },
	closeButton: { marginTop: 12, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', backgroundColor: '#d9534f' },

	photoButtonColored: { backgroundColor: '#28a745', borderColor: '#28a745' },
	doneButtonColored: { backgroundColor: '#28a745' },
	removeButtonColored: { borderColor: '#28a745' },
});

