
import React from 'react';
import { validatePasswordStrength, getPasswordStrengthColor, getPasswordStrengthText } from '@/utils/security/passwordValidation';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  className = ""
}) => {
  const strength = validatePasswordStrength(password);
  
  if (!password) {
    return null;
  }
  
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Strength Bar */}
      <div className="flex space-x-1">
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-2 flex-1 rounded-sm transition-colors ${
              level < strength.score
                ? strength.score <= 1
                  ? 'bg-red-500'
                  : strength.score <= 2
                  ? 'bg-orange-500'
                  : strength.score <= 3
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      
      {/* Strength Text */}
      <div className={`text-sm font-medium ${getPasswordStrengthColor(strength.score)}`}>
        {getPasswordStrengthText(strength.score)}
      </div>
      
      {/* Feedback */}
      {strength.feedback.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-1">
          {strength.feedback.map((feedback, index) => (
            <li key={index} className="flex items-center">
              <span className="mr-1">•</span>
              {feedback}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
