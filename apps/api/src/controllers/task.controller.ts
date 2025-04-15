import { Response } from "express";
import { authRequest } from "../middleware/auth.middleware.js";
import { prisma } from "@workspace/db/client";
import { sendMail } from "../utils/sendInviteMail.js";

export const createTask = async (req: authRequest, res: Response) => {
    try {
        const { title, description, assignedUser, tag, status } = req.body
        const {projectId} = req.params

        const user = await prisma.user.findFirst({
            where: {
                name: assignedUser
            }
        })
        if (!projectId) {
            res.status(400).json({
                message: "Project ID is required"
            });
            return
        }
        if(!user){
            res.status(404).json({
                message: "User not found"
            })
            return;
        }

        const isPartOfProject = await prisma.projectMember.findFirst({
            where: {
                userId: user.id,
                projectId: projectId
            }
        }) 

        if(!isPartOfProject){
            res.status(401).json({
                message: "User is not a part of this project"
            })
            return
        }

        const newTask = await prisma.task.create({
            data: {
                title,
                description,
                status,
                projectId: projectId as string,
                assignedToId: user.id,
                tag
            }
        })

        // send mail to the assinged user ------------------- here (TODO) ------------
        
        res.status(200).json({
            message:"Task Created Successfully",
            newTask
        })

        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const getAllTask = async (req: authRequest, res: Response) => {
    try {
        const {projectId} = req.params
        
        const projectDetails = await prisma.project.findFirst({
            where: {
                id: projectId
            },
            include:{
                tasks: true
            }
        })
        if(!projectDetails){
            res.status(404).json({
                message: "Project Not Found"
            })
            return 
        }
        res.status(200).json({
            message: "Task Fetched Successfully",
            tasks : projectDetails.tasks
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const getAllUserSpecificTask = async (req: authRequest, res: Response) => {
    try {
        const {id} = req.user?.id
        const {projectId} = req.params

        const isPartOfProject = await prisma.projectMember.findFirst({
            where: {
                projectId,
                userId: id
            }
        })

        if(!isPartOfProject){
            res.status(402).json({
                message: "User is not a part of this project"
            })
            return
        }

        const projectDetails = await prisma.project.findFirst({
            where: {
                id: projectId
            },
            include: {
                tasks: {
                    where: {
                        assignedToId : id
                    }
                }
            }
        })
        if(!projectDetails){
            res.status(404).json({
                message: "No tasks found"
            })
            return
        }

        res.status(200).json({
            message: "Fetched the task successfully",
            tasks : projectDetails.tasks
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}