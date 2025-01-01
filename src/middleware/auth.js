import jwt from 'jsonwebtoken';

export const verifyToken = async (req, reply) => {
    try {
        const authHeader = req.headers['authorization'];
        
        // Check if Authorization header exists and starts with 'Bearer'
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return reply.status(401).send({ message: "Access token required" });
        }

        // Split the header to extract the token (using one space, not two)
        const token = authHeader.split(" ")[1]; 

        // Verify the token using your secret
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Attach the decoded user info to the request object
        req.user = decoded;

        // Return true if everything is successful
        return true;
    } catch (err) {
        return reply.status(403).send({ message: "Invalid or expired token" });
    }
};
