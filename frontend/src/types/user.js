// src/types/user.js
export const UserRole = {
    USER: 'USER',
    HOST: 'HOST',
    SUPER_ADMIN: 'SUPER_ADMIN'
};

// Optional: Add type checking if using prop-types
export const userShape = {
    id: 'number',
    email: 'string',
    username: 'string',
    role: 'string',
    is_active: 'boolean',
    is_verified: 'boolean'
};