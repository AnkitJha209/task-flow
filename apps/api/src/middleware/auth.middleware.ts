import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
dotenv.config();

export interface authRequest extends Request {
    user?: jwt.JwtPayload
}

export const verifyToken = async (req: authRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
        
        if (!decoded) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
        console.log(decoded.userId);
        // Extract user information from token
        req.user = {
            id: decoded.userId,
            role: decoded.role
        };

        next();

    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
        return;
    }

}

export const verifyDeveloper = async (req: authRequest, res: Response, next: NextFunction) => {
    try {
        if (req.user?.role !== 'DEVELOPER') {
            res.status(403).json({ message: 'Access denied. Developer role required.' });
            return;
        }
        next();
    } catch (error) {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
}

export const verifyManager = async (req: authRequest, res: Response, next: NextFunction) => {
    try {
        if (req.user?.role !== 'MANAGER') {
            res.status(403).json({ message: 'Access denied. Manager role required.' });
            return;
        }
        next();
    } catch (error) {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
}

export const verifyAdmin = async (req: authRequest, res: Response, next: NextFunction) => {
    try {
        if (req.user?.role !== 'admin') {
            res.status(403).json({ message: 'Access denied. Admin role required.' });
            return;
        }
        next();
    } catch (error) {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
}
