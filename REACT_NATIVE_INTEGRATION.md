# 📱 React Native - Google Drive Video Integration Guide

## 🚀 **Quick Setup**

### **1. Install Required Packages**
```bash
npm install react-native-video
# For iOS
cd ios && pod install
```

### **2. Basic Video Player Component**
```javascript
// components/VideoPlayer.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Video from 'react-native-video';

const VideoPlayer = ({ video }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const onLoad = (data) => {
        console.log('✅ Video loaded successfully:', data);
        setLoading(false);
    };

    const onError = (err) => {
        console.error('❌ Video error:', err);
        setError(true);
        setLoading(false);
        Alert.alert('Error', 'Failed to load video');
    };

    const onProgress = (progress) => {
        console.log(`📊 Progress: ${Math.round(progress.currentTime)}s / ${Math.round(progress.seekableDuration)}s`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{video.title}</Text>
            
            {loading && <Text style={styles.loading}>Loading video...</Text>}
            
            <Video
                source={{ uri: video.url }}
                style={styles.videoPlayer}
                controls={true}
                resizeMode="contain"
                onLoad={onLoad}
                onError={onError}
                onProgress={onProgress}
                paused={false}
            />
            
            {video.description && (
                <Text style={styles.description}>{video.description}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    videoPlayer: {
        width: '100%',
        height: 250,
        backgroundColor: '#000',
        marginBottom: 16,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    loading: {
        textAlign: 'center',
        fontSize: 16,
        color: '#999',
        marginVertical: 20,
    },
});

export default VideoPlayer;
```

---

## 📋 **Video List Component**

```javascript
// components/VideoList.js
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';

const VideoList = ({ navigation }) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const response = await fetch('YOUR_API_URL/api/videos');
            const videoList = await response.json();
            setVideos(videoList);
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchVideos();
    };

    const renderVideoItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.videoItem}
            onPress={() => navigation.navigate('VideoPlayer', { video: item })}
        >
            <View style={styles.videoInfo}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={styles.videoDescription} numberOfLines={3}>
                    {item.description}
                </Text>
                <Text style={styles.videoDuration}>
                    📹 Duration: {item.duration ? `${Math.round(item.duration/60)}min` : 'Unknown'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading videos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={videos}
                renderItem={renderVideoItem}
                keyExtractor={(item) => item._id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    listContainer: {
        padding: 16,
    },
    videoItem: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    videoInfo: {
        flex: 1,
    },
    videoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    videoDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        lineHeight: 20,
    },
    videoDuration: {
        fontSize: 12,
        color: '#999',
    },
});

export default VideoList;
```

---

## 🧭 **Navigation Setup**

```javascript
// navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import VideoList from '../components/VideoList';
import VideoPlayer from '../components/VideoPlayer';

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="VideoList">
                <Stack.Screen 
                    name="VideoList" 
                    component={VideoList}
                    options={{ title: '📹 Videos' }}
                />
                <Stack.Screen 
                    name="VideoPlayer" 
                    component={VideoPlayer}
                    options={{ title: '▶️ Now Playing' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
```

---

## ⚙️ **Configuration**

### **1. API Configuration**
```javascript
// config/api.js
const API_BASE_URL = 'YOUR_SERVER_URL'; // e.g., 'https://your-app.herokuapp.com'

export const API_ENDPOINTS = {
    VIDEOS: `${API_BASE_URL}/api/videos`,
    VIDEO_UPLOAD: `${API_BASE_URL}/api/videos/upload`,
};

export const fetchVideos = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.VIDEOS);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};
```

### **2. App.js Setup**
```javascript
// App.js
import React from 'react';
import AppNavigator from './navigation/AppNavigator';

const App = () => {
    return <AppNavigator />;
};

export default App;
```

---

## 🎯 **Google Drive Video URLs**

Your backend should return video objects like this:
```javascript
{
    "_id": "64f8b2c1a2b3c4d5e6f7g8h9",
    "title": "Data Structures Tutorial",
    "description": "Learn data structures from basics to advanced",
    "url": "https://drive.google.com/uc?export=download&id=1uamsZGwdvQI5zMmuJigQ7loSQfxVPDKt",
    "driveFileId": "1uamsZGwdvQI5zMmuJigQ7loSQfxVPDKt",
    "duration": 3600,
    "fileSize": 157286400
}
```

---

## 🚀 **Usage Example**

```javascript
// In your main app component
import React from 'react';
import VideoPlayer from './components/VideoPlayer';

const video = {
    title: "Data Structures Easy to Advanced Course",
    description: "Full Tutorial from a Google Engineer",
    url: "https://drive.google.com/uc?export=download&id=1uamsZGwdvQI5zMmuJigQ7loSQfxVPDKt"
};

const MyApp = () => {
    return <VideoPlayer video={video} />;
};
```

---

## 🛠 **Troubleshooting**

### **Common Issues:**

1. **Video not loading?**
   - Check if the Google Drive URL is public
   - Verify the URL format: `https://drive.google.com/uc?export=download&id=FILE_ID`

2. **Android playback issues?**
   - Add network security config in `android/app/src/main/res/xml/network_security_config.xml`
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <network-security-config>
       <domain-config cleartextTrafficPermitted="true">
           <domain includeSubdomains="true">drive.google.com</domain>
       </domain-config>
   </network-security-config>
   ```

3. **iOS playback issues?**
   - Add to `Info.plist`:
   ```xml
   <key>NSAppTransportSecurity</key>
   <dict>
       <key>NSAllowsArbitraryLoads</key>
       <true/>
   </dict>
   ```

---

## ✅ **Testing Checklist**

- [ ] Videos load and play smoothly
- [ ] Progress tracking works
- [ ] Error handling displays properly
- [ ] Pull-to-refresh functionality works
- [ ] Navigation between screens is smooth
- [ ] Works on both iOS and Android

---

## 🎉 **You're Ready!**

Your React Native app is now configured to stream videos directly from Google Drive! 

For more advanced features like offline caching, video quality selection, or custom controls, check the [react-native-video documentation](https://github.com/react-native-video/react-native-video).
