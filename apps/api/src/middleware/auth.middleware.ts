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
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
        
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Extract user information from token
        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        next();

    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }

}

export const verifyDeveloper = async (req: authRequest, res: Response, next: NextFunction) => {
    try {
        if (req.user?.role !== 'developer') {
            return res.status(403).json({ message: 'Access denied. Developer role required.' });
        }
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Access denied' });
    }
}

export const verifyManager = async (req: authRequest, res: Response, next: NextFunction) => {
    try {
        if (req.user?.role !== 'manager') {
            return res.status(403).json({ message: 'Access denied. Manager role required.' });
        }
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Access denied' });
    }
}

export const verifyAdmin = async (req: authRequest, res: Response, next: NextFunction) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin role required.' });
        }
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Access denied' });
    }
}
