import Branch from "../../models/branch.js";

export const getAllBranches = async (req, reply) => {
    try {
        const branches = await Branch.find({});
        return reply.status(200).send({
            message: "Branches fetched successfully",
            branches
        });
    } catch (error) {
        return reply.status(500).send({
            message: "An error occurred while fetching branches",
            error: error.message 
        });
    }
};