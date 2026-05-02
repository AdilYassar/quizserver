import { SupportTicket } from '../models/supportTicket.js';
import { SupportMessage } from '../models/supportMessage.js';
import { verifyToken } from '../middleware/auth.js';

export default async function registerSupportRoutes(app) {
    // ========== STUDENT ENDPOINTS ==========

    // Create a new support ticket
    app.post('/api/support/tickets', {
        preHandler: [verifyToken],
        handler: async (request, reply) => {
            try {
                const userId = request.user._id;
                const { subject, priority = 'Medium' } = request.body;

                if (!subject) {
                    reply.code(400);
                    return { error: 'Subject is required' };
                }

                const ticket = new SupportTicket({
                    userId,
                    subject,
                    priority
                });

                await ticket.save();

                return {
                    message: 'Support ticket created successfully',
                    data: ticket
                };
            } catch (error) {
                console.error('Error creating support ticket:', error);
                reply.code(500);
                return { error: 'Failed to create support ticket' };
            }
        }
    });

    // List all tickets for current user
    app.get('/api/support/tickets', {
        preHandler: [verifyToken],
        handler: async (request, reply) => {
            try {
                const userId = request.user._id;
                const tickets = await SupportTicket.find({ userId })
                    .sort({ lastMessageAt: -1 })
                    .lean();

                return { data: tickets };
            } catch (error) {
                console.error('Error fetching support tickets:', error);
                reply.code(500);
                return { error: 'Failed to fetch support tickets' };
            }
        }
    });

    // Get message history for a ticket
    app.get('/api/support/tickets/:id/messages', {
        preHandler: [verifyToken],
        handler: async (request, reply) => {
            try {
                const userId = request.user._id;
                const { id: ticketId } = request.params;

                // Verify ticket ownership
                const ticket = await SupportTicket.findOne({ _id: ticketId, userId });
                if (!ticket) {
                    reply.code(404);
                    return { error: 'Ticket not found or access denied' };
                }

                const messages = await SupportMessage.find({ ticketId })
                    .sort({ createdAt: 1 })
                    .lean();

                return { data: messages };
            } catch (error) {
                console.error('Error fetching ticket messages:', error);
                reply.code(500);
                return { error: 'Failed to fetch ticket messages' };
            }
        }
    });

    // Send a message within a ticket
    app.post('/api/support/tickets/:id/messages', {
        preHandler: [verifyToken],
        handler: async (request, reply) => {
            try {
                const userId = request.user._id;
                const { id: ticketId } = request.params;
                const { message } = request.body;

                if (!message) {
                    reply.code(400);
                    return { error: 'Message content is required' };
                }

                // Verify ticket ownership
                const ticket = await SupportTicket.findOne({ _id: ticketId, userId });
                if (!ticket) {
                    reply.code(404);
                    return { error: 'Ticket not found or access denied' };
                }

                const supportMessage = new SupportMessage({
                    ticketId,
                    senderId: userId,
                    senderType: 'User',
                    message
                });

                await supportMessage.save();

                // Update ticket's last message timestamp
                ticket.lastMessageAt = new Date();
                if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
                    ticket.status = 'Open'; // Reopen if user replies
                }
                await ticket.save();

                // Emit real-time message via Socket.IO
                if (app.io) {
                    app.io.to(`ticket_${ticketId}`).emit('support:message', supportMessage);
                }

                return {
                    message: 'Message sent successfully',
                    data: supportMessage
                };
            } catch (error) {
                console.error('Error sending support message:', error);
                reply.code(500);
                return { error: 'Failed to send support message' };
            }
        }
    });

    // ========== ADMIN ENDPOINTS ==========

    // List all tickets (Admin)
    app.get('/api/management/support/tickets', async (request, reply) => {
        try {
            const tickets = await SupportTicket.find()
                .populate('userId', 'firstName lastName email')
                .sort({ lastMessageAt: -1 })
                .lean();

            return { data: tickets };
        } catch (error) {
            console.error('Error fetching all support tickets:', error);
            reply.code(500);
            return { error: 'Failed to fetch support tickets' };
        }
    });

    // Update ticket status (Admin)
    app.patch('/api/management/support/tickets/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const { status, priority } = request.body;

            const ticket = await SupportTicket.findByIdAndUpdate(
                id,
                { status, priority },
                { new: true }
            );

            if (!ticket) {
                reply.code(404);
                return { error: 'Ticket not found' };
            }

            return {
                message: 'Ticket updated successfully',
                data: ticket
            };
        } catch (error) {
            console.error('Error updating support ticket:', error);
            reply.code(500);
            return { error: 'Failed to update support ticket' };
        }
    });

    // Admin reply to ticket
    app.post('/api/management/support/tickets/:id/messages', async (request, reply) => {
        try {
            const { id: ticketId } = request.params;
            const { message, adminId } = request.body; // adminId should come from session or request

            if (!message) {
                reply.code(400);
                return { error: 'Message content is required' };
            }

            const ticket = await SupportTicket.findById(ticketId);
            if (!ticket) {
                reply.code(404);
                return { error: 'Ticket not found' };
            }

            const supportMessage = new SupportMessage({
                ticketId,
                senderId: adminId || '600000000000000000000001', // Fallback or use real Admin ID
                senderType: 'Admin',
                message
            });

            await supportMessage.save();

            ticket.lastMessageAt = new Date();
            ticket.status = 'In Progress';
            await ticket.save();

            // Emit real-time message via Socket.IO
            if (app.io) {
                app.io.to(`ticket_${ticketId}`).emit('support:message', supportMessage);
            }

            return {
                message: 'Reply sent successfully',
                data: supportMessage
            };
        } catch (error) {
            console.error('Error sending admin reply:', error);
            reply.code(500);
            return { error: 'Failed to send reply' };
        }
    });
}
