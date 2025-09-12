import Session from "../models/session.js";

const webRTCSignalingSocket = (io) => {
    console.log("🚀 WebRTC Signaling Socket Controller Initialized");
    
    // Track connected clients
    const connectedClients = new Map();
    
    io.on("connection", (socket) => {
        console.log("✅ userConnected:", socket.id);
        connectedClients.set(socket.id, { 
            socketId: socket.id, 
            connectedAt: new Date(),
            userId: null,
            sessionId: null 
        });
        console.log(`📊 Total connected clients: ${connectedClients.size}`);

        // Event: Prepare Session
        socket.on("prepare-session", async ({ sessionId, userId }) => {
            console.log(`📋 user ${userId} is preparing session ${sessionId}`);
            
            // Update client tracking
            if (connectedClients.has(socket.id)) {
                connectedClients.get(socket.id).userId = userId;
                connectedClients.get(socket.id).sessionId = sessionId;
            }
            
            if (sessionId) {
                socket.join(sessionId);
                console.log(`🚪 user ${userId} joined session ${sessionId}`);

                const session = await findSessionById(sessionId);
                if (session) {
                    console.log(`✅ Session ${sessionId} found with ${session.participants.length} participants`);
                    // Emit session info to the user
                    socket.emit("session-info", {
                        participants: session.participants,
                    });
                } else {
                    console.log(`❌ Session ${sessionId} not found for user ${userId}`);
                    socket.emit("error", { message: "Session not found" });
                }

                // Handle user disconnect
                socket.on("disconnect", async () => {
                    console.log(`🔌 user ${userId} disconnected from session ${sessionId}`);
                    await handleUserDisconnect(sessionId, userId, socket.id);
                });
            } else {
                console.log(`❌ user ${userId} - invalid session ${sessionId}`);
                socket.emit("error", { message: "Session not found" });
            }
        });

        // Event: Join Session
        socket.on("join-session", async ({ sessionId, userId, name, photo, micOn, videoOn }) => {
            console.log(`📞 user ${userId} is joining session ${sessionId}`);
            console.log(`👤 User details: name="${name}", micOn=${micOn}, videoOn=${videoOn}`);
            
            const session = await findSessionById(sessionId);
            if (session) {
                console.log(`🎯 Session ${sessionId} found, adding participant...`);
                
                // Add or update the participant in the session
                await addOrUpdateParticipant(session, userId, name, photo, micOn, videoOn, socket.id);
                socket.join(sessionId);
                console.log(`✅ user ${userId} successfully joined session ${sessionId}`);

                // Update client tracking
                if (connectedClients.has(socket.id)) {
                    const client = connectedClients.get(socket.id);
                    client.userId = userId;
                    client.sessionId = sessionId;
                    client.name = name;
                }

                // Get updated session
                const updatedSession = await findSessionById(sessionId);
                const newParticipant = updatedSession.participants?.find((i) => i.userId === userId);
                
                console.log(`📢 Broadcasting new participant to session ${sessionId}:`, {
                    userId,
                    name,
                    socketId: socket.id
                });

                // Notify all participants about the new participant
                io.to(sessionId).emit("new-participant", newParticipant);

                // Send session info to the user
                socket.emit("session-info", { participants: updatedSession.participants });
                console.log(`📊 Session ${sessionId} now has ${updatedSession.participants.length} participants`);
            } else {
                console.log(`❌ user ${userId} - session ${sessionId} not found`);
                socket.emit("error", { message: "Session not found" });
            }
        });

        // Event: Get Current Room Info
        socket.on("current-room", async ({ sessionId }) => {
            console.log(`📊 Getting current room info for session ${sessionId}`);
            const session = await findSessionById(sessionId);
            if (session) {
                // Send current room info to the user
                socket.emit("current-room-info", {
                    participants: session.participants,
                    chat: session.chat,
                });
                console.log(`✅ Sent current room info for session ${sessionId}`);
            } else {
                console.log(`❌ Session ${sessionId} not found for current-room request`);
                socket.emit("error", { message: "Session not found" });
            }
        });

        // Event: Send Offer (WebRTC)
        socket.on("send-offer", ({ sessionId, offer, toUserId }) => {
            console.log(`📡 WebRTC OFFER: ${socket.id} → ${toUserId} in session ${sessionId}`);
            console.log(`🔄 Offer type: ${offer?.type}, SDP length: ${offer?.sdp?.length || 0} chars`);
            
            // Forward the offer to the recipient
            socket.to(toUserId).emit("receive-offer", { offer, fromUserId: socket.id });
            console.log(`✅ Offer forwarded to ${toUserId}`);
        });

        // Event: Send Answer (WebRTC)
        socket.on("send-answer", ({ sessionId, answer, toUserId }) => {
            console.log(`📡 WebRTC ANSWER: ${socket.id} → ${toUserId} in session ${sessionId}`);
            console.log(`🔄 Answer type: ${answer?.type}, SDP length: ${answer?.sdp?.length || 0} chars`);
            
            // Forward the answer to the recipient
            socket.to(toUserId).emit("receive-answer", { answer, fromUserId: socket.id });
            console.log(`✅ Answer forwarded to ${toUserId}`);
        });

        // Event: Send ICE Candidate (WebRTC)
        socket.on("send-ice-candidate", ({ sessionId, candidate, toUserId }) => {
            console.log(`🧊 ICE CANDIDATE: ${socket.id} → ${toUserId} in session ${sessionId}`);
            console.log(`🔄 Candidate: ${candidate?.candidate?.substring(0, 50)}...`);
            
            // Forward the ICE candidate to the recipient
            socket.to(toUserId).emit("receive-ice-candidate", { candidate, fromUserId: socket.id });
            console.log(`✅ ICE candidate forwarded to ${toUserId}`);
        });

        // Event: Hang Up (End Call)
        socket.on("hang-up", async ({ sessionId, userId }) => {
            console.log(`📵 HANG UP: user ${userId} hung up in session ${sessionId}`);
            console.log(`🔄 Cleaning up connection for ${userId} (${socket.id})`);
            
            // Handle user disconnect and update the session
            await handleUserDisconnect(sessionId, userId, socket.id);
            socket.emit("call-ended");
            console.log(`✅ Call ended for user ${userId}`);
        });

        // Event: Toggle Microphone
        socket.on("toggle-mic", async ({ sessionId, userId, micOn }) => {
            console.log(`🎤 MIC TOGGLE: user ${userId} toggled mic to ${micOn} in session ${sessionId}`);
            
            const session = await findSessionById(sessionId);
            if (session) {
                // Update the participant's mic state in the session
                await updateParticipant(session, userId, { micOn });
                const updatedParticipant = session.participants.find((p) => p.userId === userId);
                
                // Notify all participants about the update
                io.to(sessionId).emit("participant-updated", updatedParticipant);
                console.log(`✅ Mic state updated and broadcasted for ${userId}`);
            } else {
                console.log(`❌ Session ${sessionId} not found for mic toggle`);
            }
        });

        // Event: Toggle Video
        socket.on("toggle-video", async ({ sessionId, userId, videoOn }) => {
            console.log(`📹 VIDEO TOGGLE: user ${userId} toggled video to ${videoOn} in session ${sessionId}`);
            
            const session = await findSessionById(sessionId);
            if (session) {
                // Update the participant's video state in the session
                await updateParticipant(session, userId, { videoOn });
                const updatedParticipant = session.participants.find((p) => p.userId === userId);
                
                // Notify all participants about the update
                io.to(sessionId).emit("participant-updated", updatedParticipant);
                console.log(`✅ Video state updated and broadcasted for ${userId}`);
            } else {
                console.log(`❌ Session ${sessionId} not found for video toggle`);
            }
        });

        // Event: Send Message
        socket.on("send-message", async ({ sessionId, userId, message }) => {
            console.log(`💬 CHAT MESSAGE: user ${userId} in session ${sessionId}`);
            console.log(`📝 Message: "${message}"`);
            
            const session = await findSessionById(sessionId);
            if (session) {
                const participant = session.participants.find((p) => p.userId === userId);
                if (participant) {
                    // Add the message to the session's chat
                    const chatMessage = {
                        userId,
                        name: participant.name,
                        photo: participant.photo,
                        message,
                        timestamp: new Date(),
                    };
                    session.chat.push(chatMessage);
                    await session.save();

                    // Broadcast the message to all participants
                    io.to(sessionId).emit("new-message", chatMessage);
                    console.log(`✅ Message broadcasted to ${session.participants.length} participants in session ${sessionId}`);
                } else {
                    console.log(`❌ Participant ${userId} not found in session ${sessionId}`);
                }
            } else {
                console.log(`❌ Session ${sessionId} not found for message`);
            }
        });

        // Event: Leave Session
        socket.on("leave-session", async ({ sessionId, userId }) => {
            console.log(`🚪 LEAVE SESSION: user ${userId} leaving session ${sessionId}`);
            
            // Handle user disconnect and update the session
            await handleUserDisconnect(sessionId, userId, socket.id);
            console.log(`✅ User ${userId} successfully left session ${sessionId}`);
        });

        // Event: Disconnect
        socket.on("disconnect", async () => {
            console.log(`🔌 DISCONNECT: user disconnected: ${socket.id}`);
            
            // Get client info before removing
            const clientInfo = connectedClients.get(socket.id);
            if (clientInfo) {
                console.log(`📊 Disconnected client info:`, {
                    socketId: socket.id,
                    userId: clientInfo.userId,
                    sessionId: clientInfo.sessionId,
                    connectedDuration: Date.now() - clientInfo.connectedAt.getTime()
                });
                
                // If user was in a session, handle disconnect
                if (clientInfo.sessionId && clientInfo.userId) {
                    await handleUserDisconnect(clientInfo.sessionId, clientInfo.userId, socket.id);
                }
                
                connectedClients.delete(socket.id);
            }
            
            console.log(`📊 Remaining connected clients: ${connectedClients.size}`);
        });
    });

    // Helper function to find a session by ID
    const findSessionById = async (sessionId) => {
        return await Session.findOne({ sessionId });
    };

    // Helper function to add or update a participant in a session
    const addOrUpdateParticipant = async (session, userId, name, photo, micOn, videoOn, socketId) => {
        console.log(`🔄 Adding/updating participant ${userId} in session ${session.sessionId}`);
        
        const existingParticipant = session.participants.findIndex(
            (p) => p.userId === userId
        );
        
        if (existingParticipant !== -1) {
            console.log(`🔄 Updating existing participant ${userId}`);
            // Update existing participant
            session.participants[existingParticipant] = {
                ...session.participants[existingParticipant],
                name: name || session.participants[existingParticipant].name,
                photo: photo || session.participants[existingParticipant].photo,
                micOn: micOn !== undefined ? micOn : session.participants[existingParticipant].micOn,
                videoOn: videoOn !== undefined ? videoOn : session.participants[existingParticipant].videoOn,
                socketId: socketId,
            };
        } else {
            console.log(`➕ Adding new participant ${userId}`);
            // Add new participant
            const participant = {
                userId,
                name,
                photo,
                micOn,
                videoOn,
                socketId: socketId,
            };
            session.participants.push(participant);
        }
        
        await session.save(); // Save the updated session to the database
        console.log(`✅ Participant ${userId} saved to session ${session.sessionId}`);
    };

    // Helper function to update a participant's properties
    const updateParticipant = async (session, userId, updates) => {
        console.log(`🔄 Updating participant ${userId} in session ${session.sessionId}:`, updates);
        
        const participant = session.participants.find((p) => p.userId === userId);
        if (participant) {
            // Update participant properties
            Object.assign(participant, updates);
            await session.save(); // Save the updated session to the database
            console.log(`✅ Participant ${userId} updated successfully`);
        } else {
            console.log(`❌ Participant ${userId} not found for update`);
        }
    };

    // Helper function to handle user disconnect
    const handleUserDisconnect = async (sessionId, userId, socketId) => {
        try {
            console.log(`🔄 HANDLING DISCONNECT: ${userId} from session ${sessionId}`);
            
            const session = await findSessionById(sessionId);
            if (session) {
                const participantIndex = session.participants.findIndex((p) => p.userId === userId);
                if (participantIndex !== -1) {
                    // Remove the participant from the session
                    const [participant] = session.participants.splice(participantIndex, 1);
                    
                    console.log(`👋 Removing participant: ${participant.name} (${userId})`);
                    
                    // Use findOneAndUpdate to avoid version conflicts
                    const updatedSession = await Session.findOneAndUpdate(
                        { sessionId },
                        { $pull: { participants: { userId } } },
                        { new: true }
                    );

                    // Notify all participants about the participant leaving
                    io.to(sessionId).emit("participant-left", participant);
                    console.log(`� Broadcasted participant-left event for ${userId} to session ${sessionId}`);
                    console.log(`📊 Session ${sessionId} now has ${updatedSession?.participants.length || 0} participants`);
                } else {
                    console.log(`⚠️ Participant ${userId} not found in session ${sessionId} participants list`);
                }
            } else {
                console.log(`⚠️ Session ${sessionId} not found during disconnect`);
            }
        } catch (error) {
            console.error(`❌ Error handling user disconnect for ${userId}:`, error.message);
        }
    };
};

export default webRTCSignalingSocket;
