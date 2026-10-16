export interface Project {
  id: string
  name: string
  year: string
  role: string
  tags: [string, string, string]
  gradient: string
  image?: string
}

export const projects: Project[] = [
  {
    id: 'orbit',
    name: 'ORBIT',
    year: '2026',
    role: 'DESIGN & DEV',
    tags: ['THREE.JS', 'WEBGL', 'DESIGN SYSTEM'],
    gradient:
      'radial-gradient(ellipse at 70% 30%, #13ff00 0%, #064c24 35%, #000000 80%)',
  },
  {
    id: 'meridian',
    name: 'MERIDIAN',
    year: '2026',
    role: 'CREATIVE DEV',
    tags: ['GSAP MOTION', 'SHADERS', 'ARCHITECTURE'],
    gradient:
      'linear-gradient(135deg, #0f8f4b 0%, #064c24 45%, #111111 100%)',
  },
  {
    id: 'northline',
    name: 'NORTHLINE',
    year: '2025',
    role: 'BRAND & PLATFORM',
    tags: ['EDITORIAL', 'TYPOGRAPHY', 'ECOMMERCE'],
    gradient:
      'radial-gradient(circle at 30% 70%, #ffffff 0%, #333333 30%, #000000 75%)',
  },
  {
    id: 'halcyon',
    name: 'HALCYON',
    year: '2025',
    role: 'INTERACTION LAB',
    tags: ['SPATIAL UI', 'CANVAS 2D', 'IDENTITY'],
    gradient:
      'linear-gradient(160deg, #13ff00 0%, #0f8f4b 25%, #050505 75%)',
  },
]

