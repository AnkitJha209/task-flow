import { prisma } from "@workspace/db/client";
import { Request, Response } from "express";
import jwt from 'jsonwebtoken'
import { authRequest } from "../middleware/auth.middleware.js";
import { sendMail } from "../utils/sendInviteMail.js";

export const createProject = async (req: authRequest, res: Response) => {
    try {
        // Check if user is a manager (this should be handled by middleware)
        if (req.user?.role !== 'MANAGER') {
            res.status(403).json({ message: 'Only managers can create projects' });
            return;
        }
        console.log(req.user?.id)
        console.log(req.user?.role)

        const { name, description } = req.body;

        // Validate required fields
        if (!name || !description) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        // Create new project
        const newProject = await prisma.project.create({
            data: {
                name,
                description,
                createdById: req.user.id, // Associate project with manager who created it
            }
        });

        res.status(201).json({
            message: 'Project created successfully',
            project: newProject
        });
        return;

    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Error creating project', error });
        return;
    }
}


export const inviteToProject = async (req: authRequest, res: Response) => {
    try {
        // Get project ID and user email from request
        const { projectId, userEmail } = req.body;

        if (!projectId || !userEmail) {
            res.status(400).json({ message: 'Project ID and user email are required' });
            return;
        }

        // Check if user making request is project creator or manager
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { createdBy: true }
        });

        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        if (project.createdById !== req.user?.id) {
            res.status(403).json({ message: 'Only project creator can invite members' });
            return;
        }

        // Check if invited user exists
        const invitedUser = await prisma.user.findUnique({
            where: { email: userEmail }
        });

        if (!invitedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }


        const generateToken = jwt.sign({projectId, userEmail}, process.env.JWT_SECRET as string, {expiresIn: '2h'});
        const inviteurl = `http://localhost:3000/invite?token=${generateToken}`;

        sendMail(inviteurl, project.name, userEmail);

        res.status(200).json({
            message: "Mail send Successfully"
        })

        
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: "Error while inviting"
        })
    }

}


export const joinProject = async (req: authRequest, res: Response) => {
    try {
        const { token } = req.body;

        if (!token) {
            res.status(400).json({ message: 'Token is required' });
            return;
        }

        // Verify and decode the token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token as string, process.env.JWT_SECRET as string) as {
                projectId: string;
                userEmail: string;
            };
        } catch (error) {
            res.status(401).json({ message: 'Invalid or expired token' });
            return;
        }

        const { projectId, userEmail } = decodedToken;

        // Check if project exists
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email: userEmail }
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return
        }

        // Check if user is already a member
        const existingMember = await prisma.projectMember.findFirst({
            where: {
                projectId,
                userId: user.id
            }
        });

        if (existingMember) {
            res.status(400).json({ message: 'User is already a member of this project' });
            return;
        }

        // Add user to project members
        const projectMember = await prisma.projectMember.create({
            data: {
                projectId,
                userId: user.id
            }
        });

        res.status(200).json({
            message: 'Successfully joined the project',
            projectMember
        });
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}


