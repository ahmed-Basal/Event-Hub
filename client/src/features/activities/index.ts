// ============================================================
// Activities Feature — Public API
// SOLID / Clean Architecture:
// External modules only import from this public entry point
// ============================================================

// Components (reusable inside activities feature)
export * from './components';

// Hooks (SRP)
export * from './hooks';

// API Layer (DIP)
export { activitiesApi } from './api/activitiesApi';
export { activitiesKeys } from './api/activitiesKeys';
