
/**
 * Password strength validation utilities
 */

export interface PasswordStrength {
  score: number; // 0-4 (0 = very weak, 4 = very strong)
  feedback: string[];
  isValid: boolean;
}

export const validatePasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;
  
  if (!password) {
    return {
      score: 0,
      feedback: ['Password is required'],
      isValid: false
    };
  }
  
  // Length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }
  
  // Uppercase letter
  if (!/[A-Z]/.test(password)) {
    feedback.push('Add uppercase letters');
  } else {
    score += 1;
  }
  
  // Lowercase letter
  if (!/[a-z]/.test(password)) {
    feedback.push('Add lowercase letters');
  } else {
    score += 1;
  }
  
  // Numbers
  if (!/\d/.test(password)) {
    feedback.push('Add numbers');
  } else {
    score += 1;
  }
  
  // Special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('Add special characters (!@#$%^&* etc.)');
  } else {
    score += 1;
  }
  
  // Bonus points for length
  if (password.length >= 12) {
    score += 1;
  }
  
  // Cap score at 4
  score = Math.min(score, 4);
  
  const isValid = score >= 3 && password.length >= 8;
  
  if (feedback.length === 0) {
    if (score === 4) {
      feedback.push('Very strong password!');
    } else if (score === 3) {
      feedback.push('Strong password');
    }
  }
  
  return {
    score,
    feedback,
    isValid
  };
};

export const getPasswordStrengthColor = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return 'text-red-500';
    case 2:
      return 'text-orange-500';
    case 3:
      return 'text-yellow-500';
    case 4:
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
};

export const getPasswordStrengthText = (score: number): string => {
  switch (score) {
    case 0:
      return 'Very Weak';
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Strong';
    case 4:
      return 'Very Strong';
    default:
      return 'Unknown';
  }
};
