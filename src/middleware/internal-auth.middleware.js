const internalAuth = async (request, reply) => {
    const authHeader = request.headers.authorization;
    const serviceName = request.headers['x-internal-service'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({ message: 'Unauthorized: Missing token' });
    }

    const token = authHeader.split(' ')[1];

    if (token !== process.env.QUIZ_SERVER_INTERNAL_TOKEN) {
        return reply.status(403).send({ message: 'Forbidden: Invalid internal token' });
    }

    // Optional: Check specific service name if needed
    if (serviceName !== 'social-microservice') {
         // Log warning
    }
};

export default internalAuth;
