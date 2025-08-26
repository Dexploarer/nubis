# elizaOS Security Protocols

## Security Principles

### 1. Defense in Depth
- **Multiple Security Layers**: Implement security at every level (network, application, data)
- **Fail-Safe Defaults**: Default to secure configurations
- **Principle of Least Privilege**: Grant minimal necessary permissions
- **Zero Trust Architecture**: Verify every request and connection

### 2. Data Protection
- **Encryption at Rest**: Encrypt all sensitive data in storage
- **Encryption in Transit**: Use TLS for all network communications
- **Data Minimization**: Only collect and store necessary data
- **Secure Disposal**: Properly destroy sensitive data when no longer needed

### 3. Authentication & Authorization
- **Strong Authentication**: Multi-factor authentication for sensitive operations
- **Role-Based Access Control**: Granular permissions based on user roles
- **Session Management**: Secure session handling with proper timeouts
- **Access Logging**: Log all access attempts and operations

## Authentication Patterns

### 1. JWT Token Authentication
```typescript
// src/services/auth.service.ts
import jwt from 'jsonwebtoken';
import { Service } from "@elizaos/core";
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';

export class AuthService extends Service {
  static serviceType = "auth";
  
  private readonly jwtSecret: string;
  private readonly tokenExpiry: string;
  
  constructor(runtime: IAgentRuntime) {
    super(runtime);
    this.jwtSecret = process.env.JWT_SECRET || this.generateSecureSecret();
    this.tokenExpiry = process.env.JWT_EXPIRY || '24h';
  }
  
  // Generate secure JWT secret if not provided
  private generateSecureSecret(): string {
    const secret = randomBytes(64).toString('hex');
    console.warn('JWT_SECRET not provided, generated temporary secret. Set JWT_SECRET in production.');
    return secret;
  }
  
  // Hash password securely
  async hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = randomBytes(32).toString('hex');
      scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(salt + ':' + derivedKey.toString('hex'));
      });
    });
  }
  
  // Verify password securely
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const [salt, key] = hash.split(':');
      scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(timingSafeEqual(Buffer.from(key, 'hex'), derivedKey));
      });
    });
  }
  
  // Generate JWT token
  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.tokenExpiry,
      issuer: 'elizaos-agent',
      audience: 'elizaos-users'
    });
  }
  
  // Verify JWT token
  verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'elizaos-agent',
        audience: 'elizaos-users'
      }) as TokenPayload;
      
      return decoded;
    } catch (error) {
      return null;
    }
  }
  
  // Refresh token
  refreshToken(token: string): string | null {
    const payload = this.verifyToken(token);
    if (!payload) return null;
    
    // Remove exp and iat claims for refresh
    const { exp, iat, ...refreshPayload } = payload;
    return this.generateToken(refreshPayload);
  }
}

interface TokenPayload {
  userId: string;
  username: string;
  roles: string[];
  permissions: string[];
  exp?: number;
  iat?: number;
}
```

### 2. API Key Authentication
```typescript
// src/services/api-key.service.ts
export class ApiKeyService extends Service {
  static serviceType = "api-key";
  
  private readonly apiKeys: Map<string, ApiKeyInfo>;
  
  constructor(runtime: IAgentRuntime) {
    super(runtime);
    this.apiKeys = new Map();
    this.loadApiKeys();
  }
  
  // Load API keys from environment or database
  private loadApiKeys(): void {
    const keys = process.env.API_KEYS?.split(',') || [];
    
    keys.forEach(key => {
      const [apiKey, permissions] = key.split(':');
      if (apiKey && permissions) {
        this.apiKeys.set(apiKey, {
          permissions: permissions.split('|'),
          createdAt: new Date(),
          lastUsed: null
        });
      }
    });
  }
  
  // Validate API key
  validateApiKey(apiKey: string): ApiKeyInfo | null {
    const keyInfo = this.apiKeys.get(apiKey);
    if (!keyInfo) return null;
    
    // Update last used timestamp
    keyInfo.lastUsed = new Date();
    
    return keyInfo;
  }
  
  // Check if API key has permission
  hasPermission(apiKey: string, permission: string): boolean {
    const keyInfo = this.validateApiKey(apiKey);
    if (!keyInfo) return false;
    
    return keyInfo.permissions.includes(permission) || 
           keyInfo.permissions.includes('*');
  }
  
  // Generate new API key
  generateApiKey(permissions: string[]): string {
    const apiKey = randomBytes(32).toString('hex');
    this.apiKeys.set(apiKey, {
      permissions,
      createdAt: new Date(),
      lastUsed: null
    });
    
    return apiKey;
  }
}

interface ApiKeyInfo {
  permissions: string[];
  createdAt: Date;
  lastUsed: Date | null;
}
```

### 3. OAuth2 Integration
```typescript
// src/services/oauth.service.ts
export class OAuthService extends Service {
  static serviceType = "oauth";
  
  private readonly oauthProviders: Map<string, OAuthProvider>;
  
  constructor(runtime: IAgentRuntime) {
    super(runtime);
    this.oauthProviders = new Map();
    this.initializeProviders();
  }
  
  private initializeProviders(): void {
    // Discord OAuth
    if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
      this.oauthProviders.set('discord', {
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        authorizationUrl: 'https://discord.com/api/oauth2/authorize',
        tokenUrl: 'https://discord.com/api/oauth2/token',
        userInfoUrl: 'https://discord.com/api/users/@me',
        scopes: ['identify', 'email']
      });
    }
    
    // GitHub OAuth
    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
      this.oauthProviders.set('github', {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        authorizationUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userInfoUrl: 'https://api.github.com/user',
        scopes: ['read:user', 'user:email']
      });
    }
  }
  
  // Generate OAuth authorization URL
  getAuthorizationUrl(provider: string, redirectUri: string, state: string): string {
    const oauthProvider = this.oauthProviders.get(provider);
    if (!oauthProvider) {
      throw new Error(`OAuth provider ${provider} not configured`);
    }
    
    const params = new URLSearchParams({
      client_id: oauthProvider.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: oauthProvider.scopes.join(' '),
      state: state
    });
    
    return `${oauthProvider.authorizationUrl}?${params.toString()}`;
  }
  
  // Exchange authorization code for access token
  async exchangeCodeForToken(provider: string, code: string, redirectUri: string): Promise<string> {
    const oauthProvider = this.oauthProviders.get(provider);
    if (!oauthProvider) {
      throw new Error(`OAuth provider ${provider} not configured`);
    }
    
    const response = await fetch(oauthProvider.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        client_id: oauthProvider.clientId,
        client_secret: oauthProvider.clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });
    
    if (!response.ok) {
      throw new Error(`OAuth token exchange failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.access_token;
  }
  
  // Get user information from OAuth provider
  async getUserInfo(provider: string, accessToken: string): Promise<OAuthUserInfo> {
    const oauthProvider = this.oauthProviders.get(provider);
    if (!oauthProvider) {
      throw new Error(`OAuth provider ${provider} not configured`);
    }
    
    const response = await fetch(oauthProvider.userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }
    
    const userData = await response.json();
    
    return {
      provider,
      providerUserId: userData.id,
      username: userData.username || userData.login,
      email: userData.email,
      avatar: userData.avatar_url,
      profile: userData
    };
  }
}

interface OAuthProvider {
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scopes: string[];
}

interface OAuthUserInfo {
  provider: string;
  providerUserId: string;
  username: string;
  email?: string;
  avatar?: string;
  profile: Record<string, any>;
}
```

## Authorization & Access Control

### 1. Role-Based Access Control (RBAC)
```typescript
// src/services/rbac.service.ts
export class RBACService extends Service {
  static serviceType = "rbac";
  
  private readonly roles: Map<string, Role>;
  private readonly userRoles: Map<string, Set<string>>;
  
  constructor(runtime: IAgentRuntime) {
    super(runtime);
    this.roles = new Map();
    this.userRoles = new Map();
    this.initializeDefaultRoles();
  }
  
  private initializeDefaultRoles(): void {
    // Admin role with all permissions
    this.roles.set('admin', {
      name: 'admin',
      permissions: ['*'],
      description: 'Full system access'
    });
    
    // Moderator role
    this.roles.set('moderator', {
      name: 'moderator',
      permissions: [
        'user:read',
        'user:update',
        'content:read',
        'content:moderate',
        'community:manage'
      ],
      description: 'Community moderation access'
    });
    
    // User role
    this.roles.set('user', {
      name: 'user',
      permissions: [
        'user:read:own',
        'user:update:own',
        'content:read',
        'content:create:own',
        'content:update:own',
        'content:delete:own'
      ],
      description: 'Standard user access'
    });
  }
  
  // Assign role to user
  assignRole(userId: string, roleName: string): boolean {
    const role = this.roles.get(roleName);
    if (!role) return false;
    
    if (!this.userRoles.has(userId)) {
      this.userRoles.set(userId, new Set());
    }
    
    this.userRoles.get(userId)!.add(roleName);
    return true;
  }
  
  // Remove role from user
  removeRole(userId: string, roleName: string): boolean {
    const userRoles = this.userRoles.get(userId);
    if (!userRoles) return false;
    
    return userRoles.delete(roleName);
  }
  
  // Check if user has permission
  hasPermission(userId: string, permission: string): boolean {
    const userRoles = this.userRoles.get(userId);
    if (!userRoles) return false;
    
    for (const roleName of userRoles) {
      const role = this.roles.get(roleName);
      if (role && (role.permissions.includes('*') || role.permissions.includes(permission))) {
        return true;
      }
    }
    
    return false;
  }
  
  // Check if user has any of the permissions
  hasAnyPermission(userId: string, permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(userId, permission));
  }
  
  // Check if user has all permissions
  hasAllPermissions(userId: string, permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(userId, permission));
  }
  
  // Get user roles
  getUserRoles(userId: string): string[] {
    const userRoles = this.userRoles.get(userId);
    return userRoles ? Array.from(userRoles) : [];
  }
  
  // Get user permissions
  getUserPermissions(userId: string): string[] {
    const permissions = new Set<string>();
    const userRoles = this.userRoles.get(userId);
    
    if (userRoles) {
      for (const roleName of userRoles) {
        const role = this.roles.get(roleName);
        if (role) {
          role.permissions.forEach(permission => permissions.add(permission));
        }
      }
    }
    
    return Array.from(permissions);
  }
}

interface Role {
  name: string;
  permissions: string[];
  description: string;
}
```

### 2. Permission-Based Access Control
```typescript
// src/middleware/permission.middleware.ts
export const requirePermission = (permission: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        res.status = 401;
        res.json = { error: 'Authentication required' };
        return;
      }
      
      const authService = req.runtime.getService<AuthService>('auth');
      const payload = authService.verifyToken(token);
      
      if (!payload) {
        res.status = 401;
        res.json = { error: 'Invalid token' };
        return;
      }
      
      const rbacService = req.runtime.getService<RBACService>('rbac');
      if (!rbacService.hasPermission(payload.userId, permission)) {
        res.status = 403;
        res.json = { error: 'Insufficient permissions' };
        return;
      }
      
      req.user = payload;
      next();
    } catch (error) {
      res.status = 500;
      res.json = { error: 'Internal server error' };
    }
  };
};

// Usage in routes
routes: [
  {
    name: "admin-users",
    path: "/api/admin/users",
    type: "GET",
    middleware: [requirePermission('admin:users:read')],
    handler: async (req, res) => {
      // Handler implementation
    }
  }
]
```

## Data Protection

### 1. Encryption Service
```typescript
// src/services/encryption.service.ts
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';

export class EncryptionService extends Service {
  static serviceType = "encryption";
  
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly saltLength = 64;
  private readonly tagLength = 16;
  
  constructor(runtime: IAgentRuntime) {
    super(runtime);
  }
  
  // Generate encryption key from password
  private async deriveKey(password: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      scrypt(password, salt, this.keyLength, (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey);
      });
    });
  }
  
  // Encrypt data
  async encrypt(data: string, password: string): Promise<string> {
    const salt = randomBytes(this.saltLength);
    const iv = randomBytes(this.ivLength);
    const key = await this.deriveKey(password, salt);
    
    const cipher = createCipheriv(this.algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine salt + iv + tag + encrypted data
    const result = Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')]);
    return result.toString('base64');
  }
  
  // Decrypt data
  async decrypt(encryptedData: string, password: string): Promise<string> {
    const data = Buffer.from(encryptedData, 'base64');
    
    const salt = data.subarray(0, this.saltLength);
    const iv = data.subarray(this.saltLength, this.saltLength + this.ivLength);
    const tag = data.subarray(this.saltLength + this.ivLength, this.saltLength + this.ivLength + this.tagLength);
    const encrypted = data.subarray(this.saltLength + this.ivLength + this.tagLength);
    
    const key = await this.deriveKey(password, salt);
    
    const decipher = createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  // Hash sensitive data (one-way)
  async hash(data: string, salt?: Buffer): Promise<{ hash: string; salt: Buffer }> {
    const useSalt = salt || randomBytes(this.saltLength);
    
    return new Promise((resolve, reject) => {
      scrypt(data, useSalt, this.keyLength, (err, derivedKey) => {
        if (err) reject(err);
        resolve({
          hash: derivedKey.toString('hex'),
          salt: useSalt
        });
      });
    });
  }
  
  // Verify hash
  async verifyHash(data: string, hash: string, salt: Buffer): Promise<boolean> {
    const { hash: computedHash } = await this.hash(data, salt);
    return computedHash === hash;
  }
}
```

### 2. Secure Data Storage
```typescript
// src/services/secure-storage.service.ts
export class SecureStorageService extends Service {
  static serviceType = "secure-storage";
  
  private readonly encryptionService: EncryptionService;
  
  constructor(runtime: IAgentRuntime) {
    super(runtime);
    this.encryptionService = runtime.getService<EncryptionService>('encryption')!;
  }
  
  // Store sensitive data encrypted
  async storeSecureData(key: string, data: any, encryptionKey: string): Promise<void> {
    const serializedData = JSON.stringify(data);
    const encryptedData = await this.encryptionService.encrypt(serializedData, encryptionKey);
    
    // Store encrypted data in database
    await this.runtime.getDatabase().createMemory({
      entityId: 'system',
      content: { text: encryptedData },
      metadata: {
        type: 'SECURE_DATA',
        key: key,
        encrypted: true,
        createdAt: new Date().toISOString()
      }
    });
  }
  
  // Retrieve and decrypt sensitive data
  async getSecureData(key: string, encryptionKey: string): Promise<any> {
    const memories = await this.runtime.getDatabase().getMemories({
      entityId: 'system',
      metadata: { key: key, type: 'SECURE_DATA' }
    });
    
    if (memories.length === 0) {
      throw new Error(`Secure data not found: ${key}`);
    }
    
    const encryptedData = memories[0].content.text;
    const decryptedData = await this.encryptionService.decrypt(encryptedData, encryptionKey);
    
    return JSON.parse(decryptedData);
  }
  
  // Delete secure data
  async deleteSecureData(key: string): Promise<void> {
    const memories = await this.runtime.getDatabase().getMemories({
      entityId: 'system',
      metadata: { key: key, type: 'SECURE_DATA' }
    });
    
    for (const memory of memories) {
      await this.runtime.getDatabase().deleteMemory(memory.id!);
    }
  }
}
```

## Input Validation & Sanitization

### 1. Input Validation Service
```typescript
// src/services/validation.service.ts
import { z } from 'zod';

export class ValidationService extends Service {
  static serviceType = "validation";
  
  // User input validation schemas
  private readonly userSchema = z.object({
    username: z.string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be less than 30 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
    email: z.string()
      .email('Invalid email format')
      .max(255, 'Email too long'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    age: z.number()
      .min(13, 'Must be at least 13 years old')
      .max(120, 'Invalid age')
      .optional()
  });
  
  // Content validation schemas
  private readonly contentSchema = z.object({
    title: z.string()
      .min(1, 'Title is required')
      .max(200, 'Title too long'),
    body: z.string()
      .min(1, 'Content is required')
      .max(10000, 'Content too long'),
    tags: z.array(z.string())
      .max(10, 'Too many tags')
      .optional()
  });
  
  // Validate user input
  validateUserInput(input: unknown): UserInput {
    return this.userSchema.parse(input);
  }
  
  // Validate content
  validateContent(input: unknown): ContentInput {
    return this.contentSchema.parse(input);
  }
  
  // Sanitize HTML content
  sanitizeHtml(html: string): string {
    // Remove potentially dangerous HTML tags and attributes
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<[^>]*>/g, '');
  }
  
  // Validate and sanitize file uploads
  validateFileUpload(file: FileUpload): FileValidationResult {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/pdf'];
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large' };
    }
    
    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'File type not allowed' };
    }
    
    // Check file extension
    const extension = file.originalname.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'txt', 'pdf'];
    
    if (!extension || !allowedExtensions.includes(extension)) {
      return { valid: false, error: 'File extension not allowed' };
    }
    
    return { valid: true };
  }
}

interface UserInput {
  username: string;
  email: string;
  password: string;
  age?: number;
}

interface ContentInput {
  title: string;
  body: string;
  tags?: string[];
}

interface FileUpload {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

interface FileValidationResult {
  valid: boolean;
  error?: string;
}
```

## Security Headers & CORS

### 1. Security Middleware
```typescript
// src/middleware/security.middleware.ts
export const securityHeaders = (req: any, res: any, next: any) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  next();
};

export const corsMiddleware = (req: any, res: any, next: any) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status = 200;
    res.end();
    return;
  }
  
  next();
};

export const rateLimitMiddleware = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: any, res: any, next: any) => {
    const clientId = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    
    const clientRequests = requests.get(clientId);
    
    if (!clientRequests || now > clientRequests.resetTime) {
      requests.set(clientId, { count: 1, resetTime: now + windowMs });
    } else if (clientRequests.count >= maxRequests) {
      res.status = 429;
      res.json = { error: 'Too many requests' };
      return;
    } else {
      clientRequests.count++;
    }
    
    next();
  };
};
```

## Audit Logging

### 1. Audit Service
```typescript
// src/services/audit.service.ts
export class AuditService extends Service {
  static serviceType = "audit";
  
  // Log security events
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const auditLog = {
      timestamp: new Date().toISOString(),
      eventType: 'SECURITY',
      severity: event.severity,
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: event.details,
      success: event.success
    };
    
    // Store in audit log
    await this.runtime.getDatabase().createMemory({
      entityId: 'system',
      content: { text: JSON.stringify(auditLog) },
      metadata: {
        type: 'AUDIT_LOG',
        category: 'SECURITY',
        severity: event.severity,
        timestamp: auditLog.timestamp
      }
    });
    
    // Log to console for immediate visibility
    if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
      console.error('SECURITY ALERT:', auditLog);
    }
  }
  
  // Log authentication events
  async logAuthEvent(event: AuthEvent): Promise<void> {
    await this.logSecurityEvent({
      eventType: 'AUTH',
      severity: event.success ? 'LOW' : 'MEDIUM',
      userId: event.userId,
      action: event.action,
      resource: 'authentication',
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: event.details,
      success: event.success
    });
  }
  
  // Log access control events
  async logAccessEvent(event: AccessEvent): Promise<void> {
    await this.logSecurityEvent({
      eventType: 'ACCESS',
      severity: event.success ? 'LOW' : 'HIGH',
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: event.details,
      success: event.success
    });
  }
  
  // Get audit logs with filtering
  async getAuditLogs(filters: AuditFilters): Promise<AuditLog[]> {
    const memories = await this.runtime.getDatabase().getMemories({
      entityId: 'system',
      metadata: { type: 'AUDIT_LOG' }
    });
    
    let logs = memories.map(memory => JSON.parse(memory.content.text));
    
    // Apply filters
    if (filters.eventType) {
      logs = logs.filter(log => log.eventType === filters.eventType);
    }
    
    if (filters.severity) {
      logs = logs.filter(log => log.severity === filters.severity);
    }
    
    if (filters.userId) {
      logs = logs.filter(log => log.userId === filters.userId);
    }
    
    if (filters.startDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }
    
    if (filters.endDate) {
      logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    }
    
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

interface SecurityEvent {
  eventType: 'SECURITY' | 'AUTH' | 'ACCESS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  success: boolean;
}

interface AuthEvent {
  userId: string;
  action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_CHANGE' | 'PASSWORD_RESET';
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  success: boolean;
}

interface AccessEvent {
  userId: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  success: boolean;
}

interface AuditFilters {
  eventType?: string;
  severity?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

interface AuditLog {
  timestamp: string;
  eventType: string;
  severity: string;
  userId: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  success: boolean;
}
```

## Security Best Practices

### 1. Configuration Security
```typescript
// config/security.ts
export const securityConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || (() => {
      throw new Error('JWT_SECRET must be set in production');
    })(),
    expiresIn: process.env.JWT_EXPIRY || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
    issuer: 'elizaos-agent',
    audience: 'elizaos-users'
  },
  
  // Password Policy
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
  },
  
  // Session Configuration
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  
  // CORS Configuration
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    allowCredentials: true,
    maxAge: 86400 // 24 hours
  },
  
  // Security Headers
  headers: {
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    csp: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
};
```

### 2. Security Checklist
```typescript
// src/utils/security-checklist.ts
export class SecurityChecklist {
  static async runSecurityChecks(runtime: IAgentRuntime): Promise<SecurityCheckResult[]> {
    const checks = [
      this.checkEnvironmentVariables(),
      this.checkDatabaseSecurity(),
      this.checkAuthentication(),
      this.checkAuthorization(),
      this.checkInputValidation(),
      this.checkEncryption(),
      this.checkAuditLogging(),
      this.checkRateLimiting(),
      this.checkCORS(),
      this.checkSecurityHeaders()
    ];
    
    const results = await Promise.allSettled(checks.map(check => check(runtime)));
    
    return results.map((result, index) => ({
      check: ['Environment Variables', 'Database Security', 'Authentication', 'Authorization', 
              'Input Validation', 'Encryption', 'Audit Logging', 'Rate Limiting', 'CORS', 'Security Headers'][index],
      status: result.status === 'fulfilled' ? 'PASS' : 'FAIL',
      details: result.status === 'fulfilled' ? result.value : result.reason
    }));
  }
  
  private static async checkEnvironmentVariables(): Promise<string> {
    const required = ['JWT_SECRET', 'ENCRYPTION_KEY', 'DATABASE_URL'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      return `Missing required environment variables: ${missing.join(', ')}`;
    }
    
    return 'All required environment variables are set';
  }
  
  private static async checkDatabaseSecurity(): Promise<string> {
    // Check if database connection uses SSL in production
    if (process.env.NODE_ENV === 'production') {
      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl && !dbUrl.includes('sslmode=require')) {
        return 'Database connection should use SSL in production';
      }
    }
    
    return 'Database security configuration is adequate';
  }
  
  // Additional security checks...
}

interface SecurityCheckResult {
  check: string;
  status: 'PASS' | 'FAIL';
  details: string;
}
```

This comprehensive security protocol ensures elizaOS applications are built with security-first principles, protecting against common vulnerabilities and providing robust authentication, authorization, and data protection mechanisms.
