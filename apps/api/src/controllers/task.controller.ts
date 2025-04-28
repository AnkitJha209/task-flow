import { Response } from "express";
import { authRequest } from "../middleware/auth.middleware.js";
import { prisma } from "@workspace/db/client";
import { sendTaskAssignedMail } from "../utils/sendTask.js";

export const createTask = async (req: authRequest, res: Response) => {
  try {
    const { title, description, assignedUser, tag, status } = req.body;
    const { projectId } = req.params;

    const user = await prisma.user.findFirst({
      where: {
        name: assignedUser,
      },
    });
    if (!projectId) {
      res.status(400).json({
        message: "Project ID is required",
      });
      return;
    }
    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    const isPartOfProject = await prisma.projectMember.findFirst({
      where: {
        userId: user.id,
        projectId: projectId,
      },
    });

    if (!isPartOfProject) {
      res.status(401).json({
        message: "User is not a part of this project",
      });
      return;
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status,
        projectId: projectId as string,
        assignedToId: user.id,
        tag,
      },
    });

    // send mail to the assinged user ------------------- here (TODO) ---------
    
    sendTaskAssignedMail(user.email, user.name, title, description, `http://localhost:5173/project/${projectId}/task/${newTask.id}`)

    res.status(200).json({
      message: "Task Created Successfully & mail send successfully",
      newTask,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getAllTask = async (req: authRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId,
      },
      include: {
        tasks: true,
      },
    });
    if (!projectDetails) {
      res.status(404).json({
        message: "Project Not Found",
      });
      return;
    }
    res.status(200).json({
      message: "Task Fetched Successfully",
      tasks: projectDetails.tasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getAllUserSpecificTask = async (
  req: authRequest,
  res: Response
) => {
  try {
    const { id } = req.user?.id;
    const { projectId } = req.params;

    const isPartOfProject = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: id,
      },
    });

    if (!isPartOfProject) {
      res.status(402).json({
        message: "User is not a part of this project",
      });
      return;
    }

    const projectDetails = await prisma.project.findFirst({
      where: {
        id: projectId,
      },
      include: {
        tasks: {
          where: {
            assignedToId: id,
          },
        },
      },
    });
    if (!projectDetails) {
      res.status(404).json({
        message: "No tasks found",
      });
      return;
    }

    res.status(200).json({
      message: "Fetched the task successfully",
      tasks: projectDetails.tasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updateTaskStatus = async (req: authRequest, res: Response) => {
  const { taskId } = req.params;
  const { status } = req.body;
  const userId = req.user?.id;
  const userRole = req.user?.role; // Assuming you're passing user role in token or session

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignedTo: true },
    });

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    // Role-based status transitions
    if (userRole === "DEVELOPER") {
      if (task.assignedToId !== userId) {
        res.status(403).json({ message: "Not allowed to update this task" });
        return;
      }
      if (!["TODO", "IN_PROGRESS", "DONE"].includes(status)) {
        res
          .status(400)
          .json({ message: "Invalid status update for developer" });
        return;
      }
    }

    if (userRole === "MANAGER") {
      if (!["DONE", "IN_REVIEW", "APPROVED"].includes(status)) {
        res.status(400).json({ message: "Invalid status update for manager" });
        return;
      }
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    res.status(200).json({
      message: "Status updated",
      task: updated,
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};
