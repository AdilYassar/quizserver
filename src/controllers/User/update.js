import { Student } from "../../models/user.js";
import { Admin } from "../../models/user.js";

export const updateUser = async (req, reply) => {
    try {
        const { userId } = req.user; // Assuming req.user is populated via middleware
        const updateData = req.body;

        // Check if user exists in either Student or Admin
        let user = await Student.findById(userId);
        if (!user) {
            user = await Admin.findById(userId);
        }

        if (!user) {
            return reply.status(404).send({
                message: "User not found",
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
            });
        }

        // Update the user and return the new data
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            {
                new: true, // Return the updated document
                runValidators: true, // Run schema validators
            }
        );

        if (!updatedUser) {
            return reply.status(404).send({
                message: "User not found after update",
            });
        }

        // Send the updated user details as a response
        return reply.send({
            message: "User updated successfully",
            user: updatedUser, // Return the updated user details
        });
    } catch (error) {
        return reply.status(500).send({
            message: "Failed to update the user",
            error: error.message || error,
        });
    }
};