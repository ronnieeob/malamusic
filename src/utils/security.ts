import { AES, enc } from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'metal-aloud-secret-key-2024';

export class SecurityManager {
  private static instance: SecurityManager;
  private readonly installationId: string;
  private readonly xssFilter = /[<>]/g;
  private readonly sqlFilter = /['";]/g;
  private readonly ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'metal-aloud-secret-key-2024';
  private readonly LICENSE_KEY = import.meta.env.VITE_LICENSE_KEY;
  private readonly DOMAIN_WHITELIST = ['srv685290.hstgr.cloud'];

  private constructor() {
    this.installationId = '';
    this.initializeInstallationId();
  }

  public validateDomain(domain: string): boolean {
    return this.DOMAIN_WHITELIST.includes(domain);
  }

  public validateLicense(): boolean {
    if (!this.LICENSE_KEY) return false;
    // Add license validation logic
    return true;
  }

  public validateInstallation(): boolean {
    return this.validateDomain(window.location.hostname) && 
           this.validateLicense();
  }

  private async initializeInstallationId() {
    this.installationId = await this.generateInstallationId();
  }

  // Sanitize input to prevent XSS
  public sanitizeInput(input: string): string {
    return input.replace(this.xssFilter, '');
  }

  // Sanitize SQL input
  public sanitizeSqlInput(input: string): string {
    return input.replace(this.sqlFilter, '');
  }

  // Encrypt sensitive data
  public encryptData(data: string): string {
    return AES.encrypt(data, ENCRYPTION_KEY).toString();
  }

  // Decrypt sensitive data
  public decryptData(encryptedData: string): string {
    const bytes = AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(enc.Utf8);
  }

  // Generate secure random token
  public generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  // Validate password strength
  public validatePassword(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength &&
           hasUpperCase &&
           hasLowerCase &&
           hasNumbers &&
           hasSpecialChar;
  }

  // Rate limiting check
  private rateLimits: Map<string, number[]> = new Map();
  
  public checkRateLimit(key: string, limit: number, window: number): boolean {
    const now = Date.now();
    const timestamps = this.rateLimits.get(key) || [];
    
    // Remove old timestamps
    const validTimestamps = timestamps.filter(t => now - t < window);
    
    if (validTimestamps.length >= limit) {
      return false;
    }
    
    validTimestamps.push(now);
    this.rateLimits.set(key, validTimestamps);
    return true;
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  private async generateInstallationId(): Promise<string> {
    const timestamp = Date.now().toString();
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const random = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    
    const encoder = new TextEncoder();
    const data = encoder.encode(`${timestamp}-${random}-${window.location.hostname}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  public validateInstallation(): boolean {
    try {
      // Verify domain
      const allowedDomain = 'srv685290.hstgr.cloud';
      const currentDomain = window.location.hostname;
      
      // Prevent DNS rebinding attacks
      if (!currentDomain.endsWith(allowedDomain)) {
        console.error('Invalid domain');
        return false;
      }

      // Check for secure context
      if (window.isSecureContext === false) {
        console.error('Insecure context');
        return false;
      }

      // Verify Content Security Policy
      if (!document.head.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
        console.error('Missing CSP');
        return false;
      }
      if (currentDomain !== allowedDomain) {
        console.error('Invalid domain');
        return false;
      }

      // Additional security checks can be added here
      return true;
    } catch (err) {
      console.error('Security validation failed:', err);
      return false;
    }
  }

  public getInstallationId(): string {
    return this.installationId;
  }
}