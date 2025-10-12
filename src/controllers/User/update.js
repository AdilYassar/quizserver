import { Student, Admin } from "../../models/user.js";
import { sanitizeUser } from "../../utils/authUtils.js";

export const updateUser = async (req, reply) => {
    try {
        const { userUuid, role } = req.user; // Get UUID and role from authenticated user
        const updateData = req.body;

        // Validate that sensitive fields are not being updated
        const restrictedFields = ['password', 'role', 'uuid', 'isActivated', 'loginAttempts', 'lockUntil'];
        for (const field of restrictedFields) {
            if (updateData.hasOwnProperty(field)) {
                return reply.status(400).send({
                    message: `Field '${field}' cannot be updated`,
                    code: "RESTRICTED_FIELD"
                });
            }
        }

        // Find user by UUID
        let user;
        if (role === "Student") {
            user = await Student.findOne({ uuid: userUuid });
        } else if (role === "Admin") {
            user = await Admin.findOne({ uuid: userUuid });
        } else {
            return reply.status(403).send({
                message: "Invalid role",
                code: "INVALID_ROLE"
            });
        }

        if (!user) {
            return reply.status(404).send({
                message: "User not found",
                code: "USER_NOT_FOUND"
            });
        }

        // Determine the model to update based on user role
        let UserModel;
        if (user.role === "Student") {
            UserModel = Student;
        } else if (user.role === "Admin") {
            UserModel = Admin;
        } else {
            return reply.status(400).send({
                message: "Invalid role",
                code: "INVALID_ROLE"
            });
        }

        // Update the user and return the new data
        const updatedUser = await UserModel.findOneAndUpdate(
            { uuid: userUuid },
            { $set: updateData },
            {
                new: true, // Return the updated document
                runValidators: true, // Run schema validators
            }
        );

        if (!updatedUser) {
            return reply.status(404).send({
                message: "User not found after update",
                code: "USER_NOT_FOUND"
            });
        }

        // Log the update
        console.log(`User updated: ${userUuid}`);

        // Send the updated user details as a response
        return reply.send({
            message: "User updated successfully",
            user: sanitizeUser(updatedUser), // Return sanitized user details
        });
    } catch (error) {
        console.error("User update error:", error);
        return reply.status(500).send({
            message: "Failed to update the user",
            code: "UPDATE_ERROR"
        });
    }
};