import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "kulonga-secret-key";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    roles: string[];
    role: string;
    schoolId: number | null;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token não fornecido" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      id: decoded.id,
      roles: decoded.roles || [decoded.role],
      role: decoded.role,
      schoolId: decoded.schoolId
    };
    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido ou expirado" });
  }
};

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Não autenticado" });

    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ error: "Acesso negado: permissões insuficientes" });
    }
    next();
  };
};
