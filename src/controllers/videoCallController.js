import Session from "../models/session.js";

const webRTCSignalingSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("prepare-session", async ({ sessionId, userId }) => {
      console.log(`User ${userId} is preparing to join session ${sessionId}`);

      const session = await Session.findOne({ sessionId });
      if (session) {
        socket.join(sessionId);
        console.log(`User ${userId} is observing session ${sessionId}`);

        socket.emit("session-info", {
          participants: session?.participants,
        });

        socket.on("disconnect", async () => {
          console.log(
            `Observer ${userId} disconnected from session ${sessionId}`
          );
        });
      } else {
        console.log(`Session with ID ${sessionId} not found`);
        socket.emit("error", { message: "Session not found" });
      }
    });

    socket.on(
      "join-session",
      async ({ sessionId, userId, name, photo, micOn, videoOn, isSharingScreen }) => {
        console.log(
          `User ${name} (${userId}) is attempting to join session ${sessionId}`
        );

        const session = await Session.findOne({ sessionId });
        if (session) {
          const existingParticipantIndex = session.participants.findIndex(
            (p) => p.userId === userId
          );

          if (existingParticipantIndex !== -1) {
            session.participants[existingParticipantIndex] = {
              ...session.participants[existingParticipantIndex],
              name: name || session.participants[existingParticipantIndex].name,
              photo:
                photo || session.participants[existingParticipantIndex].photo,
              micOn: micOn,
              videoOn: videoOn,
              isSharingScreen: isSharingScreen !== undefined ? isSharingScreen : false,
              socketId: socket.id,
            };
          } else {
            const participant = {
              userId,
              name,
              photo,
              socketId: socket.id,
              micOn: micOn,
              videoOn: videoOn,
              isSharingScreen: isSharingScreen || false,
            };
            session.participants.push(participant);
          }

          await session.save();
          socket.join(sessionId);

          console.log(
            `User ${name} (${userId}) has joined session ${sessionId}`
          );

          io.to(sessionId).emit(
            "new-participant",
            session.participants?.find((i) => i.userId === userId)
          );
          io.to(sessionId).emit("session-info", {
            participants: session.participants,
          });
        } else {
          console.log(`Session with ID ${sessionId} not found`);
          socket.emit("error", { message: "Session not found" });
        }
      }
    );

    socket.on("current-room", async ({ sessionId }) => {
      console.log(`Asking for room participants`);
      const session = await Session.findOne({ sessionId });

      io.to(sessionId).emit("all-participants", session?.participants);
    });

    socket.on("send-offer", async ({ sessionId, sender, receiver, offer }) => {
      console.log(
        `User ${sender} is sending an offer ${receiver} to session ${sessionId}`
      );
      io.to(sessionId).emit("receive-offer", { sender, receiver, offer });
    });

    socket.on(
      "send-answer",
      async ({ sessionId, sender, receiver, answer }) => {
        console.log(
          `User ${sender} is sending an answer to ${receiver} session ${sessionId}`
        );
        io.to(sessionId).emit("receive-answer", { sender, receiver, answer });
      }
    );

    socket.on(
      "send-ice-candidate",
      async ({ sessionId, sender, receiver, candidate }) => {
        console.log(
          `User ${sender} is sending ICE candidate  to  ${receiver}  session ${sessionId}`
        );
        io.to(sessionId).emit("receive-ice-candidate", {
          sender,
          receiver,
          candidate,
        });
      }
    );

    socket.on("toggle-mute", async ({ sessionId, userId }) => {
      console.log(`User ${userId} is toggling mute in session ${sessionId}`);
      const session = await Session.findOne({ sessionId });
      if (session) {
        const participant = session.participants.find(
          (p) => p.userId === userId
        );
        if (participant) {
          participant.micOn = !participant.micOn;
          await session.save();
          console.log(
            `User ${userId} is now ${participant.micOn ? "micOn" : "unmicOn"}`
          );
          io.to(sessionId).emit("participant-update", participant);
        }
      }
    });

    socket.on("toggle-video", async ({ sessionId, userId }) => {
      console.log(`User ${userId} is toggling video in session ${sessionId}`);
      const session = await Session.findOne({ sessionId });
      if (session) {
        const participant = session.participants.find(
          (p) => p.userId === userId
        );
        if (participant) {
          participant.videoOn = !participant.videoOn;
          await session.save();
          console.log(
            `User ${userId} has turned their video ${
              participant.videoOn ? "off" : "on"
            }`
          );

          io.to(sessionId).emit("participant-update", participant);
        }
      }
    });

    socket.on("toggle-screenshare", async ({ sessionId, userId }) => {
      console.log(`User ${userId} is toggling screen share in session ${sessionId}`);
      const session = await Session.findOne({ sessionId });
      if (session) {
        const participant = session.participants.find(
          (p) => p.userId === userId
        );
        if (participant) {
          participant.isSharingScreen = !participant.isSharingScreen;
          await session.save();
          console.log(
            `User ${userId} has turned screen sharing ${
              participant.isSharingScreen ? "on" : "off"
            }`
          );

          io.to(sessionId).emit("participant-update", participant);
        }
      }
    });

    socket.on("send-emoji", async ({ sessionId, userId, emoji }) => {
      console.log(
        `User ${userId} is sending emoji "${emoji}" in session ${sessionId}`
      );
      const session = await Session.findOne({ sessionId });
      if (session) {
        const participant = session.participants.find(
          (p) => p.userId === userId
        );
        if (participant) {
          io.to(sessionId).emit("emoji-update", {
            name: participant?.name,
            emoji: emoji,
          });
          console.log(`Emoji "${emoji}" sent by user ${userId}`);
        }
      }
    });

    socket.on("send-chat", async ({ sessionId, userId, message }) => {
      console.log(
        `User ${userId} is sending chat "${message}" in session ${sessionId}`
      );
      const session = await Session.findOne({ sessionId });
      if (session) {
        const participant = session.participants.find(
          (p) => p.userId === userId
        );
        if (participant) {
          io.to(sessionId).emit("receive-chat", {
            userId: userId,
            name: participant?.name,
            message: message,
          });
          console.log(`Message "${message}" sent by user ${userId}`);
        }
      }
    });

    socket.on("hang-up", async () => {
      console.log("User Hang Up:", socket.id);

      const sessions = await Session.find();

      for (const session of sessions) {
        const participantIndex = session?.participants?.findIndex(
          (p) => p?.socketId === socket?.id
        );

        if (participantIndex !== -1) {
          const participant = session?.participants[participantIndex];
          session.participants.splice(participantIndex, 1);
          await session.save();

          console.log(
            `User ${participant.name} (${participant.userId}) left session ${session.sessionId}`
          );
          io.to(session.sessionId).emit("session-info", {
            participants: session?.participants,
          });
          io.to(session.sessionId).emit("participant-left", participant.userId);

          break;
        }
      }
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);

      const sessions = await Session.find();
      for (const session of sessions) {
        const participantIndex = session?.participants?.findIndex(
          (p) => p?.socketId === socket?.id
        );

        if (participantIndex !== -1) {
          const participant = session?.participants[participantIndex];
          session.participants.splice(participantIndex, 1);
          await session.save();

          console.log(
            `User ${participant.name} (${participant.userId}) left session ${session.sessionId}`
          );
          io.to(session.sessionId).emit("session-info", {
            participants: session?.participants,
          });
          io.to(session.sessionId).emit("participant-left", participant.userId);

          break;
        }
      }
    });
  });
};

// Create a new session
const createSession = async (request, reply) => {
  try {
    const sessionId = Math.random().toString(36).substr(2, 9);
    const session = new Session({ sessionId, participants: [] });
    await session.save();
    return reply.send({ sessionId });
  } catch (error) {
    console.log(error);
    return reply.status(500).send({ error: "Failed to create session" });
  }
};

// Check if session is alive
const isSessionAlive = async (request, reply) => {
  try {
    const { sessionId } = request.query;
    const session = await Session.findOne({ sessionId });
    return reply.send({ isAlive: !!session });
  } catch (error) {
    console.log(error);
    return reply.status(500).send({ error: "Failed to check session" });
  }
};

export { createSession, isSessionAlive };
export default webRTCSignalingSocket;
