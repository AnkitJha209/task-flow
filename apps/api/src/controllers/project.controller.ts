import { prisma } from "@workspace/db/client";
import { Request, Response } from "express";
import { authRequest } from "src/middleware/auth.middleware.js";

export const createProject = async (req: authRequest, res: Response) => {
    try {
        // Check if user is a manager (this should be handled by middleware)
        if (req.user?.role !== 'manager') {
            return res.status(403).json({ message: 'Only managers can create projects' });
        }

        const { name, description } = req.body;

        // Validate required fields
        if (!name || !description) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Create new project
        const newProject = await prisma.project.create({
            data: {
                name,
                description,
                createdById: req.user.id, // Associate project with manager who created it
            }
        });

        return res.status(201).json({
            message: 'Project created successfully',
            project: newProject
        });

    } catch (error) {
        console.error('Error creating project:', error);
        return res.status(500).json({ message: 'Error creating project', error });
    }
}



