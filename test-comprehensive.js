// Extended socket test with proper logging
import { io } from 'socket.io-client';

console.log('🔥 Starting comprehensive socket test...');

const socket = io('http://localhost:3000', {
    forceNew: true,
    timeout: 5000
});

let testSessionId = null;

socket.on('connect', () => {
    console.log('✅ Client: Connected with socket ID:', socket.id);
    
    // Create session first
    fetch('http://localhost:3000/api/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
    })
    .then(res => res.json())
    .then(data => {
        testSessionId = data.sessionId;
        console.log('📝 Client: Session created:', testSessionId);
        
        // Test 1: Prepare session first
        setTimeout(() => {
            console.log('\n🧪 Test 1: Preparing session...');
            socket.emit('prepare-session', {
                sessionId: testSessionId,
                userId: 'test-user-123'
            });
        }, 300);
        
        // Test 2: Join session
        setTimeout(() => {
            console.log('\n🧪 Test 2: Joining session...');
            socket.emit('join-session', {
                sessionId: testSessionId,
                userId: 'test-user-123',
                name: 'Test User',
                photo: 'https://via.placeholder.com/50',
                micOn: true,
                videoOn: true
            });
        }, 800);
        
        // Test 3: Get current room info
        setTimeout(() => {
            console.log('\n🧪 Test 3: Getting current room info...');
            socket.emit('current-room', {
                sessionId: testSessionId
            });
        }, 1300);
        
        // Test 4: Send WebRTC offer
        setTimeout(() => {
            console.log('\n🧪 Test 4: Sending WebRTC offer...');
            socket.emit('send-offer', {
                sessionId: testSessionId,
                offer: { type: 'offer', sdp: 'mock-sdp-data' },
                toUserId: 'mock-target-user'
            });
        }, 1800);
        
        // Test 5: Send message
        setTimeout(() => {
            console.log('\n🧪 Test 5: Sending chat message...');
            socket.emit('send-message', {
                sessionId: testSessionId,
                userId: 'test-user-123',
                message: 'Hello from comprehensive test!'
            });
        }, 2300);
        
        // Test 6: Toggle mic
        setTimeout(() => {
            console.log('\n🧪 Test 6: Toggling microphone...');
            socket.emit('toggle-mic', {
                sessionId: testSessionId,
                userId: 'test-user-123',
                micOn: false
            });
        }, 2800);
        
    })
    .catch(error => {
        console.error('❌ Error creating session:', error);
    });
});

socket.on('session-info', (data) => {
    console.log('✅ Client: Received session-info:', JSON.stringify(data, null, 2));
});

socket.on('current-room-info', (data) => {
    console.log('✅ Client: Received current-room-info:', JSON.stringify(data, null, 2));
});

socket.on('new-participant', (data) => {
    console.log('✅ Client: New participant joined:', JSON.stringify(data, null, 2));
});

socket.on('new-message', (data) => {
    console.log('✅ Client: New message received:', JSON.stringify(data, null, 2));
});

socket.on('participant-updated', (data) => {
    console.log('✅ Client: Participant updated:', JSON.stringify(data, null, 2));
});

socket.on('receive-offer', (data) => {
    console.log('✅ Client: Received WebRTC offer from:', data.fromUserId);
});

socket.on('error', (data) => {
    console.log('❌ Client: Socket error:', data.message);
});

socket.on('connect_error', (error) => {
    console.log('❌ Client: Connection error:', error);
});

socket.on('disconnect', () => {
    console.log('🔌 Client: Socket disconnected');
});

// Cleanup after tests
setTimeout(() => {
    console.log('\n🎯 Tests completed. Disconnecting...');
    socket.disconnect();
    
    // Check final session state
    if (testSessionId) {
        fetch(`http://localhost:3000/api/session/${testSessionId}`)
            .then(res => res.json())
            .then(data => {
                console.log('\n📊 Final session state:', JSON.stringify(data, null, 2));
            })
            .catch(console.error)
            .finally(() => {
                console.log('\n✅ Comprehensive test completed!');
                process.exit(0);
            });
    } else {
        console.log('\n✅ Comprehensive test completed!');
        process.exit(0);
    }
}, 5000);
