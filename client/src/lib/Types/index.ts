export type Category = 'BackEnd' | 'CyberSecurity' | 'FrontEnd' | 'DataAnalysis' | 'DevOps';

export type ActivityLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';

export interface Activity {
    id: string;
    title: string;
    slug: string;
    date: string;
    description: string;
    category: Category | string;
    city: string;
    venue: string;
    latitude: number;
    longitude: number;
    isCancelled: boolean;
    level?: ActivityLevel | string;
    tags?: string[];
}